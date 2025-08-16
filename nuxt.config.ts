// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@sidebase/nuxt-auth'
  ],
  css: ['~/assets/css/main.css'],
  
  // Force light theme for now
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  icon: {
    customCollections: [
      {
        prefix: 'custom',
        dir: './app/assets/icons'
      },
    ],
  },
  
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'your-super-secret-auth-key-change-in-production',
    public: {
      authUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000/api/auth'
    }
  }
})