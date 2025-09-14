// Global variables
let currentUser = null;
let isTyping = false;
let currentChatId = null;
let chats = [];
let typingInterval = null;
let webSearchEnabled = false;
let codeModeEnabled = false;

// API Configuration
const GEMINI_API_KEY = 'AIzaSyCVqKHmBKSuHjy0uaZ5UJTzbBX66sfafWo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Web Search API (using a simple search suggestion API)
const WEB_SEARCH_URL = 'https://api.duckduckgo.com/';

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginTab = document.querySelector('[data-tab="login"]');
const signupTab = document.querySelector('[data-tab="signup"]');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const stopBtn = document.getElementById('stop-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');
const currentChatTitle = document.getElementById('current-chat-title');
const webSearchToggle = document.getElementById('web-search-toggle');
const codeModeToggle = document.getElementById('code-mode-toggle');
const codeModal = document.getElementById('code-modal');
const closeCodeModal = document.getElementById('close-code-modal');
const codeOutput = document.getElementById('code-output');
const languageSelect = document.getElementById('language-select');
const copyCodeBtn = document.getElementById('copy-code');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadChats();
        showMainScreen();
    } else {
        showAuthScreen();
    }
}

function setupEventListeners() {
    // Tab switching
    loginTab.addEventListener('click', () => switchTab('login'));
    signupTab.addEventListener('click', () => switchTab('signup'));
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Chat functionality
    sendBtn.addEventListener('click', sendMessage);
    stopBtn.addEventListener('click', stopTyping);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Chat management
    newChatBtn.addEventListener('click', createNewChat);
    
    // Feature toggles
    webSearchToggle.addEventListener('click', toggleWebSearch);
    codeModeToggle.addEventListener('click', toggleCodeMode);
    
    // Code modal
    closeCodeModal.addEventListener('click', () => codeModal.classList.add('hidden'));
    copyCodeBtn.addEventListener('click', copyCode);
    languageSelect.addEventListener('change', updateCodeSyntax);
    
    // Close modal on outside click
    codeModal.addEventListener('click', function(e) {
        if (e.target === codeModal) {
            codeModal.classList.add('hidden');
        }
    });
}

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById(`${tab}-form`).classList.add('active');
}

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
}

function showMainScreen() {
    authScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    currentUserSpan.textContent = currentUser.username;
    loadChats();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const users = await loadUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showMainScreen();
            showNotification('Login successful!', 'success');
        } else {
            showNotification('Invalid username or password', 'error');
        }
    } catch (error) {
        showNotification('Error loading user data', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const users = await loadUsers();
        
        if (users.find(u => u.username === username)) {
            showNotification('Username already exists', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username,
            password,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await saveUsers(users);
        
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMainScreen();
        showNotification('Account created successfully!', 'success');
    } catch (error) {
        showNotification('Error creating account', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('chats');
    chats = [];
    currentChatId = null;
    showAuthScreen();
    showNotification('Logged out successfully', 'success');
}

// Chat Management Functions
function createNewChat() {
    const newChat = {
        id: Date.now(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        lastMessage: null
    };
    
    chats.unshift(newChat);
    currentChatId = newChat.id;
    saveChats();
    renderChatList();
    switchToChat(newChat.id);
    showNotification('New chat created', 'success');
}

function switchToChat(chatId) {
    currentChatId = chatId;
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
        currentChatTitle.textContent = chat.title;
        renderChatMessages(chat.messages);
        
        // Update active chat in sidebar
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add('active');
    }
}

function deleteChat(chatId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        chats = chats.filter(c => c.id !== chatId);
        
        if (currentChatId === chatId) {
            if (chats.length > 0) {
                switchToChat(chats[0].id);
            } else {
                createNewChat();
            }
        }
        
        saveChats();
        renderChatList();
        showNotification('Chat deleted', 'success');
    }
}

function renderChatList() {
    chatList.innerHTML = '';
    
    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        if (chat.id === currentChatId) chatItem.classList.add('active');
        chatItem.setAttribute('data-chat-id', chat.id);
        
        chatItem.innerHTML = `
            <div class="chat-item-info">
                <div class="chat-item-title">${chat.title}</div>
                <div class="chat-item-preview">${chat.lastMessage || 'No messages yet'}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-item-btn" onclick="deleteChat(${chat.id})" title="Delete Chat">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.chat-item-actions')) {
                switchToChat(chat.id);
            }
        });
        
        chatList.appendChild(chatItem);
    });
}

function renderChatMessages(messages) {
    chatMessages.innerHTML = '';
    
    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm ESAI-Alpha-1, created by The Ellerslie School AI Company. How can I assist you today?</p>
                </div>
            </div>
        `;
        return;
    }
    
    messages.forEach(message => {
        addMessageToDOM(message.content, message.sender, false);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Message Functions
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Add user message to current chat
    const userMessage = {
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
    };
    
    const currentChat = chats.find(c => c.id === currentChatId);
    if (currentChat) {
        currentChat.messages.push(userMessage);
        currentChat.lastMessage = message;
        
        // If this is the first message, generate a title
        if (currentChat.messages.length === 1) {
            currentChat.title = await generateChatTitle(message);
            currentChatTitle.textContent = currentChat.title;
        }
        
        saveChats();
        renderChatList();
    }
    
    addMessageToDOM(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator and stop button
    showTypingIndicator();
    stopBtn.classList.remove('hidden');
    sendBtn.classList.add('hidden');
    
    try {
        // Get AI response
        const aiResponse = await getAIResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        stopBtn.classList.add('hidden');
        sendBtn.classList.remove('hidden');
        
        // Add AI response to chat
        const aiMessage = {
            content: aiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString()
        };
        
        if (currentChat) {
            currentChat.messages.push(aiMessage);
            saveChats();
        }
        
        // Add AI response with typing effect
        addMessageWithTyping(aiResponse, 'ai');
        
    } catch (error) {
        removeTypingIndicator();
        stopBtn.classList.add('hidden');
        sendBtn.classList.remove('hidden');
        addMessageToDOM('Sorry, I encountered an error. Please try again.', 'ai');
        console.error('AI Error:', error);
    }
}

function addMessageToDOM(content, sender, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    if (animate) messageDiv.style.animation = 'messageSlideIn 0.3s ease';
    
    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}-avatar`;
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessageWithTyping(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = `avatar ${sender}-avatar`;
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Type out the message
    typeMessage(messageContent, content);
}

function typeMessage(element, text) {
    isTyping = true;
    let index = 0;
    
    typingInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            clearInterval(typingInterval);
            isTyping = false;
        }
    }, 30);
}

function stopTyping() {
    if (typingInterval) {
        clearInterval(typingInterval);
        isTyping = false;
    }
    removeTypingIndicator();
    stopBtn.classList.add('hidden');
    sendBtn.classList.remove('hidden');
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar ai-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';
    
    const dots = document.createElement('div');
    dots.className = 'typing-dots';
    dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(dots);
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Feature Toggle Functions
function toggleWebSearch() {
    webSearchEnabled = !webSearchEnabled;
    webSearchToggle.classList.toggle('active', webSearchEnabled);
    showNotification(webSearchEnabled ? 'Web search enabled' : 'Web search disabled', 'info');
}

function toggleCodeMode() {
    codeModeEnabled = !codeModeEnabled;
    codeModeToggle.classList.toggle('active', codeModeEnabled);
    showNotification(codeModeEnabled ? 'Code mode enabled' : 'Code mode disabled', 'info');
}

// AI Response Functions
async function getAIResponse(message) {
    let prompt = `You are ESAI-Alpha-1, created by The Ellerslie School AI Company. You are a helpful AI assistant.`;
    
    if (webSearchEnabled) {
        prompt += ` You have access to web search capabilities. If the user asks about current events, recent information, or anything that might require up-to-date information, you can provide search suggestions and mention that you can help them find current information.`;
        
        // Add web search context if relevant
        const searchContext = await getWebSearchContext(message);
        if (searchContext) {
            prompt += ` Here's some web search context: ${searchContext}`;
        }
    }
    
    if (codeModeEnabled) {
        prompt += ` You are in code generation mode. When providing code, make sure it's well-formatted and include comments. The user can copy the code from a special code viewer.`;
    }
    
    prompt += ` Respond to this message: "${message}"`;
    
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // If code mode is enabled and response contains code, show in code modal
    if (codeModeEnabled && (aiResponse.includes('```') || aiResponse.includes('function') || aiResponse.includes('class'))) {
        const codeMatch = aiResponse.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
            const language = codeMatch[1] || 'javascript';
            const code = codeMatch[2];
            
            // Update code modal
            languageSelect.value = language;
            codeOutput.textContent = code;
            updateCodeSyntax();
            
            // Show code modal
            codeModal.classList.remove('hidden');
            
            // Remove code from main response
            aiResponse = aiResponse.replace(/```(\w+)?\n([\s\S]*?)```/g, '[Code generated - see code viewer]');
        }
    }
    
    return aiResponse;
}

async function generateChatTitle(firstMessage) {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Generate a short, descriptive title (max 30 characters) for a chat that starts with this message: "${firstMessage}"`
                    }]
                }]
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.candidates[0].content.parts[0].text.trim().substring(0, 30);
        }
    } catch (error) {
        console.error('Error generating title:', error);
    }
    
    return 'New Chat';
}

async function getWebSearchContext(query) {
    try {
        // Simple search suggestions using DuckDuckGo Instant Answer API
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
        const data = await response.json();
        
        if (data.Abstract) {
            return `Search result for "${query}": ${data.Abstract}`;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            const firstTopic = data.RelatedTopics[0];
            if (firstTopic.Text) {
                return `Search context for "${query}": ${firstTopic.Text.substring(0, 200)}...`;
            }
        }
        
        return `Search query: "${query}" - I can help you find more information about this topic.`;
    } catch (error) {
        console.error('Web search error:', error);
        return `Search query: "${query}" - I can help you find information about this topic.`;
    }
}

// Code Modal Functions
function updateCodeSyntax() {
    const language = languageSelect.value;
    codeOutput.className = `code-${language}`;
}

function copyCode() {
    const code = codeOutput.textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

// Data Management Functions
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.log('No server, using local storage');
    }
    
    // Fallback to localStorage
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

async function saveUsers(users) {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(users)
        });
        if (response.ok) {
            return;
        }
    } catch (error) {
        console.log('No server, using local storage');
    }
    
    // Fallback to localStorage
    localStorage.setItem('users', JSON.stringify(users));
}

function loadChats() {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
        chats = JSON.parse(savedChats);
        if (chats.length > 0) {
            currentChatId = chats[0].id;
            switchToChat(currentChatId);
        } else {
            createNewChat();
        }
    } else {
        createNewChat();
    }
    renderChatList();
}

function saveChats() {
    localStorage.setItem('chats', JSON.stringify(chats));
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease'
    });
    
    if (type === 'success') {
        notification.style.background = '#2ecc71';
    } else if (type === 'error') {
        notification.style.background = '#e74c3c';
    } else {
        notification.style.background = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);