import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 주소: https://junghip.github.io/aira-prototype/ (저장소 이름이 바뀌면 여기만 수정)
const REPO_NAME = 'aira-prototype'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GH_PAGES ? `/${REPO_NAME}/` : '/',
})
