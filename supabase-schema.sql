-- Execute no Supabase SQL Editor
-- https://supabase.com/dashboard > SQL Editor

-- ─────────────────────────────────────────────────
-- TABELA: profiles (extensão do auth.users)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: cria profile automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────
-- TABELA: pages (páginas/projetos do usuário)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Minha Página',
  html TEXT,
  css TEXT,
  template TEXT DEFAULT 'Vendas Pro',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT FALSE,
  published_url TEXT
);

-- Slug único para URL pública (/p/[slug])
ALTER TABLE pages ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS pages_slug_unique ON pages(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS pages_user_id_idx ON pages(user_id);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own pages" ON pages;
CREATE POLICY "Users can manage own pages"
  ON pages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leitura pública: qualquer um pode ver páginas publicadas (rota /p/[slug])
DROP POLICY IF EXISTS "Anyone can read published pages" ON pages;
CREATE POLICY "Anyone can read published pages"
  ON pages FOR SELECT
  USING (published = true);

-- Trigger: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pages_set_updated_at ON pages;
CREATE TRIGGER pages_set_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─────────────────────────────────────────────────
-- ARQUITETURA NOVA: sites cliente (React) + conteúdo dinâmico
-- ─────────────────────────────────────────────────

-- Sites cadastrados pela agência (um por cliente final)
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL,         -- slug, ex: "academia-joao"
  name TEXT NOT NULL,                    -- ex: "Academia do João"
  url TEXT NOT NULL,                     -- ex: "https://academia-joao.vercel.app"
  client_email TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sites public read" ON sites;
CREATE POLICY "Sites public read" ON sites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sites authenticated write" ON sites;
CREATE POLICY "Sites authenticated write" ON sites FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Conteúdo de cada site (uma linha por site_id, JSONB livre)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_content_site_id_idx ON site_content(site_id);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Leitura pública (o site React precisa ler sem auth)
DROP POLICY IF EXISTS "Content public read" ON site_content;
CREATE POLICY "Content public read" ON site_content FOR SELECT USING (true);

-- Escrita só por usuário autenticado (PageCraft)
DROP POLICY IF EXISTS "Content authenticated write" ON site_content;
CREATE POLICY "Content authenticated write" ON site_content FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS site_content_set_updated_at ON site_content;
CREATE TRIGGER site_content_set_updated_at
  BEFORE UPDATE ON site_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Realtime: site React recebe mudanças em tempo real
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'site_content'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE site_content;
  END IF;
END $$;
