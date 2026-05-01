-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(100),
  plan VARCHAR(20) DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  preferred_language VARCHAR(5) DEFAULT 'zh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话会话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  use_case VARCHAR(50),
  language VARCHAR(5) DEFAULT 'zh',
  extracted_data JSONB,
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对话消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 主页表
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  custom_slug VARCHAR(100) UNIQUE,
  html_url TEXT,
  pdf_url TEXT,
  image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  access_password VARCHAR(100),
  og_image_url TEXT,
  view_count INTEGER DEFAULT 0,
  language VARCHAR(5) DEFAULT 'zh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 主页访问日志
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  ip_hash VARCHAR(64),
  user_agent TEXT,
  referer TEXT,
  country VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'CNY',
  plan VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  payment_provider VARCHAR(20),
  pay_type VARCHAR(20),
  provider_transaction_id VARCHAR(200),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只访问自己的对话" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只访问自己的消息" ON messages
  FOR ALL USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
  );

CREATE POLICY "公开主页所有人可读" ON pages
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "用户只能修改自己的主页" ON pages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能看自己的订单" ON orders
  FOR SELECT USING (auth.uid() = user_id);
