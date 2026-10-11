import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^lodash\/(.*)$/, replacement: 'lodash/$1.js' }
    ]
  }
})
