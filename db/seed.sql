-- ============================================================
-- 信阳市建筑装修协会 · 种子数据
-- 在 Supabase SQL Editor 跑完 schema.sql 后再跑本文件
-- ============================================================

-- 协会工作人员（含演示账号 何平俊 · 密码 610059）
insert into association_staff (id, name, phone, role, status) values
  (uuid_generate_v4(), '何平俊', '13507610059', 'super_admin', 'active'),
  (uuid_generate_v4(), '陈秘书', '13800000001', 'secretary',   'active'),
  (uuid_generate_v4(), '张主任', '13800000002', 'reviewer',    'active'),
  (uuid_generate_v4(), '李主任', '13800000003', 'finance',     'active')
on conflict (phone) do nothing;

-- 12 家会员企业
insert into enterprises (slug, name, category, district, founded, staff_size, qualification, tags, short, hero, contact, rating, reviews, cases, verified, featured, status) values
('huatai', '信阳华泰建工有限公司', 'build', '浉河区', 2007, '200-500 人',
  '["市政壹级","建筑总承包壹级","机电安装贰级"]'::jsonb,
  ARRAY['市政','公共建筑','EPC'],
  '深耕本地市政与公共建筑 18 年，年均交付 30+ 项目。',
  '{"brand":"华泰建工","tagline":"营造城市的每一寸根基"}'::jsonb,
  '{"tel":"0376-1234567","addr":"浉河区 · 行政中心"}'::jsonb,
  4.9, 312, 86, true, true, 'active'),

('mingjia', '信阳名家装饰工程有限公司', 'decor', '羊山新区', 2012, '100-200 人',
  '["建筑装修装饰壹级","ISO9001"]'::jsonb,
  ARRAY['家装','整装','全包'],
  '本地 TOP3 整装品牌，699 套餐覆盖 200+ 楼盘。',
  '{"brand":"名家装饰","tagline":"为家而设计 · 699 元/㎡ 整装"}'::jsonb,
  '{"tel":"0376-2345678","addr":"羊山新区 · 中央公园"}'::jsonb,
  4.8, 1284, 542, true, true, 'active'),

('yashe', '雅舍设计事务所', 'design', '平桥区', 2018, '10-30 人',
  '["室内设计专项乙级"]'::jsonb,
  ARRAY['软装','高端住宅','原木风'],
  '8 年获 IFI、IDA 等 14 项国际大奖，专注高端住宅。',
  '{"brand":"雅舍 YASHE","tagline":"在器与境之间，重塑生活的尺度"}'::jsonb,
  '{"tel":"0376-3456789","addr":"平桥区 · 茶都路"}'::jsonb,
  5.0, 86, 124, true, true, 'active'),

('zhongheng', '中恒建设集团信阳分公司', 'build', '浉河区', 1998, '500+ 人',
  '["建筑总承包特级","市政壹级","公路贰级"]'::jsonb,
  ARRAY['特级总包','地产','EPC'],
  '央企背景，承建本地多个亿元级地产与公建项目。',
  '{"brand":"中恒建设","tagline":"国之重器 · 信之所托"}'::jsonb,
  '{"tel":"0376-1110001","addr":"浉河区 · 申城大道"}'::jsonb,
  4.7, 188, 64, true, false, 'active'),

('jiaheyuan', '佳和苑装饰', 'decor', '息县', 2015, '50-100 人',
  '["建筑装修装饰贰级"]'::jsonb,
  ARRAY['家装','半包','县域'],
  '息县家装首选，主打半包 + 透明报价。',
  '{"brand":"佳和苑","tagline":"县域家装 · 一价全包不增项"}'::jsonb,
  '{"tel":"0376-7770001","addr":"息县 · 谯楼路"}'::jsonb,
  4.6, 612, 230, true, false, 'active'),

('yuanjing', '远景空间设计', 'design', '羊山新区', 2020, '10-30 人',
  '["室内设计专项乙级"]'::jsonb,
  ARRAY['公装','餐饮','民宿'],
  '餐饮与民宿空间专家，单店爆款超 40 例。',
  '{"brand":"远景 EnVision","tagline":"用设计为商业引流"}'::jsonb,
  '{"tel":"0376-2220003","addr":"羊山新区 · 创业大道"}'::jsonb,
  4.9, 142, 78, true, false, 'active'),

('jianyu', '信阳建宇建筑工程', 'build', '罗山县', 2010, '100-200 人',
  '["建筑总承包贰级","装修贰级"]'::jsonb,
  ARRAY['县域','公建','返乡'],
  '扎根罗山，承建乡村振兴与县域公建项目。',
  '{"brand":"建宇建筑","tagline":"把好工程做到家门口"}'::jsonb,
  '{"tel":"0376-5550001","addr":"罗山县 · 龙池路"}'::jsonb,
  4.5, 96, 41, true, false, 'active'),

('yipin', '壹品装饰', 'decor', '浉河区', 2010, '100-200 人',
  '["建筑装修装饰壹级"]'::jsonb,
  ARRAY['家装','工装','局装'],
  '本地老牌装饰公司，主打中高端家装与商办工装。',
  '{"brand":"壹品装饰","tagline":"一个家 · 由心而起"}'::jsonb,
  '{"tel":"0376-6660001","addr":"浉河区 · 北京路"}'::jsonb,
  4.7, 802, 318, true, false, 'active'),

('shanshui', '山水景观设计院', 'design', '浉河区', 2016, '30-50 人',
  '["风景园林专项乙级"]'::jsonb,
  ARRAY['景观','园林','文旅'],
  '文旅与公园景观设计专家，深度结合茶文化。',
  '{"brand":"山水设计","tagline":"让风景成为城市的语言"}'::jsonb,
  '{"tel":"0376-8880001","addr":"浉河区 · 茶坡路"}'::jsonb,
  4.8, 58, 92, true, false, 'active'),

('wanjia', '万家美装饰', 'decor', '光山县', 2013, '30-50 人',
  '["建筑装修装饰贰级"]'::jsonb,
  ARRAY['家装','县域','套餐'],
  '光山县口碑家装品牌，主推 588 元/㎡ 套餐。',
  '{"brand":"万家美","tagline":"让万家更美一点"}'::jsonb,
  '{"tel":"0376-9990001","addr":"光山县 · 弦山街"}'::jsonb,
  4.4, 392, 178, true, false, 'active'),

('tongchuang', '同创建工集团', 'build', '浉河区', 2003, '500+ 人',
  '["建筑总承包壹级","市政贰级","装修壹级"]'::jsonb,
  ARRAY['民营','总包','EPC'],
  '本地民营总包标杆，主营商住地产与产业园。',
  '{"brand":"同创建工","tagline":"同行致远 · 创享城市"}'::jsonb,
  '{"tel":"0376-1110002","addr":"浉河区 · 民权路"}'::jsonb,
  4.8, 224, 96, true, false, 'active'),

('lanse', '蓝色空间软装', 'design', '羊山新区', 2019, '10-30 人',
  '["室内设计专项乙级"]'::jsonb,
  ARRAY['软装','样板房','高端'],
  '样板房与高端别墅软装专家，作品登《INTERIOR》。',
  '{"brand":"蓝色空间","tagline":"软装 · 居所的灵魂"}'::jsonb,
  '{"tel":"0376-2220004","addr":"羊山新区 · 楚王城路"}'::jsonb,
  4.9, 92, 46, true, false, 'active')

on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  district = excluded.district,
  founded = excluded.founded,
  staff_size = excluded.staff_size,
  qualification = excluded.qualification,
  tags = excluded.tags,
  short = excluded.short,
  hero = excluded.hero,
  contact = excluded.contact,
  rating = excluded.rating,
  reviews = excluded.reviews,
  cases = excluded.cases,
  verified = excluded.verified,
  featured = excluded.featured;

-- 几条示例新闻
insert into knowledge_items (title, category, tags, excerpt, hot, published_at) values
('GB 50210-2018 建筑装饰装修工程质量验收标准',     '国标规范',  ARRAY['验收','装饰装修','国标'],         '规定了建筑装饰装修工程的施工质量验收要求和方法。', true,  '2018-09-01'),
('信阳市建设工程招投标管理实施细则（2026 修订）', '地方政策',  ARRAY['招投标','本地'],                  '本细则适用于信阳市行政区域内房屋建筑、市政工程的招投标活动。', true, '2026-03-15'),
('JGJ/T 304-2013 住宅室内装饰装修工程质量验收规范','国标规范',  ARRAY['住宅','验收'],                    '明确住宅室内装饰装修工程的检查项目、方法和判定标准。', false,'2013-12-01'),
('工装报备一次通过率提升 35% — 名家装饰最佳实践', '典型案例',  ARRAY['报备','实践'],                    '通过 AI 预审 + 模板化提交，名家装饰 Q1 报备一次通过率显著提升。', true, '2026-04-10'),
('建设工程施工合同（示范文本）GF-2017-0201',     '合同范本',  ARRAY['施工合同','范本'],                '住建部与市场监管总局联合发布的施工合同示范文本。', false,'2017-09-01')
on conflict do nothing;

-- 完成
select '种子数据已就绪' as status,
       (select count(*) from enterprises) as enterprises_count,
       (select count(*) from association_staff) as staff_count,
       (select count(*) from knowledge_items) as knowledge_count;
