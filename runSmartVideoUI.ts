/**
 * Smart Video Generator - Full UI Integration Prompt
 * Use this script to connect UI uploads to the Smart Video Pipeline end-to-end.
 */

import { smartVideoPipeline } from './engines/orchestrator/smartVideoPipeline';
import dotenv from 'dotenv';

dotenv.config(); // load SORA_2_API_KEY and other env variables

// Example UI inputs (replace with actual UI upload handlers)
const productImageUrl = 'URL_TO_PRODUCT_PNG_FROM_UI';
const avatarImageUrl = 'URL_TO_AVATAR_PNG_FROM_UI';
const userSelectedMarketingAngle = 'user selects from Ad Library dropdown';

// Trigger full pipeline
async function runSmartVideo() {
  try {
    console.log('=== بدء تنفيذ Smart Video Pipeline من واجهة المستخدم ===');
    const videoResult = await smartVideoPipeline({
      productImageUrl,
      avatarImageUrl,
      marketingAngle: userSelectedMarketingAngle,
      options: {
        generatePrompt: true,
        generateScript: true,
        sendToSora2: true,
        enableShotstack: true,
        logSteps: true
      }
    });

    if (videoResult.error) {
      console.error('فشل التنفيذ:', videoResult.error);
      // يمكن عرض رسالة خطأ في الواجهة هنا
    } else {
      console.log('تم التنفيذ بنجاح.');
      console.log('رابط الفيديو النهائي:', videoResult.videoUrl);
      console.log('النص المستخدم (prompt):', videoResult.prompt);
      console.log('تفاصيل المخرجات:', videoResult.output);
      // يمكن عرض حالة التنفيذ والمخرجات في الواجهة هنا
    }
  } catch (err) {
    console.error('Smart Video Pipeline failed:', err);
    // يمكن عرض رسالة خطأ في الواجهة هنا
  }
}

// Execute
runSmartVideo();
