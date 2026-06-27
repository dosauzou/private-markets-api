-- Enable pg_trgm extension for trigram-based text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex: GIN trigram index on Fund.name for efficient case-insensitive ILIKE searches
CREATE INDEX "fund_name_trgm_idx" ON "Fund" USING GIN (name gin_trgm_ops);
