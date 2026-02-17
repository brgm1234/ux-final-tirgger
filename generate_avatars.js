require('dotenv').config({ path: '.env.local' });
if (!process.env.SORA_2_API_KEY) {
  console.error("SORA_2_API_KEY is not loaded.");
  process.exit(1);
}
console.log("API key loaded:", process.env.SORA_2_API_KEY ? "YES" : "NO");

async function main() {
  const fs = require('fs');
  const path = require('path');
  const axios = require('axios');
  const config = JSON.parse(fs.readFileSync('./avatar_generation_config.json'));
  const apiKey = process.env.SORA_2_API_KEY;
  const submitUrl = process.env.VIDGO_SUBMIT_URL || 'https://api.vidgo.ai/api/generate/submit';
  const statusBase = process.env.VIDGO_STATUS_URL || 'https://api.vidgo.ai/api/generate/status';
  const POLL_INTERVAL_MS = 3000;
  const TIMEOUT_MS = 90000;

  async function submitVidgoTask(prompt) {
    if (!apiKey) throw new Error('Missing SORA_2_API_KEY');
    const model = process.env.NANO_BANANA_EDIT_MODEL || 'gpt-image-1.5';
    const input = {
      prompt,
      size: '1:1',
      n: 1
    };
    const payload = {
      model,
      callback_url: null,
      input,
    };
    console.log('VIDGO SUBMIT ENDPOINT:', submitUrl);
    console.log('Request payload:', JSON.stringify(payload, null, 2));
    try {
      const res = await axios.post(submitUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Submit response:', JSON.stringify(res.data, null, 2));
      const taskId = res.data?.data?.task_id || res.data?.task_id || res.data?.id;
      if (!taskId) throw new Error('Vidgo submit did not return task_id');
      return taskId;
    } catch (err) {
      if (err.response) {
        console.error('Submit failed:');
        console.error('  status:', err.response.status);
        console.error('  statusText:', err.response.statusText);
        console.error('  response body:', JSON.stringify(err.response.data, null, 2));
        console.error('  request payload:', JSON.stringify(payload, null, 2));
      } else {
        console.error('Submit failed:', err.message);
      }
      throw new Error('Submit failed');
    }
  }

  async function pollVidgoTask(taskId) {
    if (!apiKey) throw new Error('Missing SORA_2_API_KEY');
    const statusUrl = `${statusBase}/${taskId}`;
    const start = Date.now();
    while (Date.now() - start < TIMEOUT_MS) {
      console.log('VIDGO POLL ENDPOINT:', statusUrl);
      try {
        const res = await axios.get(statusUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Poll response:', JSON.stringify(res.data, null, 2));
        const status = String(res.data?.data?.status || res.data?.status || '').toLowerCase();
        if (status === 'finished' || status === 'completed' || status === 'success' || status === 'succeeded') {
          const files = res.data?.data?.files || res.data?.files;
          if (Array.isArray(files) && files.length > 0) {
            // Extract the actual URL string from the file object
            const fileObj = files[0];
            const imageUrl = typeof fileObj === 'string' ? fileObj : fileObj.file_url || fileObj.url;
            if (!imageUrl || typeof imageUrl !== 'string') throw new Error('No valid file_url in Vidgo response');
            return imageUrl;
          }
          throw new Error('No files in finished Vidgo response');
        }
        if (status === 'failed' || status === 'error') throw new Error('Vidgo task failed');
      } catch (err) {
        if (err.response) {
          console.error('Poll failed:');
          console.error('  status:', err.response.status);
          console.error('  statusText:', err.response.statusText);
          console.error('  response body:', JSON.stringify(err.response.data, null, 2));
        } else {
          console.error('Poll failed:', err.message);
        }
        throw new Error('Poll failed');
      }
      await new Promise(res => setTimeout(res, POLL_INTERVAL_MS));
    }
    throw new Error('Polling timed out after 90 seconds');
  }

  async function downloadImage(url, savePath, retry = 2) {
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        console.log("Downloading avatar:", url);
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        if (res.status !== 200) throw new Error('Image download failed: ' + res.status);
        fs.writeFileSync(savePath, res.data);
        return;
      } catch (err) {
        if (attempt === retry) throw err;
        console.error(`Download failed (attempt ${attempt + 1}):`, err.message);
      }
    }
  }

  async function generateAvatar(prompt, savePath, retry = 2) {
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        console.log(`Submitting task (attempt ${attempt + 1}) for: ${savePath}`);
        const taskId = await submitVidgoTask(prompt);
        console.log(`Task submitted: ${taskId}`);
        const imageUrl = await pollVidgoTask(taskId);
        console.log(`Task finished. Downloading image:`, imageUrl);
        await downloadImage(imageUrl, savePath, 2);
        console.log(`Image saved: ${savePath}`);
        return true;
      } catch (err) {
        console.error(`Error for ${savePath} (attempt ${attempt + 1}): ${err.message}`);
        if (attempt === retry) return false;
      }
    }
    return false;
  }

  for (const type in config) {
    const folder = config[type].save_path;
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const prompts = config[type].prompts;
    const count = 1; // Force only 1 avatar per type
    const retry = config[type].retry_on_fail || 2;
    let successCount = 0;
    let failCount = 0;
    for (let i = 0; i < count; i++) {
      const prompt = prompts[i % prompts.length];
      const savePath = path.join(folder, `${type}_${i + 1}.png`);
      if (fs.existsSync(savePath)) {
        console.log(`Exists: ${savePath}`);
        successCount++;
        continue;
      }
      const success = await generateAvatar(prompt, savePath, retry);
      if (success) successCount++;
      else failCount++;
    }
    console.log(`\nSummary for ${type}: ${successCount} succeeded, ${failCount} failed\n`);
  }
  console.log('Avatar generation complete.');
}

main();
