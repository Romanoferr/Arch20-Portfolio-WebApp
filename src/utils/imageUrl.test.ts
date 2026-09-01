import { describe, it, expect, afterEach, vi } from 'vitest'

const OBJECT_KEY = 'projects/123/original/abc.jpg'

async function loadImageUrl(env: Record<string, string>) {
  // Define as variáveis de ambiente ANTES de importar o módulo (que lê
  // import.meta.env no topo). O Vitest expõe variáveis VITE_* via process.env.
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value
  }
  vi.resetModules()
  const mod = await import('@/lib/r2/config')
  const urlMod = await import('@/utils/imageUrl')
  return { config: mod, imageUrl: urlMod }
}

describe('getImageUrl (entrega otimizada)', () => {
  afterEach(() => {
    delete process.env.VITE_IMG_BASE_URL
    delete process.env.VITE_R2_PUBLIC_URL
    vi.resetModules()
  })

  it('gera URL com preset quando VITE_IMG_BASE_URL está configurado', async () => {
    const { config } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(config.getImageUrl(OBJECT_KEY, 'gallery')).toBe(
      'https://images.example.test/projects/123/original/abc.jpg?preset=gallery',
    )
  })

  it('usa preset default gallery quando não informado', async () => {
    const { config } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(config.getImageUrl(OBJECT_KEY)).toBe(
      'https://images.example.test/projects/123/original/abc.jpg?preset=gallery',
    )
  })

  it('aplica o preset informado', async () => {
    const { config } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(config.getImageUrl(OBJECT_KEY, 'thumbnail')).toBe(
      'https://images.example.test/projects/123/original/abc.jpg?preset=thumbnail',
    )
  })

  it('retorna URL absoluta como está (compatibilidade com heróis remotos)', async () => {
    const { config } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(config.getImageUrl('https://unsplash.com/x.jpg', 'gallery')).toBe(
      'https://unsplash.com/x.jpg',
    )
  })

  it('faz fallback para a URL original do R2 quando VITE_IMG_BASE_URL não existe', async () => {
    const { config } = await loadImageUrl({
      VITE_R2_PUBLIC_URL: 'https://origin.example.test',
    })
    expect(config.getImageUrl(OBJECT_KEY, 'gallery')).toBe(
      'https://origin.example.test/projects/123/original/abc.jpg',
    )
  })

  it('retorna objectKey quando nenhuma config existe (dev)', async () => {
    const { config } = await loadImageUrl({})
    expect(config.getImageUrl(OBJECT_KEY, 'gallery')).toBe(OBJECT_KEY)
  })

  it('retorna string vazia para objectKey vazio', async () => {
    const { config } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(config.getImageUrl('', 'gallery')).toBe('')
  })
})

describe('buildSrcSet (variantes responsivas)', () => {
  afterEach(() => {
    delete process.env.VITE_IMG_BASE_URL
    delete process.env.VITE_R2_PUBLIC_URL
    vi.resetModules()
  })

  it('gera srcset com presets e larguras correspondentes', async () => {
    const { imageUrl } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    const srcset = imageUrl.buildSrcSet(OBJECT_KEY, ['mobile', 'tablet', 'gallery'])
    expect(srcset).toBe(
      'https://images.example.test/projects/123/original/abc.jpg?preset=mobile 800w, ' +
        'https://images.example.test/projects/123/original/abc.jpg?preset=tablet 1200w, ' +
        'https://images.example.test/projects/123/original/abc.jpg?preset=gallery 1600w',
    )
  })

  it('ignora presets inválidos no srcSet (whitelist fechada)', async () => {
    const { imageUrl } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    // @ts-expect-error passando valor inválido de propósito
    const srcset = imageUrl.buildSrcSet(OBJECT_KEY, ['mobile', 'width=9999', 'gallery'])
    expect(srcset).not.toContain('width=9999')
    expect(srcset).toContain('preset=mobile')
    expect(srcset).toContain('preset=gallery')
  })

  it('retorna string vazia para objectKey vazio', async () => {
    const { imageUrl } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(imageUrl.buildSrcSet('', ['mobile'])).toBe('')
  })
})

describe('imageUrl (atalho)', () => {
  afterEach(() => {
    delete process.env.VITE_IMG_BASE_URL
    delete process.env.VITE_R2_PUBLIC_URL
    vi.resetModules()
  })

  it('gera URL com preset default gallery', async () => {
    const { imageUrl } = await loadImageUrl({
      VITE_IMG_BASE_URL: 'https://images.example.test',
    })
    expect(imageUrl.imageUrl(OBJECT_KEY)).toBe(
      'https://images.example.test/projects/123/original/abc.jpg?preset=gallery',
    )
  })
})