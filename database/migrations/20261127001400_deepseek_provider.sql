-- =============================================================================
-- 1400 — Ajout de DeepSeek comme fournisseur de modèles d'IA
-- =============================================================================

alter type public.ai_model_provider add value if not exists 'deepseek';
alter type public.integration_provider add value if not exists 'deepseek' after 'anthropic';
