# 部署指南

本文件說明如何將健康餐點推薦系統部署到生產環境。

## 🚀 部署選項

### 1. Vercel 部署（推薦）

Vercel 是 Next.js 的官方部署平台，提供最佳的效能和開發體驗。

#### 步驟：

1. **準備專案**

   ```bash
   # 確保所有依賴已安裝
   npm install

   # 執行建構測試
   npm run build
   ```

2. **連接 Vercel**
   - 前往 [Vercel](https://vercel.com)
   - 使用 GitHub 帳號登入
   - 點擊 "New Project"
   - 選擇您的 GitHub 倉庫

3. **設定環境變數**
   在 Vercel 專案設定中新增以下環境變數：

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_APP_NAME=健康餐點推薦系統
   MAX_FILE_SIZE=10485760
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
   ```

4. **部署設定**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **部署**
   - 點擊 "Deploy"
   - 等待部署完成
   - 設定自定義域名（可選）

### 2. 其他平台部署

#### Netlify

```bash
# 建構專案
npm run build

# 部署到 Netlify
netlify deploy --prod --dir=.next
```

#### Railway

```bash
# 連接 Railway
railway login
railway init
railway up
```

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## 🔧 環境設定

### Supabase 設定

1. **建立 Supabase 專案**
   - 前往 [Supabase](https://supabase.com)
   - 建立新專案
   - 記錄專案 URL 和 API 金鑰

2. **執行資料庫 Schema**

   ```sql
   -- 在 Supabase SQL Editor 中執行
   -- 複製 database-schema.sql 的內容並執行
   ```

3. **設定 Storage Bucket**

   ```sql
   -- 建立健康報告儲存桶
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('health-reports', 'health-reports', true);
   ```

4. **設定 Storage 政策**

   ```sql
   -- 允許用戶上傳自己的檔案
   CREATE POLICY "Users can upload own files" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'health-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- 允許用戶查看自己的檔案
   CREATE POLICY "Users can view own files" ON storage.objects
   FOR SELECT USING (bucket_id = 'health-reports' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### Google Gemini AI 設定

1. **取得 API 金鑰**
   - 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
   - 建立新的 API 金鑰
   - 設定配額限制

2. **設定環境變數**
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```

### Google Maps API 設定

1. **建立專案和 API 金鑰**
   - 前往 [Google Cloud Console](https://console.cloud.google.com)
   - 建立新專案
   - 啟用 Maps JavaScript API
   - 建立 API 金鑰

2. **設定域名限制**
   - 在 API 金鑰設定中限制域名
   - 新增您的部署域名

3. **設定環境變數**
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## 📊 監控和維護

### 效能監控

1. **Vercel Analytics**
   - 在 Vercel 中啟用 Analytics
   - 監控 Core Web Vitals
   - 追蹤用戶行為

2. **錯誤監控**
   - 使用 Sentry 或類似服務
   - 監控 API 錯誤
   - 追蹤用戶回報問題

### 資料庫維護

1. **定期備份**

   ```sql
   -- 在 Supabase 中設定自動備份
   -- 或使用 pg_dump 手動備份
   pg_dump -h your-db-host -U your-user -d your-db > backup.sql
   ```

2. **效能優化**
   ```sql
   -- 定期分析資料表
   ANALYZE health_reports;
   ANALYZE health_analysis;
   ANALYZE recommendations;
   ```

### 安全性檢查

1. **定期更新依賴**

   ```bash
   npm audit
   npm update
   ```

2. **檢查 API 金鑰**
   - 定期輪換 API 金鑰
   - 監控 API 使用量
   - 檢查異常活動

## 🚨 故障排除

### 常見問題

1. **建構失敗**

   ```bash
   # 清除快取
   rm -rf .next
   rm -rf node_modules
   npm install
   npm run build
   ```

2. **環境變數問題**
   - 檢查所有環境變數是否正確設定
   - 確認變數名稱拼寫正確
   - 重新部署專案

3. **資料庫連接問題**
   - 檢查 Supabase 專案狀態
   - 確認 API 金鑰正確
   - 檢查網路連接

4. **AI 分析失敗**
   - 檢查 Gemini API 配額
   - 確認 API 金鑰有效
   - 檢查請求格式

### 支援

如果遇到問題，請：

1. 檢查 [Vercel 文件](https://vercel.com/docs)
2. 查看 [Supabase 文件](https://supabase.com/docs)
3. 參考 [Next.js 文件](https://nextjs.org/docs)
4. 在 GitHub Issues 中回報問題

## 📈 擴展建議

1. **CDN 設定**
   - 使用 Cloudflare 或類似服務
   - 快取靜態資源
   - 提升全球訪問速度

2. **資料庫優化**
   - 考慮使用讀取副本
   - 實作資料庫分片
   - 優化查詢效能

3. **監控升級**
   - 實作 APM 工具
   - 設定告警機制
   - 建立儀表板

4. **安全性增強**
   - 實作 WAF
   - 設定 DDoS 防護
   - 定期安全掃描
