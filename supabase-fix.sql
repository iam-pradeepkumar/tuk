ALTER TABLE public.memberships RENAME COLUMN wingid TO "wingId";
ALTER TABLE public.memberships RENAME COLUMN cardid TO "cardId";
ALTER TABLE public.memberships RENAME COLUMN validuntil TO "validUntil";
ALTER TABLE public.memberships RENAME COLUMN validuntiltimestamp TO "validUntilTimestamp";
ALTER TABLE public.memberships RENAME COLUMN bloodgroup TO "bloodGroup";
ALTER TABLE public.memberships RENAME COLUMN memberid TO "memberId";

ALTER TABLE public.officers RENAME COLUMN imageurl TO "imageUrl";
ALTER TABLE public.officers RENAME COLUMN wingid TO "wingId";
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS "memberId" TEXT;

DROP TABLE IF EXISTS public.officer_history;
CREATE TABLE public.officer_history (
  id TEXT PRIMARY KEY,
  officer JSONB NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  restored BOOLEAN
);

ALTER TABLE public.media RENAME COLUMN thumbnailurl TO "thumbnailUrl";

ALTER TABLE public.leaders RENAME COLUMN imageurl TO "imageUrl";

NOTIFY pgrst, 'reload schema';
