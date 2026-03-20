create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  text_color text not null default '#f5eef8',
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  group_id text not null,
  title text not null,
  content text not null,
  post_type text not null default 'text',
  media_image_url text not null default '',
  media_video_url text not null default '',
  tags text[] not null default '{}',
  author_display text not null,
  author_username text not null,
  author_text_color text not null default '#f5eef8',
  author_avatar_url text not null default '',
  votes_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.posts add column if not exists post_type text not null default 'text';
alter table public.posts add column if not exists media_image_url text not null default '';
alter table public.posts add column if not exists media_video_url text not null default '';

create table if not exists public.post_votes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.apply_post_vote_delta()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set votes_count = votes_count + new.value where id = new.post_id;
    return new;
  elsif tg_op = 'UPDATE' then
    update public.posts set votes_count = votes_count + (new.value - old.value) where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts set votes_count = votes_count - old.value where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists post_votes_apply_delta on public.post_votes;
create trigger post_votes_apply_delta
after insert or update or delete on public.post_votes
for each row
execute function public.apply_post_vote_delta();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_votes enable row level security;

drop policy if exists "profiles are readable" on public.profiles;
create policy "profiles are readable"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "posts are readable" on public.posts;
create policy "posts are readable"
on public.posts
for select
to anon, authenticated
using (true);

drop policy if exists "authenticated users create posts" on public.posts;
create policy "authenticated users create posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users read own votes" on public.post_votes;
create policy "users read own votes"
on public.post_votes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users upsert own votes" on public.post_votes;
create policy "users upsert own votes"
on public.post_votes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users update own votes" on public.post_votes;
create policy "users update own votes"
on public.post_votes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own votes" on public.post_votes;
create policy "users delete own votes"
on public.post_votes
for delete
to authenticated
using (auth.uid() = user_id);

insert into public.posts (
  group_id,
  title,
  content,
  post_type,
  media_image_url,
  media_video_url,
  tags,
  author_display,
  author_username,
  author_text_color,
  author_avatar_url,
  votes_count
)
select *
from (
  values
    (
      'creepypasta',
      'Borrasca',
      'Uma indicação essencial para quem gosta de creepypasta longa e sufocante. Borrasca gira em torno de uma cidade cheia de segredos, desaparecimentos e uma sensação constante de que toda lembrança de infância esconde algo podre. Este post funciona como destaque e sinopse curta do conto, não como reprodução integral.',
      'text',
      '',
      '',
      array['creepypasta', 'mistério', 'cidade pequena'],
      'ArquivoNeblina',
      'ArquivoNeblina',
      '#f5eef8',
      '',
      402
    ),
    (
      'horror-psicologico',
      'Meu reflexo piscou antes de mim',
      'Fiquei sem energia por três horas. Quando acendi a lanterna do celular no banheiro, o espelho já mostrava meu rosto. O problema é que eu ainda estava no corredor.',
      'text',
      '',
      '',
      array['espelho', 'apartamento', 'paranoia'],
      'NoiteFixa',
      'NoiteFixa',
      '#f5eef8',
      '',
      187
    ),
    (
      'ficcao-sombria',
      'O elevador do laboratório desceu para um andar negativo que não existia',
      'O painel marcava -9. Nenhum de nós apertou esse botão. Quando a porta abriu, vimos uma ala inteira com nossas mesas, nossas fotos e os nossos corpos sentados, como se nunca tivéssemos saído dali.',
      'text',
      '',
      '',
      array['laboratório', 'sci-fi', 'duplicatas'],
      'DrVeludo',
      'DrVeludo',
      '#f5eef8',
      '',
      231
    )
) as seed (
  group_id,
  title,
  content,
  post_type,
  media_image_url,
  media_video_url,
  tags,
  author_display,
  author_username,
  author_text_color,
  author_avatar_url,
  votes_count
)
where not exists (
  select 1 from public.posts existing where existing.title = seed.title
);
