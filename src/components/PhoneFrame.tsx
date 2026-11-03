import type { ReactNode } from 'react'
import StatusBar from './StatusBar'
import './PhoneFrame.css'

// 데스크톱에선 폰 크기 프레임 + 상태바, 실제 폰에선 전체 화면
export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-stage">
      <div className="phone-frame">
        {children}
        <div className="device-chrome" aria-hidden>
          <StatusBar />
          <div className="home-indicator" />
        </div>
      </div>
    </div>
  )
}
