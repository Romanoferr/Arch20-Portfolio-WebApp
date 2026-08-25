-- ============================================================================
-- Migration 0003 — Fix: constraint UNIQUE em analytics_sessions.session_id
-- ============================================================================
-- O Worker de analytics faz `upsert` com `onConflict: 'session_id'`, o que
-- exige uma constraint UNIQUE nessa coluna. A migration 0002 criou a coluna
-- sem a constraint, fazendo o upsert falhar com "Error persisting".
--
-- Esta migration adiciona a constraint UNIQUE. Como `session_id` é um UUID
-- efêmero (sessionStorage), não há risco de colisão semântica; a constraint
-- garante idempotência do upsert (1 linha por sessão).
-- ============================================================================

alter table public.analytics_sessions
  add constraint analytics_sessions_session_id_key unique (session_id);