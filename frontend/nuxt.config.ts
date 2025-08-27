// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],

  app: {
    head: {
      title: "Job Portal",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "A job portal for employers and job seekers" },
      ],
      script: [
        {
          src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/js/all.min.js",
          defer: true,
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: "http://localhost:5000/api",
    },
  },

  css: ["~/assets/css/tailwind.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  typescript: {
    strict: true,
  },

  experimental: {
    asyncContext: true,
  },

  routeRules: {
    "/": { prerender: true },
    "/work/**": { cache: { maxAge: 3600 } },
  },

  vite: {
    optimizeDeps: {
      include: ["socket.io-client"],
      exclude: ["jspdf"],
    },
    ssr: {
      noExternal: ["socket.io-client", "jspdf"],
    },
  },

  plugins: [
    { src: "~/plugins/socket.client.ts", mode: "client" },
  ],
}); 