import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import presetMini from '@unocss/preset-mini'

export default defineConfig({
  presets: [
    presetMini({
      dark: 'class',
    }),
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetIcons(),
    presetWebFonts(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
