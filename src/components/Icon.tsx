import type { CSSProperties } from 'react'

type IconProps = {
  src: string
  width: number
  height?: number
  color?: string
  className?: string
  style?: CSSProperties
}

// SVG 모양을 마스크로 써서 색을 CSS로 바꾸거나 애니메이션할 수 있게 함
export default function Icon({ src, width, height = width, color = 'currentColor', className, style }: IconProps) {
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: 'block',
        flexShrink: 0,
        width,
        height,
        backgroundColor: color,
        mask: `url("${src}") center / contain no-repeat`,
        WebkitMask: `url("${src}") center / contain no-repeat`,
        transition: 'background-color 0.25s',
        ...style,
      }}
    />
  )
}
