// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@nuxt/image',
        'nuxt-auth-utils',
        'nuxt-qrcode',
    ],
    imports: {
        dirs: ['shared/types', 'shared/utils'],
    },
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    colorMode: {
        preference: 'light',
    },
    ui: {
        theme: {
            colors: [
                'primary',
                'secondary',
                'info',
                'success',
                'warning',
                'error',
            ],
        },
    },
    compatibilityDate: '2025-07-15',
    nitro: {
        imports: {
            dirs: ['shared/types', 'shared/utils'],
        },
    },
    eslint: {
        config: {
            stylistic: {
                commaDangle: 'always-multiline',
                semi: false,
                quotes: 'single',
                indent: 4,
            },
        },
    },
})
