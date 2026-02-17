/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const run = async () => {
  const imagePath = path.join(process.cwd(), "images", "mug_front.png");
  const imageBase64 = fs.readFileSync(imagePath).toString("base64");
  const imageDataUrl = `data:image/png;base64,${imageBase64}`;

  const runPipelineRes = await axios.post(
    `${BASE_URL}/api/run-pipeline`,
    {
      imageDataUrl,
      fileName: "mug_front.png",
      description: "Live pipeline diagnose",
      targetMarket: "Global",
      textContent: "Short test input",
      textFileName: "live-diagnose.txt",
    },
    { timeout: 10 * 60 * 1000 }
  );
  const runPipelineJson = runPipelineRes.data;

  const generateVideoRes = await axios.post(
    `${BASE_URL}/api/generate-video`,
    {
      productIdentity: {
        type: "Test product",
        category: "test",
        materials: [],
        keyFeatures: [],
        colors: [],
      },
      options: { maxSamples: 1, addMusic: false, waitForCompletion: false },
    },
    { timeout: 10 * 60 * 1000 }
  );
  const generateVideoJson = generateVideoRes.data;

  console.log(JSON.stringify({
    runPipeline: { status: runPipelineRes.status, body: runPipelineJson },
    generateVideo: { status: generateVideoRes.status, body: generateVideoJson },
  }, null, 2));
};

run();
