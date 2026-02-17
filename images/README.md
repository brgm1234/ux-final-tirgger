# Product Images Directory

Place your product images in this directory for the pipeline to use.

## Expected Files

- `product_sample.png` â Sample product image for testing the preview-prompt pipeline
- `*.png` or `*.jpg` â Any product images referenced by `run_pipeline.ts`

## Requirements

- **Format:** PNG or JPEG
- **Minimum size:** At least 256x256 pixels recommended
- **Background:** Transparent or clean background preferred for best results
- **File size:** Under 10MB per image

## How Images Flow Through the Pipeline

1. **UI Upload** â User uploads product image via the web interface
2. **Backend Processing** â Image is validated and optionally background-removed (withoutBG)
3. **Prompt Generation** â Vision analyzer extracts product truth from the image
4. **Sora-2 API** â Image is sent as a reference for image-to-video generation
5. **Shotstack** â Final video is assembled with generated clips

## Notes

- If no product image is provided, `run_pipeline.ts` will throw an error (it does NOT silently create placeholder images)
- For testing, place a `product_sample.png` here and run `npx tsx preview-prompt.ts`
- The `preview-prompt.ts` script will auto-detect images in this directory
