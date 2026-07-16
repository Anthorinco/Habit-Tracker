import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Config minima do Vite: o projeto so precisa do plugin React.
export default defineConfig({
  plugins: [react()],
})
