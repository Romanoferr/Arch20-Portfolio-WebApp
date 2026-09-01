import { describe, it, expect, afterEach, vi } from 'vitest'

// Importa o Worker de image delivery.
const worker = (await import('./index.js')).default

const ORIGIN = 'https://origin.example.test'

function makeRequest(url, method = 'GET') {
  return new Request(url, { method })
}

function mockFetchOk() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      return new Response('image-bytes', {
        status: 200,
        headers: { 'Content-Type': 'image/webp' },
      })
    }),
  )
}

function mockFetchNotFound() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response('not found', { status: 404 })),
  )
}

describe('Worker de image delivery', () => {
  const env = { ORIGIN_BASE_URL: ORIGIN }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejeita método não-GET', async () => {
    const res = await worker.fetch(makeRequest('https://img.br/projects/1/original/a.jpg?preset=gallery', 'POST'), env)
    expect(res.status).toBe(405)
  })

  it('rejeita objectKey inválido (URL externa)', async () => {
    const res = await worker.fetch(
      makeRequest('https://img.br/https://evil.com/x.jpg?preset=gallery'),
      env,
    )
    expect(res.status).toBe(400)
  })

  it('rejeita objectKey fora dos prefixos permitidos', async () => {
    const res = await worker.fetch(
      makeRequest('https://img.br/etc/passwd?preset=gallery'),
      env,
    )
    expect(res.status).toBe(400)
  })

  it('rejeita preset ausente', async () => {
    const res = await worker.fetch(
      makeRequest('https://img.br/projects/1/original/abc.jpg'),
      env,
    )
    expect(res.status).toBe(400)
  })

  it('rejeita preset inválido (whitelist fechada)', async () => {
    const res = await worker.fetch(
      makeRequest('https://img.br/projects/1/original/abc.jpg?preset=width=9999'),
      env,
    )
    expect(res.status).toBe(400)
  })

  it('aceita objectKey válido e aplica transformação', async () => {
    mockFetchOk()
    const res = await worker.fetch(
      makeRequest('https://img.br/projects/1/original/abc.jpg?preset=gallery'),
      env,
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toContain('immutable')
    // Verifica que o fetch interno apontou para a origem R2 com cf.image.
    const fetchMock = vi.mocked(fetch)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url.url).toBe(`${ORIGIN}/projects/1/original/abc.jpg`)
    expect(opts.cf.image).toMatchObject({
      width: 1600,
      quality: 82,
      fit: 'scale-down',
      format: 'auto',
    })
  })

  it('retorna 404 quando a imagem não existe', async () => {
    mockFetchNotFound()
    const res = await worker.fetch(
      makeRequest('https://img.br/projects/1/original/abc.jpg?preset=gallery'),
      env,
    )
    expect(res.status).toBe(404)
  })

  it('aceita heroes com preset hero', async () => {
    mockFetchOk()
    const res = await worker.fetch(
      makeRequest('https://img.br/heroes/hero-home.jpg?preset=hero'),
      env,
    )
    expect(res.status).toBe(200)
    const fetchMock = vi.mocked(fetch)
    const [url, opts] = fetchMock.mock.calls[0]
    expect(url.url).toBe(`${ORIGIN}/heroes/hero-home.jpg`)
    expect(opts.cf.image.width).toBe(1920)
  })
})