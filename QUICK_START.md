# 🚀 QUICK START GUIDE - CLOUD VEO3 PRO

> Get your first AI-generated video ad in 5 minutes!

---

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Extract & Install

```bash
# Extract the ZIP file
unzip cloud-veo3-pro-complete.zip
cd cloud-veo3-pro

# Install dependencies
npm install
```

### 2️⃣ Configure API Keys

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your keys:
nano .env
```

Add these keys:
```env
APIFY_API_KEY=apify_api_eHtTX6jfGbHydqi8KqpDHSxcDYO3C10TO4Cb
SHOTSTACK_API_KEY=s9Ka1yB0pxjw68BZAJC0FFTqwgnVZxaKjiP05VYb
OPENAI_API_KEY=sk-your-openai-key-here
```

### 3️⃣ Run!

```bash
# Start the server
npm run dev

# Open browser
# http://localhost:3000
```

---

## 🎯 Test the System

### Option 1: Use the API (Recommended)

```bash
# In a new terminal
curl -X POST http://localhost:3000/api/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "productIdentity": {
      "type": "MacBook Pro M3",
      "category": "electronics",
      "brand": "Apple",
      "materials": ["aluminum", "glass"],
      "keyFeatures": ["M3 chip", "14-inch display"],
      "colors": ["Space Gray", "Silver"]
    },
    "options": {
      "addMusic": true,
      "waitForCompletion": true
    }
  }'
```

### Option 2: Run the Example Script

```bash
npm run test:example
```

---

## 📊 What Happens?

```
1. Logic Extraction    [20-30s]  🔍 Analyzing successful ads
2. Visual Mining        [30-60s]  🎬 Collecting video clips
3. Scene Generation     [15-20s]  ✂️  Creating scenes
4. Video Assembly       [60-120s] 🎥 Merging final video
───────────────────────────────────────────────────────
Total: 2-4 minutes ⏱️
```

---

## ✅ Expected Output

```json
{
  "success": true,
  "data": {
    "renderId": "abc-123-def-456",
    "videoUrl": "https://cdn.shotstack.io/...",
    "status": "done",
    "totalDuration": 5,
    "sceneCount": 3,
    "processingTime": 125000,
    "blueprint": {
      "scenes": 3,
      "targetAudience": "tech enthusiasts",
      "targetEmotion": "excitement"
    },
    "assets": {
      "total": 15,
      "productMatches": 8,
      "logicMatches": 7
    }
  }
}
```

---

## 🔧 Troubleshooting

### Problem: "npm install" fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Try again
npm install
```

### Problem: "API key not found"

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify keys are set
cat .env | grep API_KEY
```

### Problem: "Cannot find module '@/lib/...'"

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Or just use dev mode
npm run dev
```

### Problem: "Render failed"

**Solution:**
```bash
# Check Shotstack API
curl -H "x-api-key: YOUR_SHOTSTACK_KEY" \
  https://api.shotstack.io/v1/sources

# Verify environment
echo $SHOTSTACK_ENV
```

---

## 📝 Quick Test Checklist

- [ ] Extracted ZIP file
- [ ] Ran `npm install`
- [ ] Created `.env` file
- [ ] Added all 3 API keys
- [ ] Started server with `npm run dev`
- [ ] API endpoint responding at `/api/health`
- [ ] Tested video generation
- [ ] Received video URL

---

## 🎉 Success!

If you see a video URL in the response, **congratulations!** 🎊

Your AI video ad generator is working perfectly.

---

## 🔗 Next Steps

1. **Integrate with your UI** - See `README.md` for React components
2. **Customize templates** - Edit `src/lib/shotstack/templates.ts`
3. **Add more scenes** - Modify `src/lib/pipeline/logic-extraction.ts`
4. **Store videos** - Set up Cloudinary integration
5. **Deploy** - Use Vercel, Railway, or your preferred platform

---

## 📞 Need Help?

- Check `README.md` for full documentation
- See `examples/generate-video.ts` for usage examples
- Review `PIPELINE_DETAILED_EXPLANATION.md` for how it works

---

**🚀 Happy video generating!**
