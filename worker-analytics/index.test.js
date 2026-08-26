import { describe, it, expect } from 'vitest'

// Importa as funções puras do Worker de analytics para testes unitários.
const { _test } = await import('./index.js')

describe('isOriginAllowed', () => {
  const env = {
    ALLOWED_ORIGINS: 'https://brunacamara-arq.com.br,http://localhost:5173',
  }

  it('permite origin explícita da allowlist', () => {
    expect(_test.isOriginAllowed(env, 'https://brunacamara-arq.com.br')).toBe(true)
    expect(_test.isOriginAllowed(env, 'http://localhost:5173')).toBe(true)
  })

  it('permite domínio próprio com www (subdomínio)', () => {
    expect(_test.isOriginAllowed(env, 'https://www.brunacamara-arq.com.br')).toBe(true)
  })

  it('permite qualquer subdomínio do domínio próprio', () => {
    expect(_test.isOriginAllowed(env, 'https://preview.brunacamara-arq.com.br')).toBe(true)
  })

  it('rejeita origins não relacionadas e vazias', () => {
    expect(_test.isOriginAllowed(env, 'https://evil.com')).toBe(false)
    expect(_test.isOriginAllowed(env, 'https://brunacamara-arq.com.br.evil.com')).toBe(false)
    expect(_test.isOriginAllowed(env, '')).toBe(false)
    expect(_test.isOriginAllowed(env, null)).toBe(false)
  })

  it('permite subdomínio mesmo quando a allowlist só tem o apex', () => {
    const envApex = { ALLOWED_ORIGINS: 'https://brunacamara-arq.com.br' }
    expect(_test.isOriginAllowed(envApex, 'https://www.brunacamara-arq.com.br')).toBe(true)
  })
})

describe('classifyUserAgent', () => {
  it('detecta desktop/Chrome/Windows', () => {
    const r = _test.classifyUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
    )
    expect(r).toEqual({ device_type: 'desktop', browser: 'chrome', os: 'windows' })
  })

  it('detecta mobile/Safari/iOS', () => {
    const r = _test.classifyUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    )
    expect(r.device_type).toBe('mobile')
    expect(r.browser).toBe('safari')
    expect(r.os).toBe('ios')
  })

  it('detecta tablet/Edge/Android', () => {
    const r = _test.classifyUserAgent(
      'Mozilla/5.0 (Linux; Android 13; SM-X200 Build/TP1A.220624.014) AppleWebKit/537.36 EdgA/120.0 Chrome/120.0 Safari/537.36',
    )
    expect(r.device_type).toBe('tablet')
    expect(r.browser).toBe('edge')
    expect(r.os).toBe('android')
  })

  it('detecta tablet iPad', () => {
    const r = _test.classifyUserAgent(
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1',
    )
    expect(r.device_type).toBe('tablet')
  })

  it('trata UA vazio/desconhecido como desktop/other/other', () => {
    const r = _test.classifyUserAgent('')
    expect(r).toEqual({ device_type: 'desktop', browser: 'other', os: 'other' })
  })
})

describe('classifyReferrer', () => {
  it('classifica direto quando sem referrer', () => {
    expect(_test.classifyReferrer('')).toEqual({ category: 'direct', domain: null })
  })

  it('classifica search (google)', () => {
    const r = _test.classifyReferrer('https://www.google.com/search?q=x')
    expect(r.category).toBe('search')
    expect(r.domain).toContain('google')
  })

  it('classifica social (instagram/whatsapp/wa.me)', () => {
    expect(_test.classifyReferrer('https://www.instagram.com/').category).toBe('social')
    expect(_test.classifyReferrer('https://wa.me/55').category).toBe('social')
  })

  it('classifica interno (domínio do site)', () => {
    const r = _test.classifyReferrer('https://brunacamara-arq.com.br/projetos')
    expect(r.category).toBe('internal')
  })

  it('outros viram other com domínio', () => {
    const r = _test.classifyReferrer('https://exemplo.org/pagina')
    expect(r.category).toBe('other')
    expect(r.domain).toBe('exemplo.org')
  })
})

describe('sanitizePaths', () => {
  it('limita a 50 itens', () => {
    const arr = Array.from({ length: 80 }, (_, i) => ({ p: `/pagina${i}`, t: `2026-01-01T00:00:00Z` }))
    expect(_test.sanitizePaths(arr).length).toBe(50)
  })

  it('descarta entradas inválidas', () => {
    expect(_test.sanitizePaths([null, { p: 'x' }, { p: 'ok', t: 'ts' }])).toEqual([
      { p: 'ok', t: 'ts' },
    ])
  })

  it('trunca strings muito longas', () => {
    const big = 'a'.repeat(1000)
    const t = _test.sanitizePaths([{ p: big, t: 't'.repeat(100) }])[0]
    expect(t.p.length).toBe(500)
    expect(t.t.length).toBe(40)
  })
})

describe('sanitizeEvents', () => {
  it('só aceita tipos da whitelist', () => {
    const out = _test.sanitizeEvents([
      { type: 'whatsapp', path: '/', ts: 'x' },
      { type: 'email', path: '/contato', ts: 'x' },
      { type: 'contact', path: '/', ts: 'x' },
      { type: 'click' },
      { type: 'telemetry' },
    ])
    expect(out.map((e) => e.type)).toEqual(['whatsapp', 'email', 'contact'])
  })
})

describe('clampInt', () => {
  it('limita e aplica fallback', () => {
    expect(_test.clampInt(10, 0, 5, 0)).toBe(5)
    expect(_test.clampInt('abc', 0, 5, 7)).toBe(7)
    expect(_test.clampInt(3, 0, 5, 0)).toBe(3)
  })
})