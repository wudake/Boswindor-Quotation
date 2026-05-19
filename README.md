# Boswindor Quotation System

Boswindor 门窗报价系统 — 一个面向门窗建材行业的专业报价管理工具，支持 8 步向导式报价、PDF/Excel 双导出、多角色权限管理和完整的后台配置体系。

## 在线访问

开发环境: `http://localhost:4782`

## 功能概览

### 核心报价流程
- **8 步向导式报价**: Client → Project → Settings → Spec → Items → Images → Summary → Preview
- **PDF / Excel 双导出**: 10 模块结构（封面、客户/项目信息、规格、产品总表、详情页、费用汇总、TBC 备注、条款、银行信息、签字页）
- **报价编号自动生成**: `BW-Q-YYYYMMDD-NNN`
- **报价状态管理**: DRAFT / GENERATED / CANCELLED
- **本地草稿缓存**: Zustand persist 到 localStorage

### 权限与认证
- Auth.js v5 + Credentials provider + JWT strategy
- 角色隔离: Admin 看全部，Sales 只看自己的
- Admin 布局带权限拦截 (`/admin/*`)

### Admin 后台管理
- **用户管理**: CRUD、搜索、新增、编辑、禁用/启用、删除
- **公司信息管理**: 公司信息编辑
- **银行账号管理**: CRUD / 设默认
- **配置选项管理**: 16 个分类标签页，向导 Step 1/2/3/4/5 的动态选项加载

### 单元测试
- 40 个 API 路由测试 + 14 个前端组件测试，共 54 个测试全部通过

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 + shadcn/ui (base-nova) |
| 数据库 | PostgreSQL 16 + Prisma 7 + @prisma/adapter-pg |
| ORM | Prisma 7 (自定义输出路径 `src/generated/prisma`) |
| 认证 | Auth.js v5 (next-auth) |
| 状态管理 | Zustand + persist |
| 表单 | React Hook Form + Zod |
| 导出 | Playwright (PDF) + ExcelJS (Excel) |
| 测试 | Vitest + @testing-library/react + jsdom |
| 部署 | Docker Compose |

## 快速开始

### 环境要求
- Node.js 22+
- PostgreSQL 16
- npm / pnpm

### 1. 克隆项目

```bash
git clone https://github.com/wudake/Boswindor-Quotation.git
cd Boswindor-Quotation
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，修改 NEXTAUTH_SECRET 为随机字符串
```

### 4. 生成 Prisma Client

```bash
npx prisma generate
```

### 5. 启动 PostgreSQL (Docker)

```bash
docker-compose up -d db
```

### 6. 初始化数据库

**方式一: 使用数据库迁移**
```bash
npx prisma migrate deploy
npm run seed
```

**方式二: 使用完整数据备份 (含报价单)**
```bash
psql -U postgres -d boswindor < database_dump.sql
```

### 7. 安装 Playwright 浏览器 (PDF 导出需要)

```bash
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
```

### 8. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:4782`

### 默认账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| Admin | `admin@boswindor.com` | `admin123` |
| Sales | `sales@boswindor.com` | `sales123` |

### 运行测试

```bash
npm test
```

## Docker 部署

```bash
docker-compose up -d
```

## 项目结构

```
├── prisma/                    # Prisma schema + migrations + seed
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Dashboard 路由组 (首页、报价列表/新建/编辑/详情)
│   │   ├── admin/              # Admin 后台 (users, company, configurations)
│   │   ├── api/                # API 路由
│   │   │   ├── auth/           # NextAuth 认证
│   │   │   ├── quotations/     # 报价 CRUD + PDF/Excel 导出
│   │   │   ├── users/          # 用户管理
│   │   │   ├── bank-accounts/  # 银行账号
│   │   │   ├── company-info/   # 公司信息
│   │   │   ├── configurations/ # 配置选项
│   │   │   └── export/         # 通用导出
│   │   └── login/              # 登录页
│   ├── components/
│   │   ├── quotation-wizard/   # 8 步向导组件
│   │   └── ui/                 # shadcn/ui 组件
│   ├── lib/
│   │   ├── auth.ts             # Auth.js 配置
│   │   ├── prisma.ts           # Prisma 客户端 (adapter-pg)
│   │   ├── quotation-schema.ts # Zod schema
│   │   ├── quotation-mapper.ts # DB ↔ 导出数据映射
│   │   └── quote-number.ts     # 报价编号生成器
│   ├── stores/
│   │   └── quotation-wizard-store.ts  # Zustand store
│   └── templates/
│       ├── pdf/                # PDF HTML 模板
│       └── excel/              # Excel 模板
├── scripts/                    # 辅助脚本 (数据导入、PDF 生成)
├── database_dump.sql           # 完整数据库备份
├── docker-compose.yml
├── Dockerfile
└── vitest.config.ts
```

## 注意事项

- Prisma 7 的 `datasource` 不能有 `url` 字段，连接通过 adapter 在代码中配置
- `Decimal` 类型需通过 `toNum()` 辅助函数转为 `number` 再传给模板或调用 `toFixed()`
- 开发服务器端口: `4782` (`package.json` 中固定)
- Docker PostgreSQL 映射端口: `3848`

## 版本

**V1.0.0** — 初始发布
