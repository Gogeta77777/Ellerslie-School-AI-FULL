// Global variables
let currentUser = null;
let isTyping = false;

// API Configuration
const GEMINI_API_KEY = 'AIzaSyCVqKHmBKSuHjy0uaZ5UJTzbBX66sfafWo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
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
    showAuthScreen();
    showNotification('Logged out successfully', 'success');
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || isTyping) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get AI response
        const aiResponse = await getAIResponse(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response with typing effect
        addMessageWithTyping(aiResponse, 'ai');
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        console.error('AI Error:', error);
    }
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
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
    
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            element.textContent = text.substring(0, index + 1);
            index++;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            clearInterval(typeInterval);
            isTyping = false;
        }
    }, 30);
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

async function getAIResponse(message) {
    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `You are ESAI-Alpha-1, created by The Ellerslie School AI Company. You are a helpful AI assistant. Respond to this message: "${message}"`
                }]
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

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