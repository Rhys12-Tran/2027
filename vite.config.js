import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE is "/2027/" on GitHub Pages and "/" everywhere else (Netlify, local).
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
