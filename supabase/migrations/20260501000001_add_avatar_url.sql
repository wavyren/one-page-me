-- 添加头像 URL 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
