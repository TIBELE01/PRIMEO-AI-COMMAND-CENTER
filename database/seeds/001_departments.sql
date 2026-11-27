-- Directions initiales de Primeo (Contexte.MD, section 3). Idempotent.
insert into public.departments (slug, name, display_order) values
  ('direction-generale',      'Direction générale',                               1),
  ('administration-rh',       'Direction administrative et des ressources humaines', 2),
  ('finance-comptabilite',    'Direction financière et comptable',                3),
  ('commercial-partenariats', 'Direction commerciale et partenariats',            4),
  ('marketing-communication', 'Direction marketing et communication',             5),
  ('operations-experience',   'Direction des opérations et de l''expérience client', 6),
  ('technique-si',            'Direction technique et systèmes d''information',   7)
on conflict (slug) do update
  set name = excluded.name,
      display_order = excluded.display_order;
