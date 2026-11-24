// Assert that every route this plugin registers sits behind DSH's own
// connection fence (ctx.connection.requestRejection): a refused caller must
// never reach the route body, and an admitted one must still work.
// Usage: node scripts/test-access.mjs
import assert from 'node:assert/strict'
import { apply } from '../index.js'

const PREFIX = '/api/diagram-leapavid'

function makeResponse() {
  return {
    status: 0,
    headers: null,
    body: '',
    headersSent: false,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers
      this.headersSent = true
    },
    end(chunk) {
      this.body += chunk == null ? '' : String(chunk)
    },
  }
}

function makeRequest({ method = 'GET', url = PREFIX + '/health', body = null } = {}) {
  const req = { method, url, headers: {} }
  const chunks = body == null ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))]
  req[Symbol.asyncIterator] = async function* () {
    yield* chunks
  }
  return req
}

// Mount the real plugin against a stub Context and capture the registered
// prefix handler, so the assertions exercise index.js itself.
function mount(rejection) {
  let handler = null
  const ctx = {
    connection: {
      requestRejection: () => rejection,
    },
    webServer: {
      register(route) {
        handler = route.handler
        return () => {}
      },
    },
    effect(fn) {
      const dispose = fn()
      return () => {
        if (typeof dispose === 'function') dispose()
      }
    },
    logger: { warn() {} },
  }
  apply(ctx)
  assert.ok(handler, 'apply() must register the /api/diagram-leapavid handler')
  return handler
}

const probes = [
  { label: 'GET /health', request: { method: 'GET', url: PREFIX + '/health' } },
  { label: 'GET /palettes', request: { method: 'GET', url: PREFIX + '/palettes' } },
  {
    label: 'POST /prompt',
    request: {
      method: 'POST',
      url: PREFIX + '/prompt',
      body: { slug: 'flowchart', name: '测试图', content: 'A -> B' },
    },
  },
  { label: 'GET unknown tail', request: { method: 'GET', url: PREFIX + '/nope' } },
]

// 1. A refused caller is answered by the fence alone: no payload from any route.
for (const status of [401, 403]) {
  for (const probe of probes) {
    const res = makeResponse()
    await mount(status)(makeRequest(probe.request), res)
    assert.equal(res.status, status, probe.label + ': refusal status must be ' + status)
    const payload = JSON.parse(res.body)
    assert.equal(payload.ok, false, probe.label + ': refusal payload')
    assert.equal(payload.error, status === 401 ? '需要登录 DSH 才能使用图表工坊接口' : '请求来源未被 DSH 接受')
    assert.equal(payload.prompt, undefined, probe.label + ': prompt must not be composed for a refused caller')
    assert.equal(payload.palettes, undefined, probe.label + ': palettes must not be served to a refused caller')
    assert.equal(payload.specs, undefined, probe.label + ': health payload must not leak')
  }
}

// 2. An admitted caller keeps the previous behaviour, route by route.
const health = makeResponse()
await mount(undefined)(makeRequest(probes[0].request), health)
assert.equal(health.status, 200)
const healthBody = JSON.parse(health.body)
assert.equal(healthBody.ok, true)
assert.ok(Array.isArray(healthBody.specs) && healthBody.specs.length > 0, 'health still lists the spec tiers')

const palettes = makeResponse()
await mount(undefined)(makeRequest(probes[1].request), palettes)
assert.equal(palettes.status, 200)
assert.ok(Array.isArray(JSON.parse(palettes.body).palettes), 'palettes still served to an admitted caller')

const prompt = makeResponse()
await mount(undefined)(makeRequest(probes[2].request), prompt)
assert.equal(prompt.status, 200)
const promptBody = JSON.parse(prompt.body)
assert.ok(promptBody.prompt && promptBody.prompt.includes('执行契约'), 'admitted POST still composes the prompt')
assert.equal(promptBody.slug, 'flowchart')

// 3. An admitted caller still gets the route's own 404s.
const missing = makeResponse()
await mount(undefined)(makeRequest(probes[3].request), missing)
assert.equal(missing.status, 404)

console.log('ok: ' + probes.length + ' probes fenced for 401/403, admitted requests still served')
