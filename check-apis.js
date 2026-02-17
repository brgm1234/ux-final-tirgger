/* eslint-disable no-console */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const endpoints = {
  health: `${BASE_URL}/api/health`,
  runPipeline: `${BASE_URL}/api/run-pipeline`,
};

const TEST_IMAGE_URL = "https://httpbin.org/image/png";

const callJson = async (url, payload) => {
  const res = await fetch(url, {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  let json = text;
  try {
    json = JSON.parse(text);
  } catch {
    // keep raw text
  }
  return { status: res.status, json };
};

const run = async () => {
  console.log("=== API status check ===");
  console.log("Base URL:", BASE_URL);

  try {
    const health = await callJson(endpoints.health);
    console.log("/api/health status:", health.status);
    console.log("/api/health body:", JSON.stringify(health.json, null, 2));
  } catch (err) {
    console.error("/api/health failed:", err);
  }

  try {
    const payload = {
      url: TEST_IMAGE_URL,
      sceneDescription: "Warm countertop with soft morning light, shallow depth of field, gentle camera push-in, cozy props like a coaster and steam in the background.",
      sceneType: "product",
      targetMarket: "Global",
      language: "English",
      videoGoal: "Ads",
      supplementalImages: [],
    };
    const runPipeline = await callJson(endpoints.runPipeline, payload);
    console.log("/api/run-pipeline status:", runPipeline.status);
    console.log("/api/run-pipeline body:", JSON.stringify(runPipeline.json, null, 2));
  } catch (err) {
    console.error("/api/run-pipeline failed:", err);
  }

  console.log("=== Done ===");
};

run();
