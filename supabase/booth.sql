-- AIRA 포토부스: Supabase 프로젝트의 SQL Editor에 통째로 붙여넣고 Run
-- (사진 버킷 + 방명록 테이블 + 누구나 읽고 쓸 수 있는 권한)

-- 1) 사진 저장 버킷 (공개 읽기)
insert into storage.buckets (id, name, public)
values ('booth', 'booth', true)
on conflict (id) do nothing;

-- 업로드만 허용 (목록 조회는 허용하지 않음 → 다른 사람 사진 주소를 알아낼 수 없음)
create policy "booth upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'booth');

-- 2) 방명록
create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  author_id text not null,
  name text not null check (char_length(name) between 1 and 16),
  message text not null default '' check (char_length(message) <= 300),
  image_path text,
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

create policy "guestbook read" on public.guestbook for select to anon using (true);
create policy "guestbook write" on public.guestbook for insert to anon with check (true);
-- 이름 바꾸기 · 내 글 삭제 (전시용이라 로그인 없이 기기별 author_id로만 구분)
create policy "guestbook rename" on public.guestbook for update to anon using (true) with check (true);
create policy "guestbook delete" on public.guestbook for delete to anon using (true);
