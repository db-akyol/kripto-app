-- AI Analyst Database Schema for Supabase

-- Günlük piyasa verileri
CREATE TABLE IF NOT EXISTS market_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  btc_price DECIMAL(18, 2),
  btc_24h_change DECIMAL(8, 4),
  btc_market_cap BIGINT,
  btc_volume BIGINT,
  eth_price DECIMAL(18, 2),
  eth_24h_change DECIMAL(8, 4),
  total_market_cap BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teknik indikatörler
CREATE TABLE IF NOT EXISTS technical_indicators (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  symbol VARCHAR(10) DEFAULT 'BTC',
  rsi_14 DECIMAL(8, 4),
  macd DECIMAL(18, 8),
  macd_signal DECIMAL(18, 8),
  macd_histogram DECIMAL(18, 8),
  ema_20 DECIMAL(18, 2),
  ema_50 DECIMAL(18, 2),
  ema_100 DECIMAL(18, 2),
  ema_200 DECIMAL(18, 2),
  sma_20 DECIMAL(18, 2),
  sma_50 DECIMAL(18, 2),
  sma_100 DECIMAL(18, 2),
  sma_200 DECIMAL(18, 2),
  bb_upper DECIMAL(18, 2),
  bb_middle DECIMAL(18, 2),
  bb_lower DECIMAL(18, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Haberler
CREATE TABLE IF NOT EXISTS news_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  source VARCHAR(100),
  url TEXT,
  sentiment VARCHAR(20), -- positive, negative, neutral
  currencies TEXT[], -- related currencies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- On-chain veriler
CREATE TABLE IF NOT EXISTS onchain_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  hash_rate DECIMAL(18, 2),
  difficulty DECIMAL(24, 2),
  active_addresses INT,
  transaction_count INT,
  avg_transaction_value DECIMAL(18, 8),
  mempool_size INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Türev verileri
CREATE TABLE IF NOT EXISTS derivatives_data (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  open_interest BIGINT,
  funding_rate DECIMAL(12, 8),
  long_short_ratio DECIMAL(8, 4),
  liquidations_24h BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analizleri
CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  analysis TEXT NOT NULL,
  summary TEXT,
  sentiment VARCHAR(20), -- bullish, bearish, neutral
  key_points JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı soruları ve cevapları
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL, -- user, assistant
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date);
CREATE INDEX IF NOT EXISTS idx_technical_date ON technical_indicators(date);
CREATE INDEX IF NOT EXISTS idx_news_date ON news_data(date);
CREATE INDEX IF NOT EXISTS idx_onchain_date ON onchain_data(date);
CREATE INDEX IF NOT EXISTS idx_derivatives_date ON derivatives_data(date);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_date ON ai_analyses(date);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
