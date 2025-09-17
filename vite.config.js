import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// Allow switching base between GitHub Pages and Firebase
const DEPLOY_TARGET = process.env.DEPLOY_TARGET || ''

export default defineConfig({
  plugins: [vue()],
  base: DEPLOY_TARGET === 'github' ? '/b-rational/' : '/',
})
