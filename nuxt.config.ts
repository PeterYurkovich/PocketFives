// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@sidebase/nuxt-auth',
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    '@vueuse/nuxt'
  ],

  build: {
    transpile: [
      'trpc-nuxt'
    ]
  },

  typescript: {
    shim: false
  },

  auth: {
    isEnabled: true,
    session: {
      enableRefreshPeriodically: 10000,
      enableRefreshOnWindowFocus: true
    }
  },

  // auth: {
  //   origin: 'http://localhost:3000',
  //   defaultProvider: 'github',
  //   enableSessionRefreshPeriodically: 10000,
  //   enableGlobalAppMiddleware: true
  // },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          animation: {
            'spin-slow': 'spin 200s ease infinite',
            'elongate-horizontal': 'elongate-horizontal 10s linear infinite',
            'elongate-vertical': 'elongate-vertical 10s linear infinite',
            'delaya-2': 'animate-delay 5s'
          },
          keyframes: {
            'elongate-horizontal': {
              '0%, 100%': { transform: 'scaleX(1)' },
              '50%': { transform: 'scaleX(2)' }
            },
            'elongate-vertical': {
              '0%, 100%': { transform: 'scaleY(1)' },
              '50%': { transform: 'scaleY(2)' }
            }
          }
        }
      },
      plugins: [],
      content: [
        'components/**/*.{vue,js,ts}',
        'layouts/**/*.vue',
        'pages/**/*.vue',
        'composables/**/*.{js,ts}',
        'plugins/**/*.{js,ts}',
        'utils/**/*.{js,ts}',
        'App.{js,ts,vue}',
        'app.{js,ts,vue}',
        'Error.{js,ts,vue}',
        'error.{js,ts,vue}'
      ]
    }
  },

  devtools: {
    enabled: true
  }
})
