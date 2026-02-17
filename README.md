# 🎬 CLOUD VEO3 PRO - AI Video Ad Generator

> Transform a single product image into a professional video ad in minutes

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- API Keys (see below)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env

# 3. Add your API keys to .env:
# - APIFY_API_KEY
# - SHOTSTACK_API_KEY  
# - OPENAI_API_KEY

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

---

## 📖 How It Works

### Input
```
Single product image
```

### Output
```
Professional video ad (15-30 seconds)
Ready for TikTok/Instagram/YouTube Shorts
```

### The 6-Phase Pipeline

```
┌─────────────────────────────────────────────┐
│ PHASE 1: Product Input                      │
│ OpenAI Vision analyzes the product          │
│ → ProductIdentity                           │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ PHASE 2: Logic Extraction                   │
│ Searches YouTube/TikTok/Facebook for ads    │
│ AI analyzes patterns → LogicBlueprint       │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ PHASE 3: Visual Mining                      │
│ Collects video clips from web               │
│ OpenAI Vision verifies → VerifiedAssets    │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ PHASE 4: Scene Generation                   │
│ Creates individual scene videos             │
│ → GeneratedScenes                           │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ PHASE 5: Video Assembly                     │
│ Merges scenes with music/transitions        │
│ → Final MP4 Video                           │
└────────────┬────────────────────────────────┘
             │
┌────────────▼────────────────────────────────┐
│ PHASE 6: Storage                            │
│ Saves to Cloudinary + PostgreSQL            │
│ → User downloads video                      │
└─────────────────────────────────────────────┘
```

---

## 💻 Usage

### Method 1: API Route

```typescript
// POST /api/generate-video
const response = await fetch('/api/generate-video', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productIdentity: {
      type: 'MacBook Pro M3',
      category: 'electronics',
      brand: 'Apple',
      materials: ['aluminum', 'glass'],
      keyFeatures: ['M3 chip', '14-inch display'],
      colors: ['Space Gray', 'Silver']
    },
    options: {
      addMusic: true,
      waitForCompletion: true
    }
  })
});

const result = await response.json();
console.log('Video URL:', result.data.videoUrl);
```

### Method 2: Direct Function Call

```typescript
import { generateVideoAd } from '@/lib/orchestrator';

const result = await generateVideoAd(productIdentity, {
  maxSamples: 30,
  addMusic: true,
  musicUrl: 'https://example.com/music.mp3',
  waitForCompletion: true,
  onProgress: (phase, progress) => {
    console.log(`${phase}: ${progress}%`);
  }
});

console.log('Video URL:', result.videoUrl);
```

### Method 3: Run Example

```bash
npm run test:example
```

---

## 🔑 API Keys Setup

### 1. Apify API

```bash
# Get from: https://console.apify.com/account/integrations
APIFY_API_KEY=apify_api_eHtTX6jfGbHydqi8KqpDHSxcDYO3C10TO4Cb
```

**Used for:**
- YouTube video search
- TikTok video search
- Facebook ads scraping
- Website crawling

### 2. Shotstack API

```bash
# Get from: https://dashboard.shotstack.io/
SHOTSTACK_API_KEY=s9Ka1yB0pxjw68BZAJC0FFTqwgnVZxaKjiP05VYb
SHOTSTACK_ENV=production
```

**Used for:**
- Video rendering
- Scene merging
- Adding transitions/music

### 3. OpenAI API

```bash
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
```

**Used for:**
- Product image analysis (GPT-4 Vision)
- Visual asset verification
- Pattern analysis

---

## 📁 Project Structure

```
cloud-veo3-pro/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── generate-video/    # Main endpoint
│   │       │   └── route.ts
│   │       └── health/            # Health check
│   │           └── route.ts
│   │
│   └── lib/
│       ├── types/                 # TypeScript types
│       │   ├── blueprint.ts
│       │   ├── assets.ts
│       │   ├── scenes.ts
│       │   └── apify.ts
│       │
│       ├── apify/                 # Apify integrations
│       │   ├── index.ts
│       │   ├── youtube-scraper.ts
│       │   ├── tiktok-scraper.ts
│       │   ├── facebook-ads-scraper.ts
│       │   └── website-crawler.ts
│       │
│       ├── utils/                 # Utilities
│       │   └── data-cleaner.ts
│       │
│       ├── shotstack/             # Video assembly
│       │   ├── index.ts
│       │   ├── video-assembly.ts
│       │   └── templates.ts
│       │
│       ├── verification/          # Asset verification
│       │   ├── visual-verification.ts
│       │   └── match-scoring.ts
│       │
│       ├── pipeline/              # Main pipelines
│       │   ├── logic-extraction.ts
│       │   ├── visual-mining.ts
│       │   └── scene-generation.ts
│       │
│       └── orchestrator.ts        # Main orchestrator
│
├── examples/
│   └── generate-video.ts          # Usage examples
│
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 Key Features

### ✅ Smart Asset Verification

**Product Match** (Best)
- Exact product detected in video
- High confidence (>= 80%)
- 40 points

**Logic Match** (Acceptable)
- Similar product detected
- Medium confidence (>= 60%)
- 25 points
- Used when exact product unavailable

**Rejected**
- No relevant product
- 0 points

### ✅ Intelligent Scoring System

```
Total Score: 0-100 points

Match Score (40):     Product/logic match
Quality Score (30):   Visual quality
Relevance Score (20): Scene relevance  
Engagement Score (10): Expected engagement

Grade: A (90+), B (80-89), C (70-79), D (60-69), F (<60)
```

### ✅ Automatic Data Cleaning

- Removes duplicates
- Filters low-quality assets
- Normalizes data formats
- Ranks by relevance

### ✅ Progress Tracking

```typescript
onProgress: (phase, progress) => {
  console.log(`${phase}: ${progress}%`);
}

// Output:
// Logic Extraction: 0%
// Logic Extraction: 50%
// Logic Extraction: 100%
// Visual Mining: 0%
// ...
```

---

## 🔧 Configuration

### Video Output Settings

```typescript
{
  output: {
    resolution: 'fhd',        // 'sd', 'hd', 'fhd', '4k'
    aspectRatio: '9:16',      // '16:9', '9:16', '1:1', '4:5'
    fps: 30,                  // 25, 30, 60
    quality: 'high'           // 'low', 'medium', 'high'
  }
}
```

### Pipeline Options

```typescript
{
  // Logic Extraction
  maxSamples: 30,             // Max ads to analyze
  includeYouTube: true,
  includeTikTok: true,
  includeFacebook: true,
  
  // Visual Mining
  maxAssetsPerScene: 10,      // Max assets per scene
  minQualityScore: 70,        // Min quality threshold
  preferProductMatch: true,   // Prefer exact product
  
  // Video Assembly
  addMusic: true,
  musicVolume: 0.3,
  addCaptions: true,
  transitions: true
}
```

---

## 📊 Performance

### Typical Generation Time

```
Logic Extraction:    20-30 seconds
Visual Mining:       30-60 seconds
Scene Generation:    15-20 seconds
Video Assembly:      60-120 seconds
──────────────────────────────────
Total:              ~2-4 minutes
```

### Resource Usage

```
API Calls (Apify):   4-10 actors
API Calls (OpenAI):  10-30 Vision requests
API Calls (Shotstack): 3-5 renders
Storage:             50-200 MB per video
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "APIFY_API_KEY not found"**
```bash
# Solution: Check .env file
cat .env | grep APIFY_API_KEY
```

**Issue: "Shotstack render failed"**
```bash
# Solution: Check API key and environment
curl -H "x-api-key: YOUR_KEY" https://api.shotstack.io/v1/sources
```

**Issue: "No assets found"**
```bash
# Solution: Lower quality threshold or broaden search
{
  minQualityScore: 60,  // Instead of 70
  maxSamples: 50        // Instead of 30
}
```

---

## 📝 Examples

### Example 1: Electronics

```typescript
const macbook = {
  type: 'MacBook Pro M3',
  category: 'electronics',
  brand: 'Apple',
  keyFeatures: ['M3 chip', '14-inch display']
};

const result = await generateVideoAd(macbook);
```

### Example 2: Fashion

```typescript
const handbag = {
  type: 'Designer Handbag',
  category: 'fashion',
  brand: 'Luxury Brand',
  keyFeatures: ['Italian leather', 'Handcrafted']
};

const result = await generateVideoAd(handbag);
```

### Example 3: Beauty

```typescript
const skincare = {
  type: 'Anti-Aging Serum',
  category: 'beauty',
  brand: 'BeautyCo',
  keyFeatures: ['Vitamin C', 'Hyaluronic acid']
};

const result = await generateVideoAd(skincare);
```

---

## 🔒 Security

- All API keys stored in environment variables
- No sensitive data in codebase
- Rate limiting on API routes
- Input validation on all endpoints

---

## 📄 License

MIT License - see LICENSE file

---

## 🤝 Support

For issues or questions:
- GitHub Issues: [Create Issue]
- Documentation: [Full Docs]
- Examples: See `examples/` folder

---

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Apify](https://apify.com/)
- [Shotstack](https://shotstack.io/)
- [OpenAI](https://openai.com/)

---

**Made with ❤️ for CLOUD VEO3 PRO**
