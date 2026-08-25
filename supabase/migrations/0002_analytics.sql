-- ============================================================================
-- Migration 0002 — Analytics de Sessões (mínimo de armazenamento, sem PII)
-- ============================================================================
-- Registra UMA linha por sessão (não por pageview). Todas as métricas úteis
-- (pageviews, duração, landing/exit, sequência de páginas, origens, device,
-- browser, OS, país, conversões) são derivadas da própria sessão ou dos
-- agregados diários.
--
-- Privacidade / LGPD:
--   - Nenhum IP é armazenado (a geolocalização é resolvida no edge via
--     headers `cf-*` e NUNCA persistida em IP).
--   - Nenhum User-Agent bruto é armazenado: browser e OS viram enums
--     normalizados no Worker.
--   - `session_id` é um UUID aleatório em `sessionStorage`, NÃO persistente,
--     não correlacionável com identidade/navegador.
--   - Nenhum cookie de terceiros, sem fingerprinting, sem query strings.
--
-- Retenção:
--   - `analytics_sessions`: 180 dias, limpas por cron no Worker.
--   - `analytics_daily_aggregates`: permanentes (agregados SEM identificadores
--     individuais).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabela `analytics_sessions`
-- ----------------------------------------------------------------------------
create table if not exists public.analytics_sessions (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid             not null,               -- anônimo, sessionStorage
  started_at       timestamptz      not null default now(),
  ended_at         timestamptz,
  duration_seconds integer          not null default 0,
  pageviews        integer          not null default 0
                   check (pageviews between 0 and 50),
  landing_path     text             not null default '/',
  exit_path        text,
  paths            jsonb            not null default '[]'::jsonb, -- [{p,t}], máx 50
  referrer_category text            not null default 'direct',   -- direct/social/other/internal
  referrer_domain  text,
  device_type      text             not null default 'desktop',  -- mobile/tablet/desktop
  browser          text,                                          -- chrome/safari/firefox/edge/opera/other
  os               text,                                          -- windows/macos/linux/ios/android/other
  country          char(2),                                    -- via cf-ipcountry
  region           text,
  city             text,
  events           jsonb            not null default '[]'::jsonb, -- [{type,path,ts}]
  created_at       timestamptz      not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. Índices (para as consultas do dashboard)
-- ----------------------------------------------------------------------------
create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at);
create index if not exists analytics_sessions_landing_path_idx
  on public.analytics_sessions (landing_path);
create index if not exists analytics_sessions_referrer_category_idx
  on public.analytics_sessions (referrer_category);
create index if not exists analytics_sessions_device_type_idx
  on public.analytics_sessions (device_type);
-- Índice retardado (BRIN) melhor para varredura de janela de tempo ampla
-- sem custo de manutenção alto (cron nightly). Substitui o B-tree acima p/ timestamp.
-- Nota: mantido como B-tree simples por simplicidade/portabilidade; o volume é pequeno.

-- ----------------------------------------------------------------------------
-- 3. Tabela de agregados diários (permanentes, SEM identificadores)
-- ----------------------------------------------------------------------------
create table if not exists public.analytics_daily_aggregates (
  day            date primary key,
  sessions       integer not null default 0,
  pageviews      integer not null default 0,
  unique_sessions integer not null default 0,
  avg_duration_seconds integer not null default 0,
  whatsapp_clicks integer not null default 0,
  email_clicks    integer not null default 0,
  contact_submissions integer not null default 0
);

-- ----------------------------------------------------------------------------
-- 4. Row Level Security
-- ----------------------------------------------------------------------------
-- Nenhuma escrita pelo anon/public. A escrita é feita pelo Worker com
-- service_role (crédito que NUNCA vai para o frontend). Leitura apenas para
-- usuário autenticado (admin), via RLS com `to authenticated`.
-- ----------------------------------------------------------------------------
alter table public.analytics_sessions         enable row level security;
alter table public.analytics_daily_aggregates enable row level security;

do $$ begin
  create policy "analytics_sessions_select_authenticated"
    on public.analytics_sessions
    for select
    to authenticated
    using (true);
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create policy "analytics_daily_aggregates_select_authenticated"
    on public.analytics_daily_aggregates
    for select
    to authenticated
    using (true);
exception
  when duplicate_object then null;
end $$;

-- Nota: NÃO há policy de INSERT/UPDATE/DELETE para `anon`/`authenticated`.
-- O único caminho de escrita é service_role (Worker), que ignora RLS.

-- ----------------------------------------------------------------------------
-- 5. Funções RPC para agregação no dashboard (executadas como authenticated)
-- ----------------------------------------------------------------------------
-- Retorna um resumo de métricas para um intervalo [from, to].
create or replace function public.analytics_summary(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v jsonb;
begin
  select jsonb_build_object(
    'sessions',          count(*),
    'pageviews',         coalesce(sum(s.pageviews), 0),
    'avg_duration',      coalesce(round(avg(s.duration_seconds)), 0),
    'pages_per_session', coalesce(round(avg(s.pageviews)::numeric, 2), 0),
    'unique_sessions',   count(*)
  )
  into v
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to;
  return v;
end;
$$;

-- Evolução por dia (linhas para o gráfico de barras/linha).
create or replace function public.analytics_series(
  p_from timestamptz, p_to timestamptz
) returns table (day date, sessions bigint, pageviews bigint, avg_duration numeric)
language sql
security definer
set search_path = public
as $$
  select
    (started_at at time zone 'UTC')::date as day,
    count(*) as sessions,
    coalesce(sum(pageviews), 0) as pageviews,
    coalesce(round(avg(duration_seconds)), 0) as avg_duration
  from public.analytics_sessions
  where started_at >= p_from and started_at < p_to
  group by 1
  order by 1;
$$;

-- Top páginas de destino (landing).
create or replace function public.analytics_top_paths(
  p_from timestamptz, p_to timestamptz, p_limit integer default 10
)
returns table (path text, views bigint)
language sql
security definer
set search_path = public
as $$
  select landing_path as path, count(*) as views
  from public.analytics_sessions
  where started_at >= p_from and started_at < p_to
  group by landing_path
  order by views desc
  limit p_limit;
$$;

-- Como a sequência fica no jsonb `paths`, os "projetos mais visualizados"
-- saem desta função (paths que casam /projetos/<slug>).
create or replace function public.analytics_top_projects(
  p_from timestamptz, p_to timestamptz, p_limit integer default 10
)
returns table (path text, views bigint)
language sql
security definer
set search_path = public
as $$
  with exploded as (
    select jsonb_array_elements(s.paths) as p
    from public.analytics_sessions s
    where s.started_at >= p_from and s.started_at < p_to
  )
  select p->>'p' as path, count(*) as views
  from exploded
  where p->>'p' ~ '^/projetos/[^/]+/?$'
  group by 1
  order by views desc
  limit p_limit;
$$;

-- Conversões por tipo.
create or replace function public.analytics_conversions(
  p_from timestamptz, p_to timestamptz
)
returns table (type text, count bigint)
language sql
security definer
set search_path = public
as $$
  with ev as (
    select jsonb_array_elements(s.events) as e
    from public.analytics_sessions s
    where s.started_at >= p_from and s.started_at < p_to
  )
  select e->>'type' as type, count(*) as count
  from ev
  group by 1
  order by count desc;
$$;

-- ----------------------------------------------------------------------------
-- 6. Rollup diário (chamado pelo cron do Worker ANTES de limpar as sessões
--    brutas). Mantém os agregados permanentemente, SEM identificadores
--    individuais (só contagens compactas por dia).
--    Idempotente: upsert por dia.
-- ----------------------------------------------------------------------------
create or replace function public.analytics_rollup(p_from date, p_to date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.analytics_daily_aggregates
    (day, sessions, pageviews, unique_sessions, avg_duration_seconds,
     whatsapp_clicks, email_clicks, contact_submissions)
  select
    (s.started_at at time zone 'UTC')::date                    as day,
    count(*)                                                     as sessions,
    coalesce(sum(s.pageviews), 0)                                as pageviews,
    count(distinct s.session_id)                                 as unique_sessions,
    coalesce(round(avg(s.duration_seconds)::numeric), 0)::integer as avg_duration_seconds,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'whatsapp'), 0)                  as whatsapp_clicks,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'email'), 0)                     as email_clicks,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'contact'), 0)                   as contact_submissions
  from public.analytics_sessions s
  where (s.started_at at time zone 'UTC')::date between p_from and p_to
  group by 1
  on conflict (day) do update set
    sessions              = excluded.sessions,
    pageviews             = excluded.pageviews,
    unique_sessions       = excluded.unique_sessions,
    avg_duration_seconds  = excluded.avg_duration_seconds,
    whatsapp_clicks       = excluded.whatsapp_clicks,
    email_clicks          = excluded.email_clicks,
    contact_submissions   = excluded.contact_submissions;
end;
$$;

revoke all on function public.analytics_rollup(date, date) from public, anon;
grant execute on function public.analytics_rollup(date, date) to service_role;

-- ----------------------------------------------------------------------------
-- 6b. Distribuição por dimensão (device/browser/os/país/origem)
--     → funções dedicadas para o gráfico de pizza/barras do dashboard.
--     Retornam apenas contagens agregadas, sem identificadores.
-- ----------------------------------------------------------------------------
create or replace function public.analytics_by_device(p_from timestamptz, p_to timestamptz)
returns table (name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(s.device_type, 'desktop') as name, count(*) as count
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to
  group by 1 order by count desc;
$$;

create or replace function public.analytics_by_browser(p_from timestamptz, p_to timestamptz)
returns table (name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(s.browser, 'other') as name, count(*) as count
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to
  group by 1 order by count desc;
$$;

create or replace function public.analytics_by_os(p_from timestamptz, p_to timestamptz)
returns table (name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(s.os, 'other') as name, count(*) as count
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to
  group by 1 order by count desc;
$$;

create or replace function public.analytics_by_country(p_from timestamptz, p_to timestamptz)
returns table (name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(nullif(s.country, ''), 'XX') as name, count(*) as count
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to
  group by 1 order by count desc;
$$;

create or replace function public.analytics_by_referrer(p_from timestamptz, p_to timestamptz)
returns table (name text, count bigint)
language sql
security definer
set search_path = public
as $$
  select coalesce(s.referrer_category, 'direct') as name, count(*) as count
  from public.analytics_sessions s
  where s.started_at >= p_from and s.started_at < p_to
  group by 1 order by count desc;
$$;

-- ----------------------------------------------------------------------------
-- 7. Permissões de execução das funções do DASHBOARD
--    → executadas pelo admin autenticado (connect via anon + RLS).
--    Nenhuma escrita é permitida ao anon/authenticated: apenas SELECT que
--    o RLS já restringiu a `authenticated`.
-- ----------------------------------------------------------------------------
revoke all on function public.analytics_summary(timestamptz, timestamptz)           from public, anon;
revoke all on function public.analytics_series(timestamptz, timestamptz)            from public, anon;
revoke all on function public.analytics_top_paths(timestamptz, timestamptz, integer) from public, anon;
revoke all on function public.analytics_top_projects(timestamptz, timestamptz, integer) from public, anon;
revoke all on function public.analytics_conversions(timestamptz, timestamptz)       from public, anon;
revoke all on function public.analytics_by_device(timestamptz, timestamptz)         from public, anon;
revoke all on function public.analytics_by_browser(timestamptz, timestamptz)        from public, anon;
revoke all on function public.analytics_by_os(timestamptz, timestamptz)             from public, anon;
revoke all on function public.analytics_by_country(timestamptz, timestamptz)        from public, anon;
revoke all on function public.analytics_by_referrer(timestamptz, timestamptz)       from public, anon;

grant execute on function public.analytics_summary(timestamptz, timestamptz)            to authenticated;
grant execute on function public.analytics_series(timestamptz, timestamptz)             to authenticated;
grant execute on function public.analytics_top_paths(timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.analytics_top_projects(timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.analytics_conversions(timestamptz, timestamptz)        to authenticated;
grant execute on function public.analytics_by_device(timestamptz, timestamptz)          to authenticated;
grant execute on function public.analytics_by_browser(timestamptz, timestamptz)         to authenticated;
grant execute on function public.analytics_by_os(timestamptz, timestamptz)              to authenticated;
grant execute on function public.analytics_by_country(timestamptz, timestamptz)         to authenticated;
grant execute on function public.analytics_by_referrer(timestamptz, timestamptz)        to authenticated;