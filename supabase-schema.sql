-- Create tables
CREATE TABLE public.memberships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  district TEXT,
  "wingId" TEXT,
  constituency TEXT,
  "union" TEXT,
  photo TEXT,
  date TEXT,
  "cardId" TEXT,
  "validUntil" TEXT,
  "validUntilTimestamp" BIGINT,
  dob TEXT,
  "bloodGroup" TEXT,
  "memberId" TEXT,
  email TEXT
);

CREATE TABLE public.officers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  role TEXT NOT NULL,
  role_en TEXT NOT NULL,
  district TEXT NOT NULL,
  district_en TEXT NOT NULL,
  level TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  "imageUrl" TEXT,
  "wingId" TEXT,
  constituency TEXT,
  constituency_en TEXT,
  "union" TEXT,
  union_en TEXT,
  branch TEXT,
  branch_en TEXT,
  ward TEXT,
  ward_en TEXT,
  dob TEXT,
  age INTEGER,
  "bloodGroup" TEXT,
  "memberId" TEXT
);

CREATE TABLE public.officer_history (
  id TEXT PRIMARY KEY,
  officer JSONB NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  restored BOOLEAN
);

CREATE TABLE public.media (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  "thumbnailUrl" TEXT NOT NULL,
  tag TEXT NOT NULL,
  tag_en TEXT NOT NULL
);

CREATE TABLE public.wings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT NOT NULL
);

CREATE TABLE public.leaders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  quote TEXT NOT NULL,
  quote_en TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  bio TEXT,
  bio_en TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since app logic handles auth)
-- In a production environment, you should tighten these policies!
CREATE POLICY "Allow anonymous read access" ON public.memberships FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.memberships FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.memberships FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.officers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.officers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.officers FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.officers FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.officer_history FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.officer_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.officer_history FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.officer_history FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.media FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.media FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.media FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.wings FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.wings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.wings FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.wings FOR DELETE USING (true);

CREATE POLICY "Allow anonymous read access" ON public.leaders FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON public.leaders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON public.leaders FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access" ON public.leaders FOR DELETE USING (true);

-- Enable Realtime for all tables
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.officers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.officer_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.media;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaders;
