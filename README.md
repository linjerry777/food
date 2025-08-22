# 健康餐點推薦系統

基於健檢報告的智能餐點推薦系統，使用 AI 技術分析用戶健康狀況並推薦適合的餐廳和餐點。

## 🚀 技術棧

- **前端框架**: Next.js 14 (App Router)
- **程式語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **認證**: Supabase Auth
- **AI 服務**: Google Gemini AI
- **地圖服務**: Google Maps API
- **部署**: Vercel

## 📁 專案結構

```
src/
├── app/                    # App Router 結構
│   ├── api/               # API routes
│   ├── auth/              # 認證頁面
│   ├── dashboard/         # 用戶儀表板
│   ├── upload/            # 報告上傳
│   └── recommendations/   # 推薦頁面
├── components/            # 共用組件
│   ├── ui/               # 基礎UI組件
│   ├── forms/            # 表單組件
│   └── maps/             # 地圖組件
├── lib/                  # 工具函數
│   ├── supabase/         # Supabase 相關
│   ├── gemini/           # Gemini AI 相關
│   └── utils/            # 通用工具
└── types/                # TypeScript 類型定義
```

## 🛠️ 安裝與設定

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

建立 `.env.local` 檔案並設定以下環境變數：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# 應用程式配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=健康餐點推薦系統

# 檔案上傳配置
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

### 3. 資料庫設定

1. 在 Supabase 中建立新專案
2. 執行 `database-schema.sql` 檔案中的 SQL 語句
3. 設定 Row Level Security (RLS) 政策

### 4. 啟動開發伺服器

```bash
npm run dev
```

## 🎯 核心功能

### 1. 用戶認證

- 註冊/登入功能
- 密碼重設
- 社交登入 (可選)

### 2. 健檢報告上傳

- 支援 PDF、圖片格式
- 拖放上傳介面
- 檔案驗證和預覽

### 3. AI 健康分析

- 使用 Google Gemini AI 分析健檢報告
- 識別關鍵健康指標
- 生成飲食建議和禁忌

### 4. 餐廳推薦

- 基於健康狀況過濾餐廳
- 地理位置搜尋
- 個人化推薦評分

### 5. 地圖整合

- Google Maps 顯示餐廳位置
- 路線規劃功能
- 餐廳資訊卡片

## 📊 資料庫設計

### 主要資料表

1. **users** - 用戶基本資料
2. **health_reports** - 健檢報告
3. **health_analysis** - AI 分析結果
4. **restaurants** - 餐廳資訊
5. **menu_items** - 餐點資料
6. **recommendations** - 推薦記錄
7. **user_preferences** - 用戶偏好設定

### 健康指標支援

- 血壓 (收縮壓/舒張壓)
- 血糖 (空腹、飯後、糖化血色素)
- 膽固醇 (總膽固醇、HDL、LDL、三酸甘油脂)
- 肝功能 (ALT、AST、GGT)
- 腎功能 (肌酸酐、eGFR)
- 甲狀腺功能 (TSH、T3、T4)
- 體重和 BMI

## 🔧 API 端點

### 認證相關

- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/logout` - 用戶登出

### 健檢報告

- `POST /api/reports/upload` - 上傳健檢報告
- `GET /api/reports/[id]` - 取得報告詳情
- `GET /api/reports/user` - 取得用戶所有報告

### AI 分析

- `POST /api/analysis/create` - 觸發 AI 分析
- `GET /api/analysis/[reportId]` - 取得分析結果

### 餐廳推薦

- `GET /api/restaurants/recommendations` - 取得推薦餐廳
- `GET /api/restaurants/nearby` - 附近餐廳搜尋
- `GET /api/restaurants/[id]` - 餐廳詳情

### 用戶偏好

- `GET /api/preferences` - 取得用戶偏好
- `POST /api/preferences` - 更新用戶偏好

## 🎨 UI/UX 特色

- 響應式設計
- 現代化介面
- 無障礙設計 (a11y)
- 台灣用戶習慣優化
- 直觀的操作流程

## 🚀 部署

### Vercel 部署

1. 連接 GitHub 倉庫到 Vercel
2. 設定環境變數
3. 部署專案

### 環境變數設定

在 Vercel 中設定以下環境變數：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## 🧪 測試

```bash
# 單元測試
npm run test

# 監視模式
npm run test:watch

# E2E 測試
npm run test:e2e
```

## 📝 開發規範

### 程式碼規範

- 使用 TypeScript 嚴格模式
- ESLint + Prettier 程式碼格式化
- 函數式組件 + Hooks
- 適當的錯誤處理

### 命名規範

- 文件名: kebab-case
- 組件名: PascalCase
- 函數名: camelCase
- 常量: UPPER_SNAKE_CASE

### Git 提交規範

- feat: 新功能
- fix: 錯誤修復
- docs: 文件更新
- style: 程式碼格式
- refactor: 重構
- test: 測試
- chore: 建構工具

## 🤝 貢獻

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡

- 專案維護者: [您的姓名]
- 電子郵件: [您的郵箱]
- 專案連結: [GitHub 連結]

## 🙏 致謝

- Next.js 團隊
- Supabase 團隊
- Google AI 團隊
- Tailwind CSS 團隊
- 所有開源貢獻者
