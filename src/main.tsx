import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './components/buttons.css'
import App from './App.tsx'

// 의자 화면에서 '홈 화면에 추가'하면 모바일 앱이 아니라 그 의자 화면이 열리도록 설정 파일을 바꿔 끼움
{
  const base = import.meta.env.BASE_URL
  const path = window.location.pathname.slice(base.length - 1)
  const page = path.startsWith('/display-curved') ? 'display-curved' : path.startsWith('/display') ? 'display' : null
  if (page) {
    document.querySelector('link[rel="manifest"]')?.setAttribute('href', `${base}${page}.webmanifest`)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#000000')
    document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', page === 'display' ? 'AIRA Seat' : 'AIRA Curved')
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* GitHub Pages에선 /AIRA-app/ 아래에서 동작 */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
