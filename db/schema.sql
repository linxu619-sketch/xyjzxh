-- ============================================================
-- 信阳市建筑装修协会 · Supabase Postgres Schema 草案 (v0.1)
-- 三套独立账号体系 · 多租户子站 · 业务关键表
-- ============================================================
-- 适用：Supabase (Postgres 15+) + Row Level Security
-- 注意：本文件为初始草案，迁移时请使用 supabase db diff 生成 SQL。
-- ============================================================

create extension if not exists "uuid-ossp";

------------------------------------------------------------
-- 1. 账号体系（三库独立）
------------------------------------------------------------

-- 1.1 协会工作人员
create table association_staff (
  id          uuid primary key default uuid_generate_v4(),
  auth_uid    uuid unique,             -- Supabase auth.uid 对应
  name        text not null,
  phone       text unique not null,
  email       text unique,
  role        text not null check (role in ('super_admin','secretary','reviewer','finance','content','support')),
  status      text not null default 'active' check (status in ('active','locked')),
  created_at  timestamptz default now()
);

-- 1.2 企业 & 企业工作人员
create table enterprises (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,    -- 子域名前缀
  name        text not null,
  category    text not null check (category in ('build','decor','design')),
  district    text,
  founded     int,
  staff_size  text,
  qualification jsonb default '[]',
  tags        text[] default '{}',
  short       text,
  hero        jsonb,                   -- 子站 hero 配置
  contact     jsonb,
  rating      numeric(2,1) default 0,
  reviews     int default 0,
  cases       int default 0,
  verified    boolean default false,
  featured    boolean default false,
  status      text not null default 'pending' check (status in ('pending','active','suspended')),
  joined_at   timestamptz,
  created_at  timestamptz default now()
);

create index on enterprises (category, district);
create index on enterprises (slug);

create table enterprise_staff (
  id            uuid primary key default uuid_generate_v4(),
  auth_uid      uuid unique,
  enterprise_id uuid not null references enterprises(id) on delete cascade,
  name          text not null,
  phone         text unique not null,
  email         text,
  role          text not null check (role in ('owner','admin','sales','site_manager','designer','finance','viewer')),
  status        text not null default 'active' check (status in ('active','locked')),
  created_at    timestamptz default now()
);
create index on enterprise_staff (enterprise_id);

-- 1.3 C 端客户
create table customers (
  id          uuid primary key default uuid_generate_v4(),
  auth_uid    uuid unique,
  phone       text unique not null,
  nickname    text,
  avatar_url  text,
  city        text,
  created_at  timestamptz default now()
);

------------------------------------------------------------
-- 2. 业务关键表
------------------------------------------------------------

-- 2.1 工装报备
create table project_reports (
  id            text primary key,              -- 形如 P-2026-0501
  enterprise_id uuid not null references enterprises(id),
  customer_id   uuid references customers(id),
  name          text not null,
  type          text not null check (type in ('家装','工装','公装','市政')),
  area          numeric,
  budget        numeric,                       -- 万元
  district      text,
  start_date    date,
  end_date      date,
  status        text not null default 'submitted' check (status in
    ('draft','submitted','reviewing','approved','in-progress','completed','rejected')),
  progress      int default 0 check (progress between 0 and 100),
  insured       boolean default false,
  payload       jsonb,                         -- 完整表单 + 附件指针
  reviewer_id   uuid references association_staff(id),
  reported_at   timestamptz default now()
);
create index on project_reports (enterprise_id, status);

-- 2.2 消费保险订单
create table insurance_orders (
  id            uuid primary key default uuid_generate_v4(),
  product_id    text not null,
  policy_no     text unique,
  policy_holder text not null,                 -- 投保人姓名
  insured_party text not null,
  customer_id   uuid references customers(id),
  enterprise_id uuid references enterprises(id),
  project_id    text references project_reports(id),
  amount        numeric not null,
  premium       numeric not null,
  start_at      date,
  end_at        date,
  status        text not null default 'pending' check (status in
    ('pending','effective','claiming','expired','cancelled')),
  created_at    timestamptz default now()
);

-- 2.3 金融意向
create table finance_leads (
  id            uuid primary key default uuid_generate_v4(),
  product_id    text not null,
  applicant_type text not null check (applicant_type in ('enterprise','customer')),
  enterprise_id uuid references enterprises(id),
  customer_id   uuid references customers(id),
  amount        numeric,
  term_months   int,
  purpose       text,
  status        text default 'new' check (status in ('new','contacted','pre_approved','rejected','closed')),
  manager_id    uuid references association_staff(id),
  created_at    timestamptz default now()
);

-- 2.4 招聘 / 求职
create table jobs (
  id            uuid primary key default uuid_generate_v4(),
  enterprise_id uuid not null references enterprises(id) on delete cascade,
  title         text not null,
  category      text not null check (category in ('build','decor','design')),
  type          text not null check (type in ('全职','项目制','兼职','实习')),
  salary_min    int,
  salary_max    int,
  district      text,
  experience    text,
  education     text,
  tags          text[] default '{}',
  description   text,
  status        text default 'open' check (status in ('open','paused','closed')),
  posted_at     timestamptz default now()
);
create index on jobs (category, status);

create table resumes (
  id          uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  title       text,
  payload     jsonb,
  created_at  timestamptz default now()
);

create table job_applications (
  id           uuid primary key default uuid_generate_v4(),
  job_id       uuid not null references jobs(id) on delete cascade,
  customer_id  uuid not null references customers(id) on delete cascade,
  resume_id    uuid references resumes(id),
  status       text default 'pending' check (status in
    ('pending','viewed','interview','offer','rejected','withdrawn')),
  applied_at   timestamptz default now(),
  unique (job_id, customer_id)
);

-- 2.5 调解 / 投诉
create table mediations (
  id          uuid primary key default uuid_generate_v4(),
  customer_id uuid references customers(id),
  enterprise_id uuid references enterprises(id),
  project_id  text references project_reports(id),
  category    text,                              -- 工期/质量/材料/合同
  content     text,
  attachments jsonb default '[]',
  status      text default 'submitted' check (status in
    ('submitted','accepted','mediating','resolved','withdrawn','escalated')),
  mediator_id uuid references association_staff(id),
  created_at  timestamptz default now()
);

-- 2.6 评价
create table reviews (
  id            uuid primary key default uuid_generate_v4(),
  enterprise_id uuid not null references enterprises(id) on delete cascade,
  customer_id   uuid not null references customers(id) on delete cascade,
  project_id    text references project_reports(id),
  rating        int not null check (rating between 1 and 5),
  content       text,
  visible       boolean default true,
  created_at    timestamptz default now(),
  unique (project_id, customer_id)               -- 一项目一评价
);

-- 2.7 知识库
create table knowledge_items (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  category    text not null,
  tags        text[] default '{}',
  excerpt     text,
  file_url    text,
  size_bytes  bigint,
  hot         boolean default false,
  published_at date default current_date
);

-- 2.8 AI 会话（仅记元数据 + 摘要，正文走对象存储）
create table ai_conversations (
  id            uuid primary key default uuid_generate_v4(),
  ai_key        text not null,                   -- advisor/decor/.../biz
  actor_type    text not null check (actor_type in ('association','enterprise','customer','anonymous')),
  actor_id      uuid,
  enterprise_id uuid references enterprises(id), -- 在哪个子站发起
  title         text,
  summary       text,
  created_at    timestamptz default now()
);

------------------------------------------------------------
-- 3. RLS 草案（最小集，正式上线前需逐表完善）
------------------------------------------------------------
alter table enterprises enable row level security;
alter table enterprise_staff enable row level security;
alter table project_reports enable row level security;
alter table reviews enable row level security;

-- 公开企业信息读：只展示 active
create policy "public read active enterprises"
  on enterprises for select using (status = 'active');

-- 企业员工只能看自己企业
create policy "enterprise staff scope"
  on enterprise_staff for select using (
    auth.uid() in (
      select auth_uid from enterprise_staff es
      where es.enterprise_id = enterprise_staff.enterprise_id
    )
  );

-- 业主只能看自己提交的报备 / 自己买的保险（示意，需用 customer_id = current customer）
-- 协会员工通过 staff role 旁路（用 service key）

------------------------------------------------------------
-- 4. 电子协议与签署存证（《电子签名法》《民法典》《PIPL》合规）
------------------------------------------------------------

-- 4.1 协议模板（含版本管理）
create table agreement_templates (
  id            uuid primary key default uuid_generate_v4(),
  code          text not null,                           -- 业务编码 ENT-MEMBERSHIP
  version       text not null,                           -- semver 1.2.0
  title         text not null,
  category      text not null check (category in
    ('membership','privacy','data_processing','consent_sensitive',
     'consent_cross_border','insurance','supervisor','ndma','compliance')),
  target        text not null check (target in
    ('enterprise','enterprise_staff','practitioner','customer','association_staff','public')),
  status        text not null default 'draft' check (status in ('draft','published','archived')),
  required      boolean default true,
  requires_separate_consent boolean default false,        -- PIPL § 14
  requires_resign_on_change boolean default true,
  min_read_seconds int default 30,                        -- 防"秒签"
  effective_at  date,
  expires_at    date,
  drafted_by    text,
  reviewed_by   text,                                     -- 法务
  approved_by   text,                                     -- 秘书长
  approved_at   date,
  content       text not null,                            -- markdown
  highlights    jsonb default '[]',                       -- 重点条款列表
  changelog     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (code, version)
);
create index on agreement_templates (target, status);

-- 4.2 协议签署存证（合规核心）
create table agreement_signatures (
  id            uuid primary key default uuid_generate_v4(),
  serial_no     text unique not null,                     -- ESB-2026-001142
  template_id   uuid not null references agreement_templates(id),
  template_code text not null,
  template_version text not null,
  content_hash  text not null,                            -- sha256 协议正文

  -- 签署人
  signer_type   text not null check (signer_type in
    ('enterprise','enterprise_staff','practitioner','customer','association_staff')),
  signer_id     uuid not null,
  signer_real_name text not null,
  signer_id_card_hash text,                               -- 身份证哈希（非明文）
  signer_phone  text not null,

  -- 证据
  signed_at     timestamptz not null default now(),
  signing_ip    inet,
  signing_ua    text,
  device_fingerprint_hash text,
  read_seconds  int,
  scroll_completion_pct int,
  highlights_acknowledged jsonb default '[]',             -- index 数组

  -- 第三方
  esign_provider text check (esign_provider in
    ('e_qianbao','shangshangqian','fadada','native','demo')),
  esign_serial_no text,
  pdf_archive_url text,
  blockchain_tx_id text,

  -- 状态
  status        text not null default 'active' check (status in
    ('active','revoked','superseded','expired')),
  revoked_at    timestamptz,
  revoke_reason text,
  superseded_by uuid references agreement_signatures(id),

  created_at    timestamptz default now()
);
create index on agreement_signatures (signer_type, signer_id);
create index on agreement_signatures (template_code, template_version);
create index on agreement_signatures (status);

-- 4.3 待签队列（升级后需重签）
create table agreement_pending (
  id            uuid primary key default uuid_generate_v4(),
  signer_type   text not null,
  signer_id     uuid not null,
  template_id   uuid not null references agreement_templates(id),
  reason        text,                                     -- 'new_user' / 'version_changed' / ...
  created_at    timestamptz default now(),
  expires_at    timestamptz,                              -- 必须在此前签
  unique (signer_type, signer_id, template_id)
);
create index on agreement_pending (signer_type, signer_id);

-- RLS：签署记录用户只能看自己的
alter table agreement_signatures enable row level security;
create policy "signers see own signatures" on agreement_signatures
  for select using (
    -- service key 旁路；前端 anon 时按 auth.uid() = signer_id（演示用，需 auth 接入后再启用）
    true
  );
