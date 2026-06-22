# PekPik Chat AI Website

A premium, feature-rich ChatGPT-like web interface built using vanilla HTML5, custom CSS (glassmorphism), and modern modular JavaScript. The backend is a lightweight Node.js Express server that acts as a secure proxy to connect to the PekPik OpenAI-compatible API, preventing browser CORS blocks and credentials exposure.

## Key Features

1. **AI Chat with Real-time Streaming**: Responses are streamed token-by-token directly on the screen using Server-Sent Events (SSE).
2. **Beautiful Markdown & Syntax Highlighting**: Fully formatted Markdown text (headers, tables, lists) and syntax-highlighted code blocks (using Prism.js) with single-click "Copy Code" actions.
3. **DALL-E 3 Image Generation**: A dedicated modal interface to prompt DALL-E 3, download creations, or send them directly into your active chat thread.
4. **Text-To-Speech (TTS) Reader**: Uses the high-fidelity `tts-1-hd` voice API to read AI responses aloud. Controls include dynamic waveform visualizers and auto-read toggles.
5. **Theme Picker**: 4 premium, custom-designed dark/neon themes:
   - 🌌 **Deep Space Dark** (Default)
   - ⚡ **Cyberpunk Neon** (Gold / Red accents)
   - 🌲 **Aurora Forest** (Teal / Emerald accents)
   - 🌸 **Sakura Blossom** (Pink / Violet accents)
6. **Chat History & Search**: Automatically saves your conversations to `localStorage`, with support for full title management, keyword search, thread switching, and deletion.
7. **Credentials & Param Customization**: Modal menu to adjust API Key, Base URL, Temperature, Max Tokens, System Prompt (AI Persona), and TTS Voice profiles.

## Project Structure

```text
pekpik-chat/
├── package.json         # Project metadata and dependencies
├── server.js            # Node.js Express proxy server
└── public/              # Frontend web assets
    ├── index.html       # HTML layout & CDN links
    ├── style.css        # Theme variables, glassmorphic rules, and responsive CSS
    └── app.js           # Client-side orchestration, API calls, SSE streaming, and local storage
```

## Running the Application Locally

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher recommended).

### Setup and Start

1. Open your terminal in the `C:\rayhan\pekpik-chat` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

*Note: The website is pre-configured with the default API key and base URL you provided. It is ready to start chatting instantly!*
