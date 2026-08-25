import { describe, it, expect } from 'vitest'
import {
  IMAGE_PRESETS,
  IMAGE_PRESET_NAMES,
  isImagePreset,
} from '@/lib/r2/presets'

describe('presets de imagem (whitelist fechada)', () => {
  it('define todos os presets esperados', () => {
    expect(IMAGE_PRESET_NAMES).toEqual(
      expect.arrayContaining([
        'thumbnail',
        'mobile',
        'tablet',
        'gallery',
        'hero',
        'full',
        'social',
      ]),
    )
  })

  it('cada preset tem width e quality válidos', () => {
    for (const name of IMAGE_PRESET_NAMES) {
      const preset = IMAGE_PRESETS[name]
      expect(preset.width).toBeGreaterThan(0)
      expect(preset.quality).toBeGreaterThan(0)
      expect(preset.quality).toBeLessThanOrEqual(100)
    }
  })

  it('presets são finitos e determinísticos (sem combinações arbitrárias)', () => {
    // A whitelist deve ser fechada: apenas os nomes conhecidos são aceitos.
    expect(IMAGE_PRESET_NAMES.length).toBe(7)
  })

  it('isImagePreset valida corretamente', () => {
    expect(isImagePreset('gallery')).toBe(true)
    expect(isImagePreset('hero')).toBe(true)
    expect(isImagePreset('full')).toBe(true)
    expect(isImagePreset('social')).toBe(true)
    expect(isImagePreset('width=9999')).toBe(false)
    expect(isImagePreset('')).toBe(false)
    expect(isImagePreset(undefined)).toBe(false)
    expect(isImagePreset(123)).toBe(false)
  })

  it('o preset full existe mas não é o default', () => {
    // `full` (2560px) deve existir, mas não deve ser usado automaticamente.
    expect(IMAGE_PRESETS.full.width).toBe(2560)
  })
})