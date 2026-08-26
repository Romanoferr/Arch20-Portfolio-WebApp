-- ============================================================================
-- Migration 0004 — Auditoria corretiva do Analytics (sem mudança de schema)
-- ============================================================================
-- Corrige 4 problemas SEM criar tabelas e SEM alterar o modelo de "1 linha
-- por sessão". Todas as funções abaixo usam `create or replace` (idempotente)
-- e mantêm as assinaturas originais usadas pelo dashboard, que NÃO muda.
--
-- 1. FLUSH FORA DE ORDEM
--    O upsert passou a ser condicional: só ATUALIZA a linha existente se a
--    escrita for mais recente que a já gravada. Assim um payload antigo que
--    chegue ao Worker depois de um mais novo NÃO regride os dados.
--    (Nova RPC `analytics_upsert_session`, escrita só via service_role.)
--
-- 2. PÁGINAS MAIS ACESSADAS
--    `analytics_top_paths` contava apenas `landing_path` (1 por sessão).
--    Passa a expor `paths[]` (jsonb já armazenado), contando pageviews reais
--    de qualquer página, igual ao padrão de `analytics_top_projects`.
--    (A home '/' é excluída para o gráfico não ser dominado por ela.)
--
-- 3. HISTÓRICO > RETENÇÃO (180 dias)
--    O cron apaga sessões brutas > 180d, então as RPCs que só liam
--    `analytics_sessions` não consultavam períodos antigos. Agora
--    `analytics_summary` e `analytics_series` usam `analytics_daily_aggregates`
--    (permanentes) para os dias anteriores ao corte e o dado bruto para os
--    recentes. Dimensões (device/browser/páginas/origens/conversões) NÃO têm
--    agregados e seguem limitadas à retenção (sem schema novo, por design).
--
-- 4. FUSO HORÁRIO
--    Série temporal, rollup e summary agora agrupam pelo dia do visitante
--    em `America/Sao_Paulo` em vez de UTC. (Mantemos timestamptz puro no
--    armazenamento; a conversão é apenas no `group by` da métrica diária.)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Upsert condicional de sessão (anti-regressão por flush fora de ordem)
--    Escrita exclusiva do Worker (service_role). Não é uma tabela nova.
-- ----------------------------------------------------------------------------
create or replace function public.analytics_upsert_session(p_row jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.analytics_sessions (
    session_id, started_at, ended_at, duration_seconds, pageviews,
    landing_path, exit_path, paths, referrer_category, referrer_domain,
    device_type, browser, os, country, region, city, events
  )
  values (
    (p_row->>'session_id')::uuid,
    (p_row->>'started_at')::timestamptz,
    nullif(p_row->>'ended_at', '')::timestamptz,
    coalesce((p_row->>'duration_seconds')::int, 0),
    coalesce((p_row->>'pageviews')::int, 0),
    coalesce(p_row->>'landing_path', '/'),
    p_row->>'exit_path',
    coalesce(p_row->'paths', '[]'::jsonb),
    coalesce(p_row->>'referrer_category', 'direct'),
    p_row->>'referrer_domain',
    coalesce(p_row->>'device_type', 'desktop'),
    p_row->>'browser',
    p_row->>'os',
    (p_row->>'country')::char(2),
    p_row->>'region',
    p_row->>'city',
    coalesce(p_row->'events', '[]'::jsonb)
  )
  on conflict (session_id) do update set
    started_at         = excluded.started_at,
    ended_at           = excluded.ended_at,
    duration_seconds   = excluded.duration_seconds,
    pageviews          = excluded.pageviews,
    landing_path       = excluded.landing_path,
    exit_path          = excluded.exit_path,
    paths              = excluded.paths,
    referrer_category  = excluded.referrer_category,
    referrer_domain    = excluded.referrer_domain,
    device_type        = excluded.device_type,
    browser            = excluded.browser,
    os                 = excluded.os,
    country            = excluded.country,
    region             = excluded.region,
    city               = excluded.city,
    events             = excluded.events
  where
    -- Só aceita a escrita se ainda não havia sessão finalizada ou se ela é
    -- mais recente. Um payload antigo que chegar em ordem trocada é ignorado.
    public.analytics_sessions.ended_at is null
    or public.analytics_sessions.ended_at < excluded.ended_at;
end;
$$;

revoke all on function public.analytics_upsert_session(jsonb) from public, anon;
grant execute on function public.analytics_upsert_session(jsonb) to service_role;

-- ----------------------------------------------------------------------------
-- 2. Páginas mais acessadas = pageviews reais (paths[] em vez de landing_path)
-- ----------------------------------------------------------------------------
create or replace function public.analytics_top_paths(
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
  where p->>'p' is not null
    and p->>'p' <> '/'
  group by 1
  order by views desc
  limit p_limit;
$$;

-- ----------------------------------------------------------------------------
-- 3. Resumo com histórico estendido via agregados diários (dias antigos)
-- ----------------------------------------------------------------------------
create or replace function public.analytics_summary(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff_day date := (current_date - 180);
  v jsonb;
begin
  with
    agg_part as (
      select
        coalesce(sum(a.sessions), 0)                as sessions,
        coalesce(sum(a.pageviews), 0)               as pageviews,
        coalesce(sum(a.unique_sessions), 0)         as unique_sessions,
        coalesce(sum(a.sessions * a.avg_duration_seconds), 0)::bigint as total_duration
      from public.analytics_daily_aggregates a
      where a.day >= (p_from at time zone 'America/Sao_Paulo')::date
        and a.day <  (p_to   at time zone 'America/Sao_Paulo')::date
        and a.day <  cutoff_day
    ),
    raw_part as (
      select
        count(*)                                      as sessions,
        coalesce(sum(s.pageviews), 0)                 as pageviews,
        count(distinct s.session_id)                  as unique_sessions,
        coalesce(sum(s.duration_seconds), 0)          as total_duration
      from public.analytics_sessions s
      where s.started_at >= p_from and s.started_at < p_to
        and (s.started_at at time zone 'America/Sao_Paulo')::date >= cutoff_day
    )
  select jsonb_build_object(
    'sessions',          a.sessions + r.sessions,
    'pageviews',         a.pageviews + r.pageviews,
    'unique_sessions',   a.unique_sessions + r.unique_sessions,
    'avg_duration',      case when (a.sessions + r.sessions) > 0
                              then round((a.total_duration + r.total_duration)::numeric
                                         / (a.sessions + r.sessions))
                              else 0 end,
    'pages_per_session', case when (a.sessions + r.sessions) > 0
                              then round((a.pageviews + r.pageviews)::numeric
                                         / (a.sessions + r.sessions), 2)
                              else 0 end
  )
  into v
  from agg_part a
  cross join raw_part r;

  return v;
end;
$$;

-- ----------------------------------------------------------------------------
-- 3b. Série temporal com histórico estendido + fuso America/Sao_Paulo
-- ----------------------------------------------------------------------------
create or replace function public.analytics_series(
  p_from timestamptz, p_to timestamptz
) returns table (day date, sessions bigint, pageviews bigint, avg_duration numeric)
language sql
security definer
set search_path = public
as $$
  with cutoff as (
    select (current_date - 180) as d
  ),
  agg_part as (
    select
      a.day,
      a.sessions::bigint                  as sessions,
      a.pageviews::bigint                 as pageviews,
      a.avg_duration_seconds::numeric     as avg_duration
    from public.analytics_daily_aggregates a
    where a.day >= (p_from at time zone 'America/Sao_Paulo')::date
      and a.day <  (p_to   at time zone 'America/Sao_Paulo')::date
      and a.day <  (select d from cutoff)
  ),
  raw_part as (
    select
      (s.started_at at time zone 'America/Sao_Paulo')::date as day,
      count(*)                                             as sessions,
      coalesce(sum(s.pageviews), 0)                        as pageviews,
      coalesce(round(avg(s.duration_seconds)), 0)::numeric as avg_duration
    from public.analytics_sessions s
    where s.started_at >= p_from and s.started_at < p_to
      and (s.started_at at time zone 'America/Sao_Paulo')::date >= (select d from cutoff)
    group by 1
  )
  select day, sessions, pageviews, avg_duration
  from agg_part
  union all
  select day, sessions, pageviews, avg_duration
  from raw_part
  order by 1;
$$;

-- ----------------------------------------------------------------------------
-- 4. Rollup diário consistente com o fuso America/Sao_Paulo
--    (granularidade "dia do visitante", alinhada à série temporal)
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
    (s.started_at at time zone 'America/Sao_Paulo')::date as day,
    count(*)                                              as sessions,
    coalesce(sum(s.pageviews), 0)                         as pageviews,
    count(distinct s.session_id)                          as unique_sessions,
    coalesce(round(avg(s.duration_seconds)::numeric), 0)::integer as avg_duration_seconds,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'whatsapp'), 0)          as whatsapp_clicks,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'email'), 0)             as email_clicks,
    coalesce((select count(*) from jsonb_array_elements(s.events) e
              where e->>'type' = 'contact'), 0)           as contact_submissions
  from public.analytics_sessions s
  where (s.started_at at time zone 'America/Sao_Paulo')::date between p_from and p_to
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
-- Nota: as funções analytics_summary/analytics_series/top_paths mantêm a
-- assinatura original; os grants a `authenticated` (migration 0002) seguem
-- válidos via `create or replace`. As funções de dimensão não foram alteradas.
-- ----------------------------------------------------------------------------