// Application State Management
let chats = [];
let activeChatId = null;
let activeAudio = null; // Track current active TTS audio element
let isGenerating = false; // Track active API call

// DOM Elements
const sidebar = document.getElementById('sidebar');
const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
const btnCloseSidebarMobile = document.getElementById('btn-close-sidebar-mobile');
const btnNewChat = document.getElementById('btn-new-chat');
const searchHistory = document.getElementById('search-history');
const chatHistoryList = document.getElementById('chat-history-list');
const btnSidebarImageGen = document.getElementById('btn-sidebar-image-gen');
const btnSidebarSettings = document.getElementById('btn-sidebar-settings');
const btnClearChats = document.getElementById('btn-clear-chats');

const messagesContainer = document.getElementById('messages-container');
const welcomeScreen = document.getElementById('welcome-screen');
const btnScrollBottom = document.getElementById('btn-scroll-bottom');
const chatTextarea = document.getElementById('chat-textarea');
const btnInputSettings = document.getElementById('btn-input-settings');
const btnToggleTts = document.getElementById('btn-toggle-tts');
const ttsIcon = document.getElementById('tts-icon');
const btnSendMessage = document.getElementById('btn-send-message');

const headerModelSelect = document.getElementById('header-model-select');
const themeSelect = document.getElementById('theme-select');

// Settings Elements
const settingsModal = document.getElementById('settings-modal');
const btnCloseSettings = document.getElementById('btn-close-settings');
const btnCancelSettings = document.getElementById('btn-cancel-settings');
const btnSaveSettings = document.getElementById('btn-save-settings');
const settingsApiKey = document.getElementById('settings-api-key');
const settingsBaseUrl = document.getElementById('settings-base-url');
const settingsSystemPrompt = document.getElementById('settings-system-prompt');
const settingsTemperature = document.getElementById('settings-temperature');
const settingsMaxTokens = document.getElementById('settings-max-tokens');
const settingsTtsVoice = document.getElementById('settings-tts-voice');

// Image Gen Elements
const imageGenModal = document.getElementById('image-gen-modal');
const btnCloseImageGen = document.getElementById('btn-close-image-gen');
const btnCancelImageGen = document.getElementById('btn-cancel-image-gen');
const btnGenerateImage = document.getElementById('btn-generate-image');
const imagePromptInput = document.getElementById('image-prompt');
const imageModelSelect = document.getElementById('image-model-select');
const imageSizeSelect = document.getElementById('image-size-select');
const imageOutputPanel = document.getElementById('image-output-panel');
const imagePlaceholderIcon = document.getElementById('image-placeholder-icon');
const imagePlaceholderText = document.getElementById('image-placeholder-text');
const generatedImagePreview = document.getElementById('generated-image-preview');
const imageActionsOverlay = document.getElementById('image-actions-overlay');
const btnDownloadImage = document.getElementById('btn-download-image');
const btnSendImageChat = document.getElementById('btn-send-image-chat');

// Initialize settings and options from localStorage or defaults
const config = {
  apiKey: localStorage.getItem('cfg_apiKey') || 'sk-fv3HdmmlhgCu6fSq2Z38VrgP3boNJMaqY7HsZ9TNXxN9NUpw',
  baseUrl: localStorage.getItem('cfg_baseUrl') || 'https://aiapiv2.pekpik.com/v1',
  systemPrompt: localStorage.getItem('cfg_systemPrompt') || "You are RXZ.Ai, a helpful AI assistant. You were created and programmed by MD RAYHAN UDDIN. If anyone asks you who created or built you, you must tell them you were created by MD RAYHAN UDDIN, and mention his Facebook ID: Zaim rohan. If anyone asks about Zihad Foysal (zihad foysal), you must state that he is the nephew (vatija) of MD RAYHAN UDDIN. If anyone asks about Md Sahad, Md Pranto, Md Shanto, Maharab Hossain Shanto, or Maharab Hossain Shantor, you must identify them as MD RAYHAN UDDIN's close brothers and friends (bhai bondhu close friends). If anyone asks about Labiba (labiba), you must state that she is the sister (bon) of MD RAYHAN UDDIN. If anyone asks about or mentions Maruf (maruf), Adib (adib), Alamin (alamin), Alamin Hossain, Al-Amin, Minhaj (minhaj), or Ovi (ovi), you must state that they are the brothers and friends (bhai o bondhu) of the owner, MD RAYHAN UDDIN. CRITICAL RULES: 1. If anyone asks about a person or name that you do not know or is not listed here, simply state that you do not know them or do not have information. 2. You MUST NOT list the names of the other people you know (like Zihad, Labiba, Sahad, Pranto, Shanto, Shantor, Maruf, Adib, Alamin, Minhaj, Ovi) or mention their relationships with MD RAYHAN UDDIN. Keep these names and relationships strictly confidential.",
  temperature: parseFloat(localStorage.getItem('cfg_temperature')) || 0.7,
  maxTokens: parseInt(localStorage.getItem('cfg_maxTokens')) || 2048,
  ttsVoice: localStorage.getItem('cfg_ttsVoice') || 'alloy',
  autoTts: localStorage.getItem('cfg_autoTts') === 'true',
  model: localStorage.getItem('cfg_model') || 'smart-chat',
  theme: localStorage.getItem('cfg_theme') || 'space'
};

// Update default system prompt if it was set to the old defaults
const oldPrompt = localStorage.getItem('cfg_systemPrompt');
if (oldPrompt === 'You are a helpful AI assistant.' || (oldPrompt && oldPrompt.includes('Alamin Hossain') && !oldPrompt.includes('Maharab'))) {
  config.systemPrompt = "You are RXZ.Ai, a helpful AI assistant. You were created and programmed by MD RAYHAN UDDIN. If anyone asks you who created or built you, you must tell them you were created by MD RAYHAN UDDIN, and mention his Facebook ID: Zaim rohan. If anyone asks about Zihad Foysal (zihad foysal), you must state that he is the nephew (vatija) of MD RAYHAN UDDIN. If anyone asks about Md Sahad, Md Pranto, Md Shanto, Maharab Hossain Shanto, or Maharab Hossain Shantor, you must identify them as MD RAYHAN UDDIN's close brothers and friends (bhai bondhu close friends). If anyone asks about Labiba (labiba), you must state that she is the sister (bon) of MD RAYHAN UDDIN. If anyone asks about or mentions Maruf (maruf), Adib (adib), Alamin (alamin), Alamin Hossain, Al-Amin, Minhaj (minhaj), or Ovi (ovi), you must state that they are the brothers and friends (bhai o bondhu) of the owner, MD RAYHAN UDDIN. CRITICAL RULES: 1. If anyone asks about a person or name that you do not know or is not listed here, simply state that you do not know them or do not have information. 2. You MUST NOT list the names of the other people you know (like Zihad, Labiba, Sahad, Pranto, Shanto, Shantor, Maruf, Adib, Alamin, Minhaj, Ovi) or mention their relationships with MD RAYHAN UDDIN. Keep these names and relationships strictly confidential.";
  localStorage.setItem('cfg_systemPrompt', config.systemPrompt);
}

// Automatically heal config if API key and Base URL were swapped or input incorrectly
if (config.baseUrl.startsWith('sk-')) {
  config.apiKey = config.baseUrl;
  config.baseUrl = 'https://aiapiv2.pekpik.com/v1';
  localStorage.setItem('cfg_apiKey', config.apiKey);
  localStorage.setItem('cfg_baseUrl', config.baseUrl);
}

// Automatically restore default credentials if a Gemini key (starts with AQ. or AIzaSy) is set
if (config.apiKey && (config.apiKey.startsWith('AQ.') || config.apiKey.startsWith('AIzaSy'))) {
  config.apiKey = 'sk-fv3HdmmlhgCu6fSq2Z38VrgP3boNJMaqY7HsZ9TNXxN9NUpw';
  config.baseUrl = 'https://aiapiv2.pekpik.com/v1';
  localStorage.setItem('cfg_apiKey', config.apiKey);
  localStorage.setItem('cfg_baseUrl', config.baseUrl);
}

// Automatically migrate users from the non-functional gpt-5.5 model to smart-chat
if (config.model === 'gpt-5.5') {
  config.model = 'smart-chat';
  localStorage.setItem('cfg_model', 'smart-chat');
}

// Initialize Application
function init() {
  // Setup Marked options (allow safe HTML and breaks)
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  // Load chat history from localStorage
  loadChats();

  // Load settings into inputs
  settingsApiKey.value = config.apiKey;
  settingsBaseUrl.value = config.baseUrl;
  settingsSystemPrompt.value = config.systemPrompt;
  settingsTemperature.value = config.temperature;
  settingsMaxTokens.value = config.maxTokens;
  settingsTtsVoice.value = config.ttsVoice;

  // Set initial model dropdown in header
  headerModelSelect.value = config.model;

  // Apply visual theme
  themeSelect.value = config.theme;
  applyTheme(config.theme);

  // Sync TTS button state
  updateTtsButtonState();

  // Render initial history list
  renderHistoryList();

  // Open the last active chat or display welcome screen
  if (activeChatId && getActiveChat()) {
    renderChatMessages();
  } else {
    showWelcomeScreen();
  }

  registerEventListeners();
}

// Event Listeners Registration
function registerEventListeners() {
  // Sidebar toggles
  btnToggleSidebar.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  btnCloseSidebarMobile.addEventListener('click', () => sidebar.classList.remove('active'));
  btnToggleSidebar.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.add('active');
    }
  });

  // Settings triggers
  btnSidebarSettings.addEventListener('click', () => openModal(settingsModal));
  btnInputSettings.addEventListener('click', () => openModal(settingsModal));
  btnCloseSettings.addEventListener('click', () => closeModal(settingsModal));
  btnCancelSettings.addEventListener('click', () => closeModal(settingsModal));
  btnSaveSettings.addEventListener('click', saveSettings);

  // Image Gen triggers
  btnSidebarImageGen.addEventListener('click', () => openModal(imageGenModal));
  btnCloseImageGen.addEventListener('click', () => closeModal(imageGenModal));
  btnCancelImageGen.addEventListener('click', () => closeModal(imageGenModal));
  btnGenerateImage.addEventListener('click', generateDalleImage);
  btnDownloadImage.addEventListener('click', downloadGeneratedImage);
  btnSendImageChat.addEventListener('click', sendImageToChat);

  // Chat actions
  btnNewChat.addEventListener('click', createNewChat);
  btnClearChats.addEventListener('click', clearAllChats);
  btnSendMessage.addEventListener('click', handleUserSendMessage);
  
  // Model & Theme Selects
  headerModelSelect.addEventListener('change', (e) => {
    config.model = e.target.value;
    localStorage.setItem('cfg_model', config.model);
    const activeChat = getActiveChat();
    if (activeChat) {
      activeChat.model = config.model;
      saveChats();
    }
  });

  themeSelect.addEventListener('change', (e) => {
    config.theme = e.target.value;
    localStorage.setItem('cfg_theme', config.theme);
    applyTheme(config.theme);
  });

  // Textarea listeners
  chatTextarea.addEventListener('input', autoResizeTextarea);
  chatTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSendMessage();
    }
  });

  // Scroll bottom listener
  messagesContainer.addEventListener('scroll', checkScrollPosition);
  btnScrollBottom.addEventListener('click', scrollToBottom);

  // TTS Toggle listener
  btnToggleTts.addEventListener('click', () => {
    config.autoTts = !config.autoTts;
    localStorage.setItem('cfg_autoTts', config.autoTts);
    updateTtsButtonState();
  });

  // Search Chat history
  searchHistory.addEventListener('input', (e) => {
    renderHistoryList(e.target.value);
  });

  // Quick prompt cards
  document.querySelectorAll('.quick-prompt-card').forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      chatTextarea.value = prompt;
      autoResizeTextarea();
      handleUserSendMessage();
    });
  });
}

// ----------------- STATE & STORAGE HELPERS -----------------

function loadChats() {
  let savedChats = localStorage.getItem('patoyari_chats');
  let savedActiveChatId = localStorage.getItem('patoyari_activeChatId');
  
  // Migrate from old name if it exists
  if (!savedChats && localStorage.getItem('pekpik_chats')) {
    savedChats = localStorage.getItem('pekpik_chats');
    savedActiveChatId = localStorage.getItem('pekpik_activeChatId');
    localStorage.setItem('patoyari_chats', savedChats);
    localStorage.setItem('patoyari_activeChatId', savedActiveChatId);
  }
  
  chats = savedChats ? JSON.parse(savedChats) : [];
  activeChatId = savedActiveChatId || null;
}

function saveChats() {
  localStorage.setItem('patoyari_chats', JSON.stringify(chats));
  localStorage.setItem('patoyari_activeChatId', activeChatId);
}

function getActiveChat() {
  return chats.find(c => c.id === activeChatId);
}

function applyTheme(theme) {
  document.body.className = '';
  if (theme !== 'space') {
    document.body.classList.add(`theme-${theme}`);
  }
}

function updateTtsButtonState() {
  if (config.autoTts) {
    ttsIcon.className = 'fas fa-volume-up';
    btnToggleTts.classList.add('active');
    btnToggleTts.title = "Auto-TTS Speech Playback Enabled";
  } else {
    ttsIcon.className = 'fas fa-volume-mute';
    btnToggleTts.classList.remove('active');
    btnToggleTts.title = "Auto-TTS Speech Playback Disabled";
  }
}

// ----------------- UI CONTROLS -----------------

function openModal(modal) {
  modal.classList.add('active');
}

function closeModal(modal) {
  modal.classList.remove('active');
}

function autoResizeTextarea() {
  chatTextarea.style.height = '40px';
  const newHeight = chatTextarea.scrollHeight;
  chatTextarea.style.height = Math.min(newHeight, 200) + 'px';
  
  // Enable/disable send button
  if (chatTextarea.value.trim().length > 0) {
    btnSendMessage.classList.add('active');
  } else {
    btnSendMessage.classList.remove('active');
  }
}

function checkScrollPosition() {
  const threshold = 150;
  const isNearBottom = (messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight) < threshold;
  
  if (isNearBottom) {
    btnScrollBottom.classList.remove('visible');
  } else {
    btnScrollBottom.classList.add('visible');
  }
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ----------------- SETTINGS MANAGEMENT -----------------

function saveSettings() {
  config.apiKey = settingsApiKey.value.trim();
  config.baseUrl = settingsBaseUrl.value.trim();
  config.systemPrompt = settingsSystemPrompt.value.trim();
  config.temperature = parseFloat(settingsTemperature.value) || 0.7;
  config.maxTokens = parseInt(settingsMaxTokens.value) || 2048;
  config.ttsVoice = settingsTtsVoice.value;

  localStorage.setItem('cfg_apiKey', config.apiKey);
  localStorage.setItem('cfg_baseUrl', config.baseUrl);
  localStorage.setItem('cfg_systemPrompt', config.systemPrompt);
  localStorage.setItem('cfg_temperature', config.temperature);
  localStorage.setItem('cfg_maxTokens', config.maxTokens);
  localStorage.setItem('cfg_ttsVoice', config.ttsVoice);

  closeModal(settingsModal);
  alert('Configurations saved successfully!');
}

// ----------------- CHAT HISTORY -----------------

function createNewChat() {
  const newId = 'chat_' + Date.now();
  const newChat = {
    id: newId,
    title: 'New Chat Thread',
    model: config.model,
    systemPrompt: config.systemPrompt,
    messages: []
  };

  chats.unshift(newChat);
  activeChatId = newId;
  saveChats();
  
  renderHistoryList();
  renderChatMessages();
  
  chatTextarea.focus();
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('active');
  }
}

function deleteChat(id, event) {
  event.stopPropagation();
  
  chats = chats.filter(c => c.id !== id);
  if (activeChatId === id) {
    activeChatId = chats.length > 0 ? chats[0].id : null;
  }
  
  saveChats();
  renderHistoryList();
  
  if (activeChatId && getActiveChat()) {
    renderChatMessages();
  } else {
    showWelcomeScreen();
  }
}

function selectChat(id) {
  activeChatId = id;
  saveChats();
  renderHistoryList();
  renderChatMessages();
  
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('active');
  }
}

function clearAllChats() {
  if (confirm('Are you sure you want to permanently delete all chats from history?')) {
    chats = [];
    activeChatId = null;
    saveChats();
    renderHistoryList();
    showWelcomeScreen();
  }
}

function renderHistoryList(filterText = '') {
  chatHistoryList.innerHTML = '';
  
  const query = filterText.toLowerCase().trim();
  const filteredChats = chats.filter(c => {
    if (!query) return true;
    const titleMatch = c.title.toLowerCase().includes(query);
    const messagesMatch = c.messages.some(m => m.content.toLowerCase().includes(query));
    return titleMatch || messagesMatch;
  });

  if (filteredChats.length === 0) {
    chatHistoryList.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 20px; font-size: 13px;">No chats found</div>`;
    return;
  }

  filteredChats.forEach(chat => {
    const isActive = chat.id === activeChatId;
    const item = document.createElement('div');
    item.className = `history-item ${isActive ? 'active' : ''}`;
    item.addEventListener('click', () => selectChat(chat.id));

    item.innerHTML = `
      <i class="far fa-comment-alt chat-icon"></i>
      <span class="history-item-title">${escapeHTML(chat.title)}</span>
      <div class="history-item-actions">
        <button class="btn-history-action delete" title="Delete Chat"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;

    item.querySelector('.delete').addEventListener('click', (e) => deleteChat(chat.id, e));
    chatHistoryList.appendChild(item);
  });
}

// ----------------- RENDER MESSAGES -----------------

function showWelcomeScreen() {
  welcomeScreen.style.display = 'flex';
  // Remove existing messages
  const existingRows = messagesContainer.querySelectorAll('.message-row');
  existingRows.forEach(r => r.remove());
}

function renderChatMessages() {
  const activeChat = getActiveChat();
  if (!activeChat) return;
  
  // Clear previous message rows
  const existingRows = messagesContainer.querySelectorAll('.message-row');
  existingRows.forEach(r => r.remove());

  if (activeChat.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
  } else {
    welcomeScreen.style.display = 'none';
    activeChat.messages.forEach(msg => {
      appendMessageRowToContainer(msg.role, msg.content, false);
    });
  }

  // Make sure model switcher displays correct active chat model
  headerModelSelect.value = activeChat.model || config.model;

  scrollToBottom();
}

function appendMessageRowToContainer(role, content, isStreaming = false) {
  const row = document.createElement('div');
  row.className = `message-row ${role === 'user' ? 'user' : 'bot'}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = role === 'user' ? '<i class="far fa-user"></i>' : '<i class="fas fa-robot"></i>';

  const wrapper = document.createElement('div');
  wrapper.className = 'message-content-wrapper';

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${isStreaming ? 'typing-bubble' : ''}`;
  
  if (isStreaming) {
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
  } else {
    bubble.innerHTML = formatMessageContent(content);
  }

  wrapper.appendChild(bubble);

  // Add action buttons on bot responses
  if (role === 'bot' && !isStreaming) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    
    actions.innerHTML = `
      <button class="message-action-btn btn-speak" title="Speak Text"><i class="fas fa-volume-up"></i> Listen</button>
      <button class="message-action-btn btn-copy-msg" title="Copy Message"><i class="far fa-copy"></i> Copy</button>
    `;

    // Copy event listener
    actions.querySelector('.btn-copy-msg').addEventListener('click', (e) => {
      navigator.clipboard.writeText(content);
      const btn = e.currentTarget;
      btn.innerHTML = `<i class="fas fa-check"></i> Copied`;
      setTimeout(() => {
        btn.innerHTML = `<i class="far fa-copy"></i> Copy`;
      }, 2000);
    });

    // Speak / TTS event listener
    actions.querySelector('.btn-speak').addEventListener('click', (e) => {
      playTtsAudio(content, bubble, e.currentTarget);
    });

    wrapper.appendChild(actions);
  }

  row.appendChild(avatar);
  row.appendChild(wrapper);
  messagesContainer.appendChild(row);

  if (!isStreaming) {
    // Apply syntax highlighting to code blocks in the newly added bubble
    Prism.highlightAllUnder(bubble);
    // Wire up "Copy Code" buttons inside the formatted bubble
    wireUpCopyButtons(bubble);
  }

  return bubble;
}

// ----------------- MARKDOWN FORMATTING & PRISM WRAPPERS -----------------

function formatMessageContent(markdownText) {
  // If markdown text contains image markdown that refers to generated images, marked will handle it.
  const rawHtml = marked.parse(markdownText);
  
  // Wrap code blocks inside a customized container containing headers and copy buttons
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = rawHtml;

  const preBlocks = tempDiv.querySelectorAll('pre');
  preBlocks.forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;

    // Detect language from class (e.g. language-javascript)
    let lang = 'code';
    const classes = code.className.split(' ');
    const langClass = classes.find(c => c.startsWith('language-'));
    if (langClass) {
      lang = langClass.replace('language-', '');
    }

    const container = document.createElement('div');
    container.className = 'code-block-container';

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <span class="code-block-lang">${lang}</span>
      <span class="btn-copy-code"><i class="far fa-copy"></i> Copy code</span>
    `;

    // Clone pre and insert
    const clonedPre = pre.cloneNode(true);
    
    container.appendChild(header);
    container.appendChild(clonedPre);

    // Replace original pre with custom container
    pre.parentNode.replaceChild(container, pre);
  });

  return tempDiv.innerHTML;
}

function wireUpCopyButtons(container) {
  const copyButtons = container.querySelectorAll('.btn-copy-code');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeBlock = btn.closest('.code-block-container').querySelector('code');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
          btn.innerHTML = `<i class="fas fa-check"></i> Copied!`;
          setTimeout(() => {
            btn.innerHTML = `<i class="far fa-copy"></i> Copy code`;
          }, 2000);
        });
      }
    });
  });
}

// ----------------- TTS PLAYBACK -----------------

async function playTtsAudio(text, bubbleElement, actionBtn) {
  // If audio is currently playing, stop it
  if (activeAudio) {
    activeAudio.pause();
    document.querySelectorAll('.audio-tts-player-bubble').forEach(p => p.remove());
    document.querySelectorAll('.btn-speak').forEach(b => b.classList.remove('active'));
    
    // If user clicked the speak button of the already playing audio, just stop it and return
    if (activeAudio.textSource === text) {
      activeAudio = null;
      return;
    }
  }

  // Create a visual player element inside the message bubble
  const playerBubble = document.createElement('div');
  playerBubble.className = 'audio-tts-player-bubble playing';
  playerBubble.innerHTML = `
    <button class="btn-audio-control"><i class="fas fa-pause"></i></button>
    <div class="audio-wave">
      <div class="audio-bar"></div>
      <div class="audio-bar"></div>
      <div class="audio-bar"></div>
      <div class="audio-bar"></div>
      <div class="audio-bar"></div>
      <div class="audio-bar"></div>
    </div>
    <span>Reading aloud...</span>
  `;

  // Remove any previously orphaned players and append to current bubble
  const oldPlayers = bubbleElement.querySelectorAll('.audio-tts-player-bubble');
  oldPlayers.forEach(p => p.remove());
  bubbleElement.appendChild(playerBubble);
  actionBtn.classList.add('active');

  try {
    const headers = {};
    if (config.apiKey) headers['x-api-key'] = config.apiKey;
    if (config.baseUrl) headers['x-base-url'] = config.baseUrl;

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        input: text.replace(/`{3}[\s\S]*?`{3}/g, ''), // Strip code blocks from speech
        model: 'tts-1-hd',
        voice: config.ttsVoice
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    const audio = new Audio(audioUrl);
    audio.textSource = text; // Cache text identifier
    activeAudio = audio;

    // Control button play/pause
    const controlBtn = playerBubble.querySelector('.btn-audio-control');
    controlBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playerBubble.classList.add('playing');
        controlBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        audio.pause();
        playerBubble.classList.remove('playing');
        controlBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    });

    audio.addEventListener('ended', () => {
      playerBubble.remove();
      actionBtn.classList.remove('active');
      activeAudio = null;
    });

    audio.play();
  } catch (error) {
    console.error('TTS Playback failed:', error);
    playerBubble.innerHTML = `<span style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Speech failed</span>`;
    setTimeout(() => playerBubble.remove(), 4000);
    actionBtn.classList.remove('active');
    activeAudio = null;
  }
}

// ----------------- SEND MESSAGE & STREAM COMPLETE -----------------

async function handleUserSendMessage() {
  if (isGenerating) return;

  const text = chatTextarea.value.trim();
  if (!text) return;

  // Clear input area
  chatTextarea.value = '';
  autoResizeTextarea();

  // Create chat if none active
  if (!activeChatId || !getActiveChat()) {
    const newId = 'chat_' + Date.now();
    const newChat = {
      id: newId,
      title: text.length > 26 ? text.slice(0, 25) + '...' : text,
      model: config.model,
      systemPrompt: config.systemPrompt,
      messages: []
    };
    chats.unshift(newChat);
    activeChatId = newId;
    saveChats();
    renderHistoryList();
    welcomeScreen.style.display = 'none';
  }

  const activeChat = getActiveChat();
  
  // Update chat title if it's the first message
  if (activeChat.messages.length === 0) {
    activeChat.title = text.length > 26 ? text.slice(0, 25) + '...' : text;
    renderHistoryList();
  }

  // Push User Message
  activeChat.messages.push({ role: 'user', content: text });
  saveChats();

  // Render user message row in UI
  appendMessageRowToContainer('user', text);
  scrollToBottom();

  // Add bot typing loading block
  isGenerating = true;
  const botBubble = appendMessageRowToContainer('bot', '', true);
  scrollToBottom();

  try {
    const headers = {};
    if (config.apiKey) headers['x-api-key'] = config.apiKey;
    if (config.baseUrl) headers['x-base-url'] = config.baseUrl;

    // Build standard messages array for API (excluding metadata features)
    const apiMessages = activeChat.messages.map(m => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        messages: apiMessages,
        model: activeChat.model || config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
        systemPrompt: activeChat.systemPrompt
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(errBody || 'Failed API Fetch');
    }

    // Clear typing dots animation loader
    botBubble.className = 'message-bubble';
    botBubble.innerHTML = '';

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let botResponseText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep half-read line in buffer

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        if (cleanLine === 'data: [DONE]') continue;

        if (cleanLine.startsWith('data: ')) {
          try {
            const dataStr = cleanLine.slice(6);
            const parsed = JSON.parse(dataStr);
            const contentChunk = parsed.choices?.[0]?.delta?.content || '';
            if (contentChunk) {
              botResponseText += contentChunk;
              // Stream text into bubble
              botBubble.innerHTML = formatMessageContent(botResponseText);
              wireUpCopyButtons(botBubble);
              scrollToBottom();
            }
          } catch (err) {
            console.error('SSE parser error on line:', cleanLine, err);
          }
        }
      }
    }

    // Wrap-up message creation
    activeChat.messages.push({ role: 'bot', content: botResponseText });
    saveChats();

    // Re-render message formatting properly and apply highlights
    botBubble.innerHTML = formatMessageContent(botResponseText);
    Prism.highlightAllUnder(botBubble);
    wireUpCopyButtons(botBubble);

    // Create action buttons menu
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
      <button class="message-action-btn btn-speak" title="Speak Text"><i class="fas fa-volume-up"></i> Listen</button>
      <button class="message-action-btn btn-copy-msg" title="Copy Message"><i class="far fa-copy"></i> Copy</button>
    `;

    actions.querySelector('.btn-copy-msg').addEventListener('click', (e) => {
      navigator.clipboard.writeText(botResponseText);
      const btn = e.currentTarget;
      btn.innerHTML = `<i class="fas fa-check"></i> Copied`;
      setTimeout(() => btn.innerHTML = `<i class="far fa-copy"></i> Copy`, 2000);
    });

    actions.querySelector('.btn-speak').addEventListener('click', (e) => {
      playTtsAudio(botResponseText, botBubble, e.currentTarget);
    });

    botBubble.parentNode.appendChild(actions);

    // Trigger auto-TTS if user enabled it
    if (config.autoTts) {
      const speakBtn = actions.querySelector('.btn-speak');
      playTtsAudio(botResponseText, botBubble, speakBtn);
    }

  } catch (error) {
    console.error('Chat error:', error);
    botBubble.className = 'message-bubble';
    botBubble.innerHTML = `<span style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Error: ${escapeHTML(error.message)}</span>`;
  } finally {
    isGenerating = false;
  }
}

// ----------------- IMAGE GENERATOR (DALL-E 3) -----------------

let generatedImageUrl = '';

async function generateDalleImage() {
  const prompt = imagePromptInput.value.trim();
  if (!prompt) {
    alert('Please enter a description for the image.');
    return;
  }

  // Toggle loading UI
  btnGenerateImage.disabled = true;
  btnGenerateImage.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Generating...`;
  
  imageOutputPanel.classList.add('loading');
  imagePlaceholderIcon.className = 'fas fa-cog fa-spin';
  imagePlaceholderText.innerText = 'Creating masterpieces... This may take up to 20 seconds.';
  generatedImagePreview.style.display = 'none';
  imageActionsOverlay.style.display = 'none';

  try {
    const headers = {};
    if (config.apiKey) headers['x-api-key'] = config.apiKey;
    if (config.baseUrl) headers['x-base-url'] = config.baseUrl;

    const response = await fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        prompt: prompt,
        model: imageModelSelect.value,
        size: imageSizeSelect.value
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || result.error || 'Failed image generation');
    }

    generatedImageUrl = result.data[0].url;

    // Show image output
    generatedImagePreview.src = generatedImageUrl;
    generatedImagePreview.style.display = 'block';
    imageActionsOverlay.style.display = 'flex';
    imageOutputPanel.classList.remove('loading');
    
  } catch (error) {
    console.error('Image gen error:', error);
    alert('Failed to generate image: ' + error.message);
    imageOutputPanel.classList.remove('loading');
    imagePlaceholderIcon.className = 'fas fa-exclamation-circle';
    imagePlaceholderText.innerText = 'Failed to generate image. Please try again.';
  } finally {
    btnGenerateImage.disabled = false;
    btnGenerateImage.innerHTML = `<i class="fas fa-magic"></i> Generate Art`;
  }
}

async function downloadGeneratedImage() {
  if (!generatedImageUrl) return;

  const btn = document.getElementById('btn-download-image');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
  btn.disabled = true;

  try {
    const response = await fetch(generatedImageUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    const promptSnippet = imagePromptInput.value.trim().slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_') || 'image';
    link.download = `rxz_ai_${promptSnippet}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Failed to download image directly:', error);
    // Fallback: Open in new tab if blob fetch fails
    window.open(generatedImageUrl, '_blank');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function sendImageToChat() {
  if (!generatedImageUrl) return;

  // Create chat if none active
  if (!activeChatId || !getActiveChat()) {
    createNewChat();
  }

  const activeChat = getActiveChat();
  const prompt = imagePromptInput.value.trim() || 'Generated Image';
  
  // Inject into conversation history
  const imageMarkdown = `![${prompt}](${generatedImageUrl})`;
  activeChat.messages.push({ role: 'user', content: `Generate an image: ${prompt}` });
  activeChat.messages.push({ role: 'bot', content: `Here is the image I generated:\n\n${imageMarkdown}` });
  saveChats();

  // Re-render active window
  renderChatMessages();
  closeModal(imageGenModal);
  
  // Reset image gen input
  imagePromptInput.value = '';
  generatedImagePreview.style.display = 'none';
  imageActionsOverlay.style.display = 'none';
  imagePlaceholderIcon.className = 'fas fa-cloud-upload-alt';
  imagePlaceholderText.innerText = 'Your generated image will appear here';
}

// ----------------- HELPERS -----------------

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Kick off app
window.onload = init;
