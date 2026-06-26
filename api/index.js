import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const CONFIG_PATH = path.join(__dirname, 'server_config.json');
let memoryConfig = null;
const CLOUD_KV_APPKEY = 'ub9vdlhm';
const CLOUD_KV_KEY = 'config';

function encodeBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function decodeBase64(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

async function fetchCloudConfig() {
  try {
    const url = `https://keyvalue.immanuel.co/api/KeyVal/GetValue/${CLOUD_KV_APPKEY}/${CLOUD_KV_KEY}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const rawVal = text.replace(/^"|"$/g, '').trim();
        if (rawVal) {
          const decoded = decodeBase64(rawVal);
          const parsed = JSON.parse(decoded);
          if (parsed && parsed.defaultApiKey && parsed.defaultBaseUrl) {
            console.log('Successfully loaded config from Cloud KV.');
            return parsed;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch config from Cloud KV:', err.message);
  }
  return null;
}

async function saveCloudConfig(config) {
  try {
    const dataStr = JSON.stringify({
      defaultApiKey: config.defaultApiKey,
      defaultBaseUrl: config.defaultBaseUrl
    });
    const safeVal = encodeBase64(dataStr);
    const url = `https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${CLOUD_KV_APPKEY}/${CLOUD_KV_KEY}/${safeVal}`;
    const res = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      console.log('Successfully saved config to Cloud KV.');
    } else {
      console.warn('Cloud KV save returned status:', res.status);
    }
  } catch (err) {
    console.warn('Failed to save config to Cloud KV:', err.message);
  }
}

async function loadServerConfig() {
  if (memoryConfig && memoryConfig._lastFetched && (Date.now() - memoryConfig._lastFetched < 10000)) {
    return memoryConfig;
  }

  const cloudConfig = await fetchCloudConfig();
  if (cloudConfig) {
    memoryConfig = {
      adminUsername: 'admin',
      adminPassword: 'adminpassword123',
      defaultApiKey: cloudConfig.defaultApiKey,
      defaultBaseUrl: cloudConfig.defaultBaseUrl,
      _lastFetched: Date.now()
    };
    return memoryConfig;
  }

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8');
      const localConfig = JSON.parse(data);
      memoryConfig = {
        ...localConfig,
        _lastFetched: Date.now()
      };
      return memoryConfig;
    }
  } catch (err) {
    console.error('Error reading server_config.json:', err);
  }

  memoryConfig = {
    adminUsername: 'admin',
    adminPassword: 'adminpassword123',
    defaultApiKey: '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',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    _lastFetched: Date.now()
  };

  await saveServerConfig(memoryConfig);
  return memoryConfig;
}

async function saveServerConfig(config) {
  memoryConfig = {
    ...config,
    _lastFetched: Date.now()
  };
  
  await saveCloudConfig(config);

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({
      adminUsername: config.adminUsername,
      adminPassword: config.adminPassword,
      defaultApiKey: config.defaultApiKey,
      defaultBaseUrl: config.defaultBaseUrl
    }, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write server_config.json to disk (expected in serverless environments):', err.message);
  }
}

// Initialize config on startup
loadServerConfig().catch(err => console.error('Failed to initialize server config on startup:', err));

app.use(express.json());

// Helper to determine active credentials (prefers client overrides, falls back to defaults)
async function getCredentials(req) {
  const currentConfig = await loadServerConfig();
  let apiKey = req.headers['x-api-key'] || currentConfig.defaultApiKey;
  let baseUrl = req.headers['x-base-url'] || currentConfig.defaultBaseUrl;
  
  // Clean base URL to remove trailing slashes
  if (baseUrl && baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return { apiKey, baseUrl };
}

// 1. Chat Completion Endpoint (handles streaming SSE or regular response)
app.post('/api/chat', async (req, res) => {
  const { messages, model, temperature, max_tokens, stream, systemPrompt } = req.body;
  const { apiKey, baseUrl } = await getCredentials(req);

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Prepend system prompt if provided
  const fullMessages = [...messages];
  if (systemPrompt) {
    // If there is already a system message, we can modify it or prepend a new one
    const existingSystemIndex = fullMessages.findIndex(m => m.role === 'system');
    if (existingSystemIndex > -1) {
      fullMessages[existingSystemIndex] = { role: 'system', content: systemPrompt };
    } else {
      fullMessages.unshift({ role: 'system', content: systemPrompt });
    }
  }

  try {
    const targetUrl = `${baseUrl}/chat/completions`;
    console.log(`Forwarding chat completions request to: ${targetUrl}`);

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'smart-chat',
        messages: fullMessages,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 2048,
        stream: stream ?? false
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error(`RXZ.Ai API error: ${apiResponse.status} - ${errText}`);
      return res.status(apiResponse.status).json({ error: errText || 'Error from RXZ.Ai API' });
    }

    if (stream) {
      // Set headers for Server-Sent Events (SSE)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      if (apiResponse.body) {
        const reader = apiResponse.body;
        // Pipe chunks as they arrive
        for await (const chunk of reader) {
          res.write(chunk);
        }
      }
      res.end();
    } else {
      const data = await apiResponse.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Proxy Error /api/chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. Text-to-Speech (TTS) Endpoint
app.post('/api/tts', async (req, res) => {
  const { input, model, voice } = req.body;
  const { apiKey, baseUrl } = await getCredentials(req);

  if (!input) {
    return res.status(400).json({ error: 'Input text is required for TTS.' });
  }

  try {
    const targetUrl = `${baseUrl}/audio/speech`;
    console.log(`Forwarding TTS request to: ${targetUrl}`);

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'tts-1-hd',
        voice: voice || 'alloy',
        input: input
      })
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error(`RXZ.Ai TTS error: ${apiResponse.status} - ${errText}`);
      return res.status(apiResponse.status).json({ error: errText || 'Error from RXZ.Ai TTS API' });
    }

    // Forward the binary audio stream back to the client
    res.setHeader('Content-Type', 'audio/mpeg');
    if (apiResponse.body) {
      const reader = apiResponse.body;
      for await (const chunk of reader) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (error) {
    console.error('Proxy Error /api/tts:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 3. Image Generation (DALL-E 3) Endpoint
app.post('/api/image', async (req, res) => {
  const { prompt, model, size } = req.body;
  const { apiKey, baseUrl } = await getCredentials(req);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt text is required for Image Generation.' });
  }

  try {
    const targetUrl = `${baseUrl}/images/generations`;
    console.log(`Forwarding Image Generation request to: ${targetUrl}`);

    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'dall-e-3',
        prompt: prompt,
        size: size || '1024x1024',
        n: 1
      })
    });

    let data;
    try {
      data = await apiResponse.json();
    } catch (parseErr) {
      // If parsing JSON fails, trigger fallback
    }

    if (!apiResponse.ok || !data || !data.data || !data.data[0]) {
      console.warn(`DALL-E failed. Falling back to free image generation...`);
      const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      return res.json({
        data: [{ url: fallbackUrl }]
      });
    }

    res.json(data);
  } catch (error) {
    console.warn(`Image generation error: ${error.message}. Falling back to free image generation...`);
    const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    res.json({
      data: [{ url: fallbackUrl }]
    });
  }
});

// Admin login and config endpoints
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const currentConfig = await loadServerConfig();

  if (username === currentConfig.adminUsername && password === currentConfig.adminPassword) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Invalid admin username or password.' });
});

async function validateAdminToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  const currentConfig = await loadServerConfig();
  const expectedToken = Buffer.from(`${currentConfig.adminUsername}:${currentConfig.adminPassword}`).toString('base64');
  return token === expectedToken;
}

app.get('/api/admin/config', async (req, res) => {
  if (!await validateAdminToken(req)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const currentConfig = await loadServerConfig();
  res.json({
    defaultApiKey: currentConfig.defaultApiKey,
    defaultBaseUrl: currentConfig.defaultBaseUrl
  });
});

app.post('/api/admin/config', async (req, res) => {
  if (!await validateAdminToken(req)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  const { apiKey, baseUrl } = req.body;
  if (!apiKey || !baseUrl) {
    return res.status(400).json({ error: 'API Key and Base URL are required.' });
  }
  const currentConfig = await loadServerConfig();
  currentConfig.defaultApiKey = apiKey;
  currentConfig.defaultBaseUrl = baseUrl;
  await saveServerConfig(currentConfig);
  res.json({ success: true });
});

// Only start HTTP server locally (not in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`RXZ.Ai Server running at http://localhost:${PORT}`);
  });
}

export default app;
