# SETUP GUIDE - CLOUD VEO3 PRO

1. Copy `.env` to project root.
2. Run `npm install`.
3. Test APIs: `npm run test:apis`.
4. Start dev server: `npm run dev`.
5. Check each actor pipeline:
   - Facebook: runActor('FACEBOOK', {...})
   - TikTok: runActor('TIKTOK', {...})
   - YouTube: runActor('YOUTUBE', {...})
6. Use OpenAI, Veo3Fast, Cloudinary, Shotstack, Mistral as configured in `.env`.
7. Verify visual pipelines with `verifyVisual()`.
