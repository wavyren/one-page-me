-- Phase 6: 分享与传播 — 数据库补充

-- 原子递增 view_count 的 RPC 函数
CREATE OR REPLACE FUNCTION increment_view_count(page_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE pages SET view_count = view_count + 1 WHERE id = page_id;
END;
$$ LANGUAGE plpgsql;

-- page_views 需要允许匿名插入（公开页访问不需要登录）
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views 允许匿名插入" ON page_views
  FOR INSERT WITH CHECK (true);

-- 公开主页的访问记录允许所有人查询（用于统计展示）
CREATE POLICY "page_views 关联公开主页可查询" ON page_views
  FOR SELECT USING (
    page_id IN (SELECT id FROM pages WHERE is_public = true OR auth.uid() = user_id)
  );

-- custom_slug 索引，加速自定义路径查询
CREATE INDEX idx_pages_custom_slug ON pages(custom_slug);

-- page_views page_id 索引，加速统计查询
CREATE INDEX idx_page_views_page_id ON page_views(page_id);

-- page_views ip_hash + created_at 联合索引，加速防刷查询
CREATE INDEX idx_page_views_ip_hash_created ON page_views(ip_hash, created_at);
