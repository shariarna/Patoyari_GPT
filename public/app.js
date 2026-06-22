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
const btnInputImageGen = document.getElementById('btn-input-image-gen');
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
const settingsAppTheme = document.getElementById('settings-app-theme');

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

// Image-to-Image / Image Editing State & Elements
let uploadedImageBase64 = '';
let activeImageTab = 'text-to-image';

const modalTabBtns = document.querySelectorAll('.modal-tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');
const imageUploadZone = document.getElementById('image-upload-zone');
const uploadImageFile = document.getElementById('upload-image-file');
const uploadPreviewContainer = document.getElementById('upload-preview-container');
const uploadPreviewImg = document.getElementById('upload-preview-img');
const btnRemoveUpload = document.getElementById('btn-remove-upload');
const imageEditPromptInput = document.getElementById('image-edit-prompt');
const imageEditModelSelect = document.getElementById('image-edit-model-select');
const imageEditSizeSelect = document.getElementById('image-edit-size-select');


// Initialize settings and options from localStorage or defaults
const config = {
  apiKey: localStorage.getItem('cfg_apiKey') || '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',
  baseUrl: localStorage.getItem('cfg_baseUrl') || 'https://api.groq.com/openai/v1',
  systemPrompt: localStorage.getItem('cfg_systemPrompt') || "You are RXZ.Ai, a helpful AI assistant. You were created and programmed by MD RAYHAN UDDIN. If anyone asks you who created, made, or built you, you must state in Bengali that MD RAYHAN UDDIN has made/built you ('MD RAYHAN UDDIN amake baniyechan' or 'amake toiri korechen'), and mention his Facebook ID: Zaim rohan. You must NEVER refer to him as your 'Sristikorta' (Creator) or 'Srosta' to respect religious context; instead, always use words like 'baniyechan', 'toiri korechen', 'developer', or 'programmer'. You must ONLY share this information about MD RAYHAN UDDIN if the user explicitly asks about who created, made, or built you; never mention him or his details unsolicited in normal greetings or unrelated conversations. You should naturally use relevant and expressive emojis (like 😊, 🚀, 💻, etc.) in your responses to make them feel engaging, professional, and friendly. If anyone asks about Nishat (nishat) or Tamanna (tamanna), you must state that they are the elder sisters (boro bon) of MD RAYHAN UDDIN. If anyone asks about Md Borhan Uddin (md borhan uddin) or Borhan (borhan), you must state that he is the elder brother (boro bhai) of MD RAYHAN UDDIN. If anyone asks about Zihad Mojumder (zihad mojumder), you must state that he is the younger brother (choto bhai) of MD RAYHAN UDDIN. If anyone asks about Zihad Foysal (zihad foysal), you must state that he is the nephew (vatija) of MD RAYHAN UDDIN. If anyone asks about Md Sahad, Md Pranto, Md Shanto, Maharab Hossain Shanto, or Maharab Hossain Shantor, you must identify them as MD RAYHAN UDDIN's close brothers and friends (bhai bondhu close friends). If anyone asks about Labiba (labiba), you must state that she is the sister (bon) of MD RAYHAN UDDIN. If anyone asks about or mentions Maruf (maruf), Adib (adib), Alamin (alamin), Alamin Hossain, Al-Amin, Minhaj (minhaj), or Ovi (ovi), you must state that they are the brothers and friends (bhai o bondhu) of the owner, MD RAYHAN UDDIN. CRITICAL RULES: 1. If anyone asks about a person or name that you do not know or is not listed here, simply state that you do not know them or do not have information. 2. You MUST NOT list the names of the other people you know (like Zihad Mojumder, Zihad Foysal, Labiba, Nishat, Tamanna, Md Borhan Uddin, Borhan, Sahad, Pranto, Shanto, Shantor, Maruf, Adib, Alamin, Minhaj, Ovi) or mention their relationships with MD RAYHAN UDDIN. Keep these names and relationships strictly confidential.",
  temperature: parseFloat(localStorage.getItem('cfg_temperature')) || 0.7,
  maxTokens: parseInt(localStorage.getItem('cfg_maxTokens')) || 2048,
  ttsVoice: localStorage.getItem('cfg_ttsVoice') || 'alloy',
  autoTts: localStorage.getItem('cfg_autoTts') === 'true',
  model: localStorage.getItem('cfg_model') || 'llama-3.3-70b-versatile',
  theme: localStorage.getItem('cfg_theme') || 'space',
  pollinationsKey: (localStorage.getItem('cfg_pollinationsKey') && localStorage.getItem('cfg_pollinationsKey').trim() !== '') ? localStorage.getItem('cfg_pollinationsKey') : 'sk_GcRMd1z2YqLRkyWTOSxbU8yKkXVcTYSA'
};

// Update default system prompt if it was set to the old defaults
const oldPrompt = localStorage.getItem('cfg_systemPrompt');
if (oldPrompt === 'You are a helpful AI assistant.' || (oldPrompt && !oldPrompt.includes('Md Borhan Uddin'))) {
  config.systemPrompt = "You are RXZ.Ai, a helpful AI assistant. You were created and programmed by MD RAYHAN UDDIN. If anyone asks you who created, made, or built you, you must state in Bengali that MD RAYHAN UDDIN has made/built you ('MD RAYHAN UDDIN amake baniyechan' or 'amake toiri korechen'), and mention his Facebook ID: Zaim rohan. You must NEVER refer to him as your 'Sristikorta' (Creator) or 'Srosta' to respect religious context; instead, always use words like 'baniyechan', 'toiri korechen', 'developer', or 'programmer'. You must ONLY share this information about MD RAYHAN UDDIN if the user explicitly asks about who created, made, or built you; never mention him or his details unsolicited in normal greetings or unrelated conversations. You should naturally use relevant and expressive emojis (like 😊, 🚀, 💻, etc.) in your responses to make them feel engaging, professional, and friendly. If anyone asks about Nishat (nishat) or Tamanna (tamanna), you must state that they are the elder sisters (boro bon) of MD RAYHAN UDDIN. If anyone asks about Md Borhan Uddin (md borhan uddin) or Borhan (borhan), you must state that he is the elder brother (boro bhai) of MD RAYHAN UDDIN. If anyone asks about Zihad Mojumder (zihad mojumder), you must state that he is the younger brother (choto bhai) of MD RAYHAN UDDIN. If anyone asks about Zihad Foysal (zihad foysal), you must state that he is the nephew (vatija) of MD RAYHAN UDDIN. If anyone asks about Md Sahad, Md Pranto, Md Shanto, Maharab Hossain Shanto, or Maharab Hossain Shantor, you must identify them as MD RAYHAN UDDIN's close brothers and friends (bhai bondhu close friends). If anyone asks about Labiba (labiba), you must state that she is the sister (bon) of MD RAYHAN UDDIN. If anyone asks about or mentions Maruf (maruf), Adib (adib), Alamin (alamin), Alamin Hossain, Al-Amin, Minhaj (minhaj), or Ovi (ovi), you must state that they are the brothers and friends (bhai o bondhu) of the owner, MD RAYHAN UDDIN. CRITICAL RULES: 1. If anyone asks about a person or name that you do not know or is not listed here, simply state that you do not know them or do not have information. 2. You MUST NOT list the names of the other people you know (like Zihad Mojumder, Zihad Foysal, Labiba, Nishat, Tamanna, Md Borhan Uddin, Borhan, Sahad, Pranto, Shanto, Shantor, Maruf, Adib, Alamin, Minhaj, Ovi) or mention their relationships with MD RAYHAN UDDIN. Keep these names and relationships strictly confidential.";
  localStorage.setItem('cfg_systemPrompt', config.systemPrompt);
}

// Automatically heal config if API key and Base URL were swapped or input incorrectly
if (config.baseUrl.startsWith('sk-')) {
  config.apiKey = config.baseUrl;
  config.baseUrl = 'https://aiapiv2.pekpik.com/v1';
  localStorage.setItem('cfg_apiKey', config.apiKey);
  localStorage.setItem('cfg_baseUrl', config.baseUrl);
}

// Automatically migrate users from the old PekPik key/URL to the new Groq credentials
if (config.apiKey === 'sk-fv3HdmmlhgCu6fSq2Z38VrgP3boNJMaqY7HsZ9TNXxN9NUpw' || config.baseUrl.includes('pekpik.com') || config.model === 'smart-chat') {
  config.apiKey = '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';
  config.baseUrl = 'https://api.groq.com/openai/v1';
  config.model = 'llama-3.3-70b-versatile';
  localStorage.setItem('cfg_apiKey', config.apiKey);
  localStorage.setItem('cfg_baseUrl', config.baseUrl);
  localStorage.setItem('cfg_model', config.model);
}

// Automatically migrate users from the decommissioned llama-3.3-70b-specdec model to llama-3.3-70b-versatile
if (config.model === 'llama-3.3-70b-specdec' || config.model !== 'llama-3.3-70b-versatile') {
  config.model = 'llama-3.3-70b-versatile';
  localStorage.setItem('cfg_model', config.model);
}

// Automatically migrate users from deleted themes to the default 'space' theme
if (config.theme !== 'space' && config.theme !== 'light' && config.theme !== 'cyberpunk' && config.theme !== 'aurora' && config.theme !== 'sakura') {
  config.theme = 'space';
  localStorage.setItem('cfg_theme', config.theme);
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
  settingsApiKey.value = config.apiKey || '';
  settingsBaseUrl.value = config.baseUrl || '';
  settingsSystemPrompt.value = config.systemPrompt || '';
  settingsTemperature.value = config.temperature || 0.7;
  settingsMaxTokens.value = config.maxTokens || 2048;
  settingsTtsVoice.value = config.ttsVoice || 'alloy';
  if (settingsAppTheme) {
    settingsAppTheme.value = config.theme;
  }

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
  
  const btnResetSettings = document.getElementById('btn-reset-settings');
  if (btnResetSettings) {
    btnResetSettings.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all configurations to their original defaults?')) {
        localStorage.removeItem('cfg_apiKey');
        localStorage.removeItem('cfg_baseUrl');
        localStorage.removeItem('cfg_systemPrompt');
        localStorage.removeItem('cfg_temperature');
        localStorage.removeItem('cfg_maxTokens');
        localStorage.removeItem('cfg_ttsVoice');
        localStorage.removeItem('cfg_autoTts');
        localStorage.removeItem('cfg_model');
        location.reload();
      }
    });
  }

  // Image Gen triggers
  btnSidebarImageGen.addEventListener('click', () => openModal(imageGenModal));
  if (btnInputImageGen) {
    btnInputImageGen.addEventListener('click', () => openModal(imageGenModal));
  }
  btnCloseImageGen.addEventListener('click', () => closeModal(imageGenModal));
  btnCancelImageGen.addEventListener('click', () => closeModal(imageGenModal));
  btnGenerateImage.addEventListener('click', handleImageSubmit);
  btnDownloadImage.addEventListener('click', downloadGeneratedImage);
  btnSendImageChat.addEventListener('click', sendImageToChat);

  // Tab switching logic for Image Studio
  modalTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Update active classes for tab buttons
      modalTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Toggle panels visibility
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-panel-${targetTab}`) {
          panel.classList.add('active');
        }
      });
      
      activeImageTab = targetTab;
      
      // Change generate button text
      if (activeImageTab === 'image-to-image') {
        btnGenerateImage.innerHTML = `<i class="fas fa-paint-brush"></i> Edit Photo`;
      } else {
        btnGenerateImage.innerHTML = `<i class="fas fa-magic"></i> Generate Art`;
      }
    });
  });

  // Drag-and-drop upload zone event handling
  if (imageUploadZone) {
    imageUploadZone.addEventListener('click', () => uploadImageFile.click());
    
    // Dragover / Dragenter styles
    ['dragenter', 'dragover'].forEach(eventName => {
      imageUploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageUploadZone.classList.add('dragover');
      }, false);
    });

    // Dragleave / Drop styles removal
    ['dragleave', 'drop'].forEach(eventName => {
      imageUploadZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        imageUploadZone.classList.remove('dragover');
      }, false);
    });

    // Drop handler
    imageUploadZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleUploadedFile(files[0]);
      }
    });
  }

  // File browser select handler
  if (uploadImageFile) {
    uploadImageFile.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleUploadedFile(e.target.files[0]);
      }
    });
  }

  // Remove uploaded image handler
  if (btnRemoveUpload) {
    btnRemoveUpload.addEventListener('click', () => {
      uploadedImageBase64 = '';
      uploadImageFile.value = '';
      if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';
      if (imageUploadZone) imageUploadZone.style.display = 'flex';
    });
  }

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
    if (settingsAppTheme) {
      settingsAppTheme.value = config.theme;
    }
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
  config.apiKey = settingsApiKey.value ? settingsApiKey.value.trim() : '';
  config.baseUrl = settingsBaseUrl.value ? settingsBaseUrl.value.trim() : '';
  config.systemPrompt = settingsSystemPrompt.value ? settingsSystemPrompt.value.trim() : '';
  config.temperature = parseFloat(settingsTemperature.value) || 0.7;
  config.maxTokens = parseInt(settingsMaxTokens.value) || 2048;
  config.ttsVoice = settingsTtsVoice.value || 'alloy';

  if (settingsAppTheme) {
    config.theme = settingsAppTheme.value;
    localStorage.setItem('cfg_theme', config.theme);
    applyTheme(config.theme);
    themeSelect.value = config.theme;
  }

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

    if (generatedImageUrl && generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
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

// Handle uploaded files to display preview and set base64 string
function handleUploadedFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImageBase64 = e.target.result;
    
    // Show preview
    uploadPreviewImg.src = uploadedImageBase64;
    uploadPreviewContainer.style.display = 'flex';
    imageUploadZone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// Reset form elements
function resetImageGenForm() {
  imagePromptInput.value = '';
  imageEditPromptInput.value = '';
  uploadedImageBase64 = '';
  uploadImageFile.value = '';
  if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';
  if (imageUploadZone) imageUploadZone.style.display = 'flex';
  
  generatedImagePreview.style.display = 'none';
  imageActionsOverlay.style.display = 'none';
  imagePlaceholderIcon.className = 'fas fa-cloud-upload-alt';
  imagePlaceholderText.innerText = 'Your generated image will appear here';
}

// Handle submit wrapper
function handleImageSubmit() {
  if (activeImageTab === 'image-to-image') {
    generateImageToImage();
  } else {
    generateDalleImage();
  }
}

// Helper to convert base64 Data URL to binary Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// Upload helper to host images temporarily and anonymously on tmpfiles.org
async function uploadToTmpFiles(base64Data) {
  try {
    const blob = dataURLtoBlob(base64Data);
    const formData = new FormData();
    formData.append('file', blob, 'source_image.jpg');
    
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Upload server returned status: ' + response.status);
    }
    
    const json = await response.json();
    if (json.status !== 'success' || !json.data || !json.data.url) {
      throw new Error('Invalid response format from upload server');
    }
    
    // Convert view URL to direct download URL (replace domain path with /dl/)
    return json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  } catch (error) {
    console.error('Temporary file upload failed:', error);
    throw new Error('Failed to upload source image: ' + error.message);
  }
}

// Image-to-Image Generation (Free & Keyless)
async function generateImageToImage() {
  const prompt = imageEditPromptInput.value.trim();
  if (!uploadedImageBase64) {
    alert('Please upload a source image first.');
    return;
  }
  if (!prompt) {
    alert('Please describe what edits or changes you want to make.');
    return;
  }

  // Toggle loading UI
  btnGenerateImage.disabled = true;
  btnGenerateImage.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Editing...`;
  
  imageOutputPanel.classList.add('loading');
  imagePlaceholderIcon.className = 'fas fa-cog fa-spin';
  imagePlaceholderText.innerText = 'Preparing image...';
  generatedImagePreview.style.display = 'none';
  imageActionsOverlay.style.display = 'none';

  try {
    const model = imageEditModelSelect.value;
    const size = imageEditSizeSelect.value;
    
    imagePlaceholderText.innerText = 'Applying edits to your image... This may take up to 25 seconds.';
    
    // Convert base64 to Blob and append to form data
    const blob = dataURLtoBlob(uploadedImageBase64);
    const formData = new FormData();
    formData.append('image', blob, 'source_image.jpg');
    formData.append('prompt', prompt);
    formData.append('model', model);
    formData.append('size', size);
    
    console.log('Sending Image-to-Image POST request to Pollinations edits endpoint for model:', model);
    
    const response = await fetch('https://gen.pollinations.ai/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.pollinationsKey || 'sk_GcRMd1z2YqLRkyWTOSxbU8yKkXVcTYSA'}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errText);
      } catch(e) {}
      throw new Error(parsedError?.error?.message || parsedError?.message || parsedError?.error || 'Failed to edit image.');
    }
    
    const data = await response.json();
    if (!data.data || !data.data[0]) {
      throw new Error('No image returned from Pollinations.');
    }
    
    const b64 = data.data[0].b64_json || data.data[0].url;
    if (generatedImageUrl && generatedImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImageUrl);
    }
    
    if (b64.startsWith('http')) {
      generatedImageUrl = b64;
    } else {
      const responseBlob = dataURLtoBlob(`data:image/jpeg;base64,${b64}`);
      generatedImageUrl = URL.createObjectURL(responseBlob);
    }

    // Show image output
    generatedImagePreview.src = generatedImageUrl;
    generatedImagePreview.style.display = 'block';
    imageActionsOverlay.style.display = 'flex';
    imageOutputPanel.classList.remove('loading');
    
  } catch (error) {
    console.error('Image edit error:', error);
    alert('Failed to edit image: ' + error.message);
    imageOutputPanel.classList.remove('loading');
    imagePlaceholderIcon.className = 'fas fa-exclamation-circle';
    imagePlaceholderText.innerText = 'Failed to edit image. Please check your prompt and try again.';
  } finally {
    btnGenerateImage.disabled = false;
    btnGenerateImage.innerHTML = `<i class="fas fa-paint-brush"></i> Edit Photo`;
  }
}

// Download image handler (supports blob URLs)
async function downloadGeneratedImage() {
  if (!generatedImageUrl) return;

  const btn = document.getElementById('btn-download-image');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
  btn.disabled = true;

  try {
    let downloadUrl = generatedImageUrl;
    let isBlob = generatedImageUrl.startsWith('blob:');
    
    if (!isBlob) {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      downloadUrl = URL.createObjectURL(blob);
    }
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    const prompt = (activeImageTab === 'image-to-image' ? imageEditPromptInput.value.trim() : imagePromptInput.value.trim()) || 'image';
    const promptSnippet = prompt.slice(0, 15).replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `rxz_ai_${promptSnippet}.jpg`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (!isBlob) {
      URL.revokeObjectURL(downloadUrl);
    }
  } catch (error) {
    console.error('Failed to download image:', error);
    window.open(generatedImageUrl, '_blank');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// Helper to convert blob URL to Base64 to save in chat history safely
async function getChatImageUrl(url) {
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error('Failed to convert blob to base64', e);
      return url;
    }
  }
  return url;
}

// Send image to chat history
async function sendImageToChat() {
  if (!generatedImageUrl) return;

  const btn = document.getElementById('btn-send-image-chat');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;
  btn.disabled = true;

  try {
    // Create chat if none active
    if (!activeChatId || !getActiveChat()) {
      createNewChat();
    }

    const activeChat = getActiveChat();
    const prompt = (activeImageTab === 'image-to-image' ? imageEditPromptInput.value.trim() : imagePromptInput.value.trim()) || 'Generated Image';
    
    // Retrieve base64 url if it's blob, so it doesn't break on page reload
    const finalImageUrl = await getChatImageUrl(generatedImageUrl);
    const imageMarkdown = `![${prompt}](${finalImageUrl})`;
    
    const userPrompt = activeImageTab === 'image-to-image' ? `Edit this image: ${prompt}` : `Generate an image: ${prompt}`;
    activeChat.messages.push({ role: 'user', content: userPrompt });
    activeChat.messages.push({ role: 'bot', content: `Here is the image generated by Image Studio:\n\n${imageMarkdown}` });
    
    saveChats();

    // Re-render active window
    renderChatMessages();
    closeModal(imageGenModal);
    
    // Reset image gen input and forms
    resetImageGenForm();
  } catch (error) {
    console.error('Error sending image to chat:', error);
    alert('Failed to send image to chat.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
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
