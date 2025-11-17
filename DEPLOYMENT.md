# 🚀 Panduan Deploy ke Vercel

## 📋 Langkah-langkah Deployment

### 1. Setup Repository ✅
Repository sudah siap dengan:
- `vercel.json` - Konfigurasi deployment ✅
- `api/index.ts` - Serverless function untuk API ✅
- `.env.example` - Template environment variables ✅
- Build configuration yang betul ✅

### 2. Deploy ke Vercel

#### Via Vercel Website:
1. Pergi ke [vercel.com](https://vercel.com)
2. Login dengan GitHub account
3. Klik **"New Project"**
4. Import repository `sharelinktele`
5. **Framework**: Vite (auto-detected)
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist/public`

#### Via Vercel CLI (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables
Dalam Vercel dashboard, pergi ke **Settings > Environment Variables** dan tambah:

```
DATABASE_URL = your_neon_database_url
TELEGRAM_BOT_TOKEN = your_telegram_bot_token  
TELEGRAM_CHANNEL_ID = your_telegram_channel_id
NODE_ENV = production
```

**PENTING**: Pastikan semua environment variables di set sebelum deploy!

### 4. Verify Deployment
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api/files`

## 🔧 Common Issues & Solutions

### Build Error:
```bash
# Test build locally first
npm run build
```

### API Not Working:
- Check environment variables dalam Vercel dashboard
- Verify `api/index.ts` file exists
- Check function logs dalam Vercel dashboard

### Database Connection Error:
```
Error: DATABASE_URL must be set
```
**Solution**: Set DATABASE_URL dalam Vercel environment variables

### Telegram Bot Error:
```
Error: TELEGRAM_BOT_TOKEN must be set
```
**Solution**: Set TELEGRAM_BOT_TOKEN dan TELEGRAM_CHANNEL_ID

## 🚀 Quick Deploy Commands

```bash
# 1. Final check
npm run build

# 2. Deploy with Vercel CLI
npx vercel --prod

# 3. Set environment variables (if first time)
npx vercel env add DATABASE_URL
npx vercel env add TELEGRAM_BOT_TOKEN
npx vercel env add TELEGRAM_CHANNEL_ID
```

## 📱 Custom Domain (Optional)
1. Dalam Vercel dashboard → **Settings > Domains**
2. Add your domain
3. Update DNS records mengikut arahan

## 🔄 Auto Deployment
Every push ke `main` branch akan auto-deploy! 🎉

---
**Status**: ✅ Ready for deployment!
**Last updated**: Nov 17, 2025