/* eslint-disable no-console */
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const submitUrl = "https://api.vidgo.ai/api/generate/submit";
const statusUrl = "https://api.vidgo.ai/api/generate/status";
const apiKey = process.env.SORA_2_API_KEY || "";

const payload = {
  model: process.env.NANO_BANANA_EDIT_MODEL || "gpt-image-1.5",
  callback_url: null,
  input: {
    prompt: "Generate clear product images based on the extracted logic and product details.",
    size: "1:1",
    n: 1,
  },
};

const run = async () => {
  const submitRes = await fetch(submitUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const submitText = await submitRes.text();
  const submitJson = JSON.parse(submitText);
  const taskId = submitJson?.data?.task_id;
  console.log("submit:", submitJson);

  const pollRes = await fetch(`${statusUrl}/${taskId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
  const pollText = await pollRes.text();
  let pollJson = pollText;
  try { pollJson = JSON.parse(pollText); } catch {}
  console.log("status:", pollJson);
};

run();
