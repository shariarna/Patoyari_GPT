import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Pre-configured default credentials
const DEFAULT_API_KEY = 'sk-fv3HdmmlhgCu6fSq2Z38VrgP3boNJMaqY7HsZ9TNXxN9NUpw';
const DEFAULT_BASE_URL = 'https://aiapiv2.pekpik.com/v1';

app.use(express.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// Helper to determine active credentials
function getCredentials(req) {
  let apiKey = req.headers['x-api-key'] || DEFAULT_API_KEY;
  let baseUrl = req.headers['x-base-url'] || DEFAULT_BASE_URL;

  // Server-side fallback: If client sent a Gemini key, override with PekPik default
  if (apiKey && (apiKey.startsWith('AQ.') || apiKey.startsWith('AIzaSy'))) {
    apiKey = DEFAULT_API_KEY;
    baseUrl = DEFAULT_BASE_URL;
  }

  // Clean base URL to remove trailing slashes
  if (baseUrl && baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  return { apiKey, baseUrl };
}

// 1. Chat Completion Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, model, temperature, max_tokens, stream, systemPrompt } = req.body;
  const { apiKey, baseUrl } = getCredentials(req);

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const fullMessages = [...messages];
  if (systemPrompt) {
    const existingSystemIndex = fullMessages.findIndex(m => m.role === 'system');
    if (existingSystemIndex > -1) {
      fullMessages[existingSystemIndex] = { role: 'system', content: systemPrompt };
    } else {
      fullMessages.unshift({ role: 'system', content: systemPrompt });
    }
  }

  try {
    const targetUrl = `${baseUrl}/chat/completions`;
    console.log(`Forwarding chat to: ${targetUrl}`);

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
      console.error(`API error: ${apiResponse.status} - ${errText}`);
      return res.status(apiResponse.status).json({ error: errText || 'Error from API' });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      if (apiResponse.body) {
        for await (const chunk of apiResponse.body) {
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

// 2. TTS Endpoint
app.post('/api/tts', async (req, res) => {
  const { input, model, voice } = req.body;
  const { apiKey, baseUrl } = getCredentials(req);

  if (!input) {
    return res.status(400).json({ error: 'Input text is required for TTS.' });
  }

  try {
    const targetUrl = `${baseUrl}/audio/speech`;
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
      return res.status(apiResponse.status).json({ error: errText || 'Error from TTS API' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    if (apiResponse.body) {
      for await (const chunk of apiResponse.body) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (error) {
    console.error('Proxy Error /api/tts:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 3. Image Generation Endpoint
app.post('/api/image', async (req, res) => {
  const { prompt, model, size } = req.body;
  const { apiKey, baseUrl } = getCredentials(req);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt text is required for Image Generation.' });
  }

  try {
    const targetUrl = `${baseUrl}/images/generations`;
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
      // fallback if JSON parse fails
    }

    if (!apiResponse.ok || !data || !data.data || !data.data[0]) {
      console.warn('DALL-E failed. Falling back to Pollinations...');
      const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
      return res.json({ data: [{ url: fallbackUrl }] });
    }

    res.json(data);
  } catch (error) {
    console.warn(`Image gen error: ${error.message}. Using fallback...`);
    const fallbackUrl = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
    res.json({ data: [{ url: fallbackUrl }] });
  }
});

// Fallback: serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server locally only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`RXZ.Ai Server running at http://localhost:${PORT}`);
  });
}

export default app;
