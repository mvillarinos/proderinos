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

  // Auth configuration
  auth: {
    isEnabled: true,
    globalAppMiddleware: {
      isEnabled: true,
      addDefaultCallbackUrl: true
    },
    provider: {
      type: 'authjs',
      trustHost: false,
      defaultProvider: 'google',
      addDefaultCallbackUrl: true
    },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
    // Redirect unauthenticated users to login page instead of provider
    redirect: {
      login: '/login',
      logout: '/',
      callback: '/login',
      home: '/user'
    }
  },

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
    adminEmail: process.env.NUXT_ADMIN_EMAIL || 'manuvillarinos@gmail.com',
    public: {
      authUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000/api/auth'
    }
  }
})