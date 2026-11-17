// 의자 화면마다 진짜 HTML 파일을 하나씩 만들어 둠 (dist/display/index.html …)
// 아이폰 Safari는 '홈 화면에 추가'할 때 서버가 보낸 HTML에 적힌 설정 파일을 읽기 때문에,
// 화면이 뜬 뒤 스크립트로 바꿔 끼우는 것만으로는 모바일 앱 설정이 그대로 쓰임
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const pages = [
  { slug: 'display', title: 'AIRA Seat' },
  { slug: 'display-curved', title: 'AIRA Curved' },
]

const html = readFileSync('dist/index.html', 'utf8')
for (const { slug, title } of pages) {
  const out = html
    .replace(/(<link rel="manifest" href="[^"]*\/)manifest\.webmanifest"/, `$1${slug}.webmanifest"`)
    .replace(/(<meta name="theme-color" content=")[^"]*"/, '$1#000000"')
    .replace(/(<meta name="apple-mobile-web-app-title" content=")[^"]*"/, `$1${title}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  if (!out.includes(`${slug}.webmanifest`)) throw new Error(`manifest link not replaced for ${slug}`)
  mkdirSync(`dist/${slug}`, { recursive: true })
  writeFileSync(`dist/${slug}/index.html`, out)
}
