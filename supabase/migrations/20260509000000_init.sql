-- Subsuku — initial schema
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name              TEXT        NOT NULL,
  amount            NUMERIC(12, 2) NOT NULL,
  currency          TEXT        NOT NULL DEFAULT 'JPY',
  billing_cycle     TEXT        NOT NULL DEFAULT 'monthly'
                    CHECK (billing_cycle IN ('monthly', 'yearly')),
  category          TEXT        NOT NULL DEFAULT 'other'
                    CHECK (category IN ('video', 'music', 'productivity', 'gaming', 'cloud', 'news', 'other')),
  next_billing_date DATE,
  started_at        DATE,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  icon              TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own" ON subscriptions;
CREATE POLICY "select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own" ON subscriptions;
CREATE POLICY "insert_own" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own" ON subscriptions;
CREATE POLICY "update_own" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own" ON subscriptions;
CREATE POLICY "delete_own" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);
