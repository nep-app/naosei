import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O site é publicado em https://nep-app.github.io/naosei/ (GitHub Pages),
// por isso o caminho base tem de ser /naosei/.
export default defineConfig({
  base: '/naosei/',
  plugins: [react()],
})
