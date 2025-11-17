# 🚀 Panduan Deploy ke Vercel

## 📋 Langkah-langkah Deployment

### 1. Setup Repository
1. Push kod anda ke GitHub repository
2. Pastikan semua file konfigurasi sudah ada:
   - `vercel.json` ✅
   - `.env.example` ✅
   - `package.json` dengan script yang betul ✅

### 2. Login ke Vercel
1. Pergi ke [vercel.com](https://vercel.com)
2. Login dengan GitHub account anda
3. Klik **"New Project"**

### 3. Import Repository
1. Pilih repository `sharelinktele` anda
2. Klik **"Import"**
3. Vercel akan auto-detect framework (Vite)

### 4. Configure Environment Variables
Dalam Vercel dashboard, pergi ke **Settings > Environment Variables** dan tambah:

```
DATABASE_URL = your_neon_database_url
TELEGRAM_BOT_TOKEN = your_telegram_bot_token  
TELEGRAM_CHANNEL_ID = your_telegram_channel_id
NODE_ENV = production
```

### 5. Deploy Settings
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 6. Deploy
1. Klik **"Deploy"**
2. Tunggu process selesai (biasanya 1-2 minit)
3. Anda akan dapat domain seperti: `your-app.vercel.app`

## 🔧 Troubleshooting

### Jika Build Gagal:
1. Check build logs dalam Vercel dashboard
2. Pastikan semua dependencies ada dalam `package.json`
3. Check environment variables betul-betul set

### Jika Database Error:
1. Pastikan DATABASE_URL betul dalam environment variables
2. Test connection dari local dulu
3. Check Neon database masih active

### Jika API Routes Tak Berfungsi:
1. Check `vercel.json` routing configuration
2. Pastikan server exports betul dalam `server/index.ts`

## 📱 Custom Domain (Optional)
1. Dalam Vercel dashboard, pergi ke **Settings > Domains**
2. Tambah domain anda
3. Update DNS settings mengikut arahan Vercel

## 🔄 Auto Deployment
Setiap kali anda push ke main branch, Vercel akan auto-deploy!

## 📞 Support
Jika ada masalah, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://discord.gg/vercel)