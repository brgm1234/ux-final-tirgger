/**
 * Smart Video Generator - Full UI Integration
 * Connects UI uploads to the Smart Video Pipeline end-to-end.
 *
 * Usage:
 *   import { runSmartVideo } from './runSmartVideoUI';
 *   await runSmartVideo({
 *     productImageUrl: 'https://example.com/product.png',
 *     avatarImageUrl: 'https://example.com/avatar.png',
 *     marketingAngle: 'Product close-up with benefits'
 *   });
 */

import { smartVideoPipeline } from './engines/orchestrator/smartVideoPipeline';
import dotenv from 'dotenv';

dotenv.config(); // load SORA_2_API_KEY and other env variables

export interface SmartVideoInput {
  /** URL to the product image uploaded by the user */
  productImageUrl: string;
  /** URL to the avatar image uploaded by the user */
  avatarImageUrl: string;
  /** Marketing angle selected by the user from the Ad Library dropdown */
  marketingAngle: string;
}

// Trigger full pipeline
export async function runSmartVideo(input: SmartVideoInput) {
  const { productImageUrl, avatarImageUrl, marketingAngle } = input;

  if (!productImageUrl || productImageUrl === 'URL_TO_PRODUCT_PNG_FROM_UI') {
    throw new Error('productImageUrl is required. Pass the actual URL from the UI upload handler.');
  }
  if (!avatarImageUrl || avatarImageUrl === 'URL_TO_AVATAR_PNG_FROM_UI') {
    throw new Error('avatarImageUrl is required. Pass the actual URL from the UI upload handler.');
  }

  try {
    console.log('=== Starting Smart Video Pipeline from UI ===');
    console.log('Product Image:', productImageUrl);
    console.log('Avatar Image:', avatarImageUrl);
    console.log('Marketing Angle:', marketingAngle);

    const videoResult = await smartVideoPipeline({
      productImageUrl,
      avatarImageUrl,
      marketingAngle,
      options: {
        generatePrompt: true,
        generateScript: true,
        sendToSora2: true,
        enableShotstack: true,
        logSteps: true
      }
    });

    if (videoResult.error) {
      console.error('Pipeline failed:', videoResult.error);
      return { success: false, error: videoResult.error };
    }

    console.log('Pipeline completed successfully.');
    console.log('Video URL:', videoResult.videoUrl);
    console.log('Prompt used:', videoResult.prompt);

    return {
      success: true,
      videoUrl: videoResult.videoUrl,
      prompt: videoResult.prompt,
      output: videoResult.output
    };
  } catch (err) {
    console.error('Smart Video Pipeline failed:', err);
    throw err;
  }
}

// CLI execution - only runs when called directly
if (require.main === module) {
  // For direct CLI testing, require env vars or args
  const productImageUrl = process.env.TEST_PRODUCT_IMAGE_URL || process.argv[2];
  const avatarImageUrl = process.env.TEST_AVATAR_IMAGE_URL || process.argv[3];
  const marketingAngle = process.env.TEST_MARKETING_ANGLE || process.argv[4] || 'Product spotlight';

  if (!productImageUrl || !avatarImageUrl) {
    console.error('Usage: npx tsx runSmartVideoUI.ts <productImageUrl> <avatarImageUrl> [marketingAngle]');
    console.error('Or set TEST_PRODUCT_IMAGE_URL and TEST_AVATAR_IMAGE_URL env vars.');
    process.exit(1);
  }

  runSmartVideo({ productImageUrl, avatarImageUrl, marketingAngle })
    .then((result) => {
      console.log('Result:', JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}
