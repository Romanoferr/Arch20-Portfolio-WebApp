-- ============================================================================
-- Migration 0001 — Persistência de Projetos (Database + Storage)
-- ============================================================================
-- Cria as tabelas `projects` e `project_images`, índices, trigger de
-- updated_at, Row Level Security (RLS), policies e o bucket de Storage.
--
-- Como executar:
--   Opção A (Dashboard): SQL Editor -> cole todo o conteúdo -> Run.
--   Opção B (CLI): supabase db push  (após `supabase link`)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela `projects`
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  category    text not null default 'residencial'
              check (category in ('residencial', 'comercial', 'interiores')),
  year        integer,
  location    text,
  area        text,
  description text,
  published   boolean not null default true,
  "order"     integer not null default 999,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Tabela `project_images`
-- ----------------------------------------------------------------------------
create table if not exists public.project_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  storage_path  text not null,
  is_cover      boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Índices
-- ----------------------------------------------------------------------------
create index if not exists projects_published_idx on public.projects (published);
create index if not exists projects_order_idx    on public.projects ("order");
create index if not exists project_images_project_id_idx on public.project_images (project_id);

-- Garante no máximo uma imagem de capa por projeto.
create unique index if not exists project_images_one_cover_idx
  on public.project_images (project_id)
  where is_cover;

-- ----------------------------------------------------------------------------
-- 4. Trigger de updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
alter table public.projects       enable row level security;
alter table public.project_images enable row level security;

do $$ begin
  create policy "projects_select_public"
    on public.projects
    for select
    using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "projects_insert_authenticated"
    on public.projects
    for insert
    to authenticated
    with check (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "projects_update_authenticated"
    on public.projects
    for update
    to authenticated
    using (true)
    with check (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "projects_delete_authenticated"
    on public.projects
    for delete
    to authenticated
    using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_select_public"
    on public.project_images
    for select
    using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_insert_authenticated"
    on public.project_images
    for insert
    to authenticated
    with check (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_update_authenticated"
    on public.project_images
    for update
    to authenticated
    using (true)
    with check (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_delete_authenticated"
    on public.project_images
    for delete
    to authenticated
    using (true);
exception
  when duplicate_object then null;
end $$;

-- ----------------------------------------------------------------------------
-- 6. Bucket de Storage + policies
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

do $$ begin
  create policy "project_images_storage_select_public"
    on storage.objects
    for select
    using (bucket_id = 'project-images');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_storage_insert_authenticated"
    on storage.objects
    for insert
    to authenticated
    with check (bucket_id = 'project-images');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_storage_update_authenticated"
    on storage.objects
    for update
    to authenticated
    using (bucket_id = 'project-images')
    with check (bucket_id = 'project-images');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "project_images_storage_delete_authenticated"
    on storage.objects
    for delete
    to authenticated
    using (bucket_id = 'project-images');
exception
  when duplicate_object then null;
end $$;