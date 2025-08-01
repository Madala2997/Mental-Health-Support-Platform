// Global variables
let currentUser = null;
let socket = null;
let currentPage = 'home';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    initializeGoogleAuth();
});

// Initialize application
function initializeApp() {
    // Initialize Socket.IO
    socket = io();
    
    // Setup socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('receive-message', (data) => {
        displayMessage(data);
    });

    // Setup navigation
    setupNavigation();
    
    // Load initial page
    navigateToPage('home');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation toggle for mobile
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Filter change listeners
    const resourceCategory = document.getElementById('resource-category');
    const resourceType = document.getElementById('resource-type');
    const forumCategory = document.getElementById('forum-category');

    if (resourceCategory) resourceCategory.addEventListener('change', loadResources);
    if (resourceType) resourceType.addEventListener('change', loadResources);
    if (forumCategory) forumCategory.addEventListener('change', loadForumPosts);

    // Search listeners
    const resourceSearch = document.getElementById('resource-search');
    if (resourceSearch) {
        resourceSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchResources();
        });
    }

    // Mood slider listener
    const moodRange = document.getElementById('mood-range');
    if (moodRange) {
        moodRange.addEventListener('input', updateMoodDisplay);
    }

    // Message input listener
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// Navigate to page
function navigateToPage(page) {
    // Check if user needs to be authenticated
    const protectedPages = ['journal', 'forum', 'mood', 'chat', 'profile'];
    if (protectedPages.includes(page) && !currentUser) {
        showLogin();
        return;
    }

    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // Show selected page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = page;
    }

    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Load page-specific content
    loadPageContent(page);
}

// Load page-specific content
function loadPageContent(page) {
    switch (page) {
        case 'resources':
            loadResources();
            break;
        case 'journal':
            loadJournalEntries();
            break;
        case 'forum':
            loadForumPosts();
            break;
        case 'mood':
            loadMoodData();
            break;
        case 'chat':
            loadChatConversations();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Authentication functions
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Token invalid');
        })
        .then(user => {
            currentUser = user;
            updateUIForAuthenticatedUser();
        })
        .catch(() => {
            localStorage.removeItem('token');
            updateUIForUnauthenticatedUser();
        });
    } else {
        updateUIForUnauthenticatedUser();
    }
}

function updateUIForAuthenticatedUser() {
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('nav-user').style.display = 'block';
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Update avatar if available
    if (currentUser.profile && currentUser.profile.avatar) {
        document.getElementById('user-avatar').src = currentUser.profile.avatar;
    }
}

function updateUIForUnauthenticatedUser() {
    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('nav-user').style.display = 'none';
}

// Google Auth initialization
function initializeGoogleAuth() {
    if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
            client_id: '495521740918-5egpfu7976co73dbgnr42bl0hn4v7gqa.apps.googleusercontent.com',
            callback: handleGoogleSignIn
        });

        // Render sign-in buttons
        google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large', width: '100%' }
        );

        google.accounts.id.renderButton(
            document.getElementById('google-signup-button'),
            { theme: 'outline', size: 'large', width: '100%' }
        );
    }
}

function handleGoogleSignIn(response) {
    fetch('/api/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            googleToken: response.credential
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForAuthenticatedUser();
            closeAuthModal();
            showToast('Welcome to MindMitra!', 'success');
        } else {
            showToast(data.message || 'Google sign-in not configured yet', 'warning');
        }
    })
    .catch(error => {
        console.error('Google sign-in error:', error);
        showToast('Sign-in failed', 'error');
    });
}

// Modal functions
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('auth-modal').style.display = 'block';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('auth-modal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

// Auth form handlers
function login(event) {
    event.preventDefault();
    showLoading();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForAuthenticatedUser();
            closeAuthModal();
            showToast('Welcome back!', 'success');
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Login error:', error);
        showToast('Login failed', 'error');
    });
}

function register(event) {
    event.preventDefault();
    showLoading();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.token) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            updateUIForAuthenticatedUser();
            closeAuthModal();
            showToast('Welcome to MindMitra!', 'success');
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Registration error:', error);
        showToast('Registration failed', 'error');
    });
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateUIForUnauthenticatedUser();
    navigateToPage('home');
    showToast('Logged out successfully', 'success');
}

// Resources functions
function loadResources() {
    const category = document.getElementById('resource-category').value;
    const type = document.getElementById('resource-type').value;
    const search = document.getElementById('resource-search').value;

    let url = '/api/resources?';
    if (category) url += `category=${category}&`;
    if (type) url += `type=${type}&`;
    if (search) url += `search=${search}&`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        displayResources(data.resources);
    })
    .catch(error => {
        console.error('Error loading resources:', error);
        showToast('Failed to load resources', 'error');
    });
}

function searchResources() {
    loadResources();
}

function displayResources(resources) {
    const grid = document.getElementById('resources-grid');
    grid.innerHTML = '';

    resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <div class="resource-meta">
                <span>${resource.type}</span>
                <span>${resource.category}</span>
                <span>${resource.views} views</span>
            </div>
            <div class="resource-tags">
                ${resource.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
        card.addEventListener('click', () => viewResource(resource._id));
        grid.appendChild(card);
    });
}

function viewResource(id) {
    // Implementation for viewing individual resource
    showToast('Resource viewer coming soon!', 'info');
}

// Journal functions
function showJournalForm() {
    document.getElementById('journal-form').style.display = 'block';
}

function hideJournalForm() {
    document.getElementById('journal-form').style.display = 'none';
    document.getElementById('journal-content').value = '';
}

function submitJournalEntry(event) {
    event.preventDefault();
    
    const content = document.getElementById('journal-content').value;
    const mood = document.querySelector('input[name="mood"]:checked').value;
    const isAnonymous = document.getElementById('anonymous-post').checked;

    fetch('/api/journal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, mood, isAnonymous })
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            hideJournalForm();
            loadJournalEntries();
            showToast('Entry shared successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to share entry', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting journal entry:', error);
        showToast('Failed to share entry', 'error');
    });
}

function loadJournalEntries() {
    fetch('/api/journal')
    .then(response => response.json())
    .then(data => {
        displayJournalEntries(data.entries);
    })
    .catch(error => {
        console.error('Error loading journal entries:', error);
        showToast('Failed to load entries', 'error');
    });
}

function loadMyEntries() {
    if (!currentUser) return;

    fetch('/api/journal/my-entries', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayJournalEntries(data.entries);
    })
    .catch(error => {
        console.error('Error loading my entries:', error);
        showToast('Failed to load your entries', 'error');
    });
}

function displayJournalEntries(entries) {
    const container = document.getElementById('journal-entries');
    container.innerHTML = '';

    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry';
        
        const moodEmoji = getMoodEmoji(entry.mood);
        const authorName = entry.author ? entry.author.name : 'Anonymous';
        
        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-author">
                    <img src="https://via.placeholder.com/40" alt="Avatar">
                    <div>
                        <strong>${authorName}</strong>
                        <div class="entry-meta">${new Date(entry.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="entry-mood">${moodEmoji}</div>
            </div>
            <div class="entry-content">${entry.content}</div>
            <div class="entry-actions">
                <button class="reaction-btn" onclick="reactToEntry('${entry._id}', 'heart')">
                    ❤️ ${entry.reactions.filter(r => r.type === 'heart').length}
                </button>
                <button class="reaction-btn" onclick="reactToEntry('${entry._id}', 'hug')">
                    🤗 ${entry.reactions.filter(r => r.type === 'hug').length}
                </button>
                <button class="reaction-btn" onclick="reactToEntry('${entry._id}', 'support')">
                    💪 ${entry.reactions.filter(r => r.type === 'support').length}
                </button>
            </div>
        `;
        container.appendChild(entryDiv);
    });
}

function getMoodEmoji(mood) {
    const moodEmojis = {
        'very-sad': '😢',
        'sad': '😔',
        'neutral': '😐',
        'happy': '😊',
        'very-happy': '😄'
    };
    return moodEmojis[mood] || '😐';
}

function reactToEntry(entryId, type) {
    if (!currentUser) {
        showLogin();
        return;
    }

    fetch(`/api/journal/${entryId}/react`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            loadJournalEntries(); // Refresh entries
        }
    })
    .catch(error => {
        console.error('Error reacting to entry:', error);
        showToast('Failed to react', 'error');
    });
}

// Forum functions
function showForumForm() {
    document.getElementById('forum-form').style.display = 'block';
}

function hideForumForm() {
    document.getElementById('forum-form').style.display = 'none';
    document.getElementById('forum-title').value = '';
    document.getElementById('forum-content').value = '';
}

function submitForumPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('forum-title').value;
    const content = document.getElementById('forum-content').value;
    const category = document.getElementById('forum-post-category').value;
    const isAnonymous = document.getElementById('forum-anonymous').checked;

    fetch('/api/forum', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, content, category, isAnonymous })
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            hideForumForm();
            loadForumPosts();
            showToast('Discussion posted successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to post discussion', 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting forum post:', error);
        showToast('Failed to post discussion', 'error');
    });
}

function loadForumPosts() {
    const category = document.getElementById('forum-category').value;
    
    let url = '/api/forum';
    if (category) url += `?category=${category}`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        displayForumPosts(data.posts);
    })
    .catch(error => {
        console.error('Error loading forum posts:', error);
        showToast('Failed to load discussions', 'error');
    });
}

function displayForumPosts(posts) {
    const container = document.getElementById('forum-posts');
    container.innerHTML = '';

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'forum-post';
        
        const authorName = post.author ? post.author.name : 'Anonymous';
        
        postDiv.innerHTML = `
            <div class="post-header">
                <div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span>By ${authorName}</span>
                        <span>${new Date(post.createdAt).toLocaleDateString()}</span>
                        <span>${post.category}</span>
                    </div>
                </div>
            </div>
            <div class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</div>
            <div class="post-stats">
                <span>👍 ${post.upvotes.length}</span>
                <span>💬 ${post.replies.length}</span>
                <span>👁️ ${post.views}</span>
            </div>
        `;
        
        postDiv.addEventListener('click', () => viewForumPost(post._id));
        container.appendChild(postDiv);
    });
}

function viewForumPost(id) {
    // Implementation for viewing individual forum post
    showToast('Forum post viewer coming soon!', 'info');
}

// Mood tracker functions
function updateMoodDisplay() {
    const value = document.getElementById('mood-range').value;
    // Update mood display based on slider value
}

function saveMood() {
    if (!currentUser) {
        showLogin();
        return;
    }

    const moodValue = parseInt(document.getElementById('mood-range').value);
    const notes = document.getElementById('mood-notes').value;
    const factors = Array.from(document.querySelectorAll('.factor-tags input:checked')).map(cb => cb.value);
    
    const moodMap = {
        1: 'very-sad',
        2: 'sad',
        3: 'neutral',
        4: 'happy',
        5: 'very-happy'
    };

    fetch('/api/mood', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            mood: moodMap[moodValue],
            moodValue,
            notes,
            factors
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            showToast('Mood saved successfully!', 'success');
            loadMoodData();
        } else {
            showToast(data.message || 'Failed to save mood', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving mood:', error);
        showToast('Failed to save mood', 'error');
    });
}

function loadMoodData() {
    if (!currentUser) return;

    // Load today's mood
    fetch('/api/mood/today', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.moodValue) {
            document.getElementById('mood-range').value = data.moodValue;
            document.getElementById('mood-notes').value = data.notes || '';
        }
    })
    .catch(error => {
        console.error('Error loading today\'s mood:', error);
    });

    // Load analytics
    fetch('/api/mood/analytics', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('average-mood').textContent = data.averageMood.toFixed(1);
        document.getElementById('mood-streak').textContent = `${data.totalEntries} entries`;
    })
    .catch(error => {
        console.error('Error loading mood analytics:', error);
    });
}

// Chat functions
function startCounselorChat() {
    if (!currentUser) {
        showLogin();
        return;
    }

    fetch('/api/chat/counselor', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            openChatWindow(data);
        } else {
            showToast(data.message || 'No counselors available', 'warning');
        }
    })
    .catch(error => {
        console.error('Error starting counselor chat:', error);
        showToast('Failed to start chat', 'error');
    });
}

function showPeerChat() {
    showToast('Peer chat feature coming soon!', 'info');
}

function loadChatConversations() {
    if (!currentUser) return;

    fetch('/api/chat', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayChatConversations(data);
    })
    .catch(error => {
        console.error('Error loading chat conversations:', error);
    });
}

function displayChatConversations(chats) {
    const container = document.getElementById('chat-conversations');
    container.innerHTML = '';

    chats.forEach(chat => {
        const chatDiv = document.createElement('div');
        chatDiv.className = 'chat-conversation';
        
        const partner = chat.participants.find(p => p._id !== currentUser.id);
        
        chatDiv.innerHTML = `
            <div class="chat-preview">
                <img src="https://via.placeholder.com/40" alt="Avatar">
                <div>
                    <strong>${partner ? partner.name : 'Chat'}</strong>
                    <div class="last-message">Click to open chat</div>
                </div>
            </div>
        `;
        
        chatDiv.addEventListener('click', () => openChatWindow(chat));
        container.appendChild(chatDiv);
    });
}

function openChatWindow(chat) {
    document.getElementById('chat-window').style.display = 'flex';
    
    const partner = chat.participants.find(p => p._id !== currentUser.id);
    document.getElementById('chat-partner-name').textContent = partner ? partner.name : 'Chat';
    
    // Join chat room
    socket.emit('join-chat', chat._id);
    
    // Load messages
    loadChatMessages(chat._id);
}

function closeChatWindow() {
    document.getElementById('chat-window').style.display = 'none';
}

function loadChatMessages(chatId) {
    fetch(`/api/chat/${chatId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        displayChatMessages(data.messages);
    })
    .catch(error => {
        console.error('Error loading chat messages:', error);
    });
}

function displayChatMessages(messages) {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender._id === currentUser.id ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${new Date(message.createdAt).toLocaleTimeString()}</div>
        `;
        container.appendChild(messageDiv);
    });

    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content) return;

    // Send via socket for real-time
    socket.emit('send-message', {
        chatId: currentChatId,
        content,
        sender: currentUser.id
    });

    input.value = '';
}

function displayMessage(data) {
    const container = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.sender === currentUser.id ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${data.content}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
}

// Profile functions
function loadProfile() {
    if (!currentUser) return;

    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-bio').value = currentUser.profile?.bio || '';
    document.getElementById('profile-year').value = currentUser.profile?.year || '';
    document.getElementById('profile-department').value = currentUser.profile?.department || '';
}

function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('profile-name').value;
    const bio = document.getElementById('profile-bio').value;
    const year = document.getElementById('profile-year').value;
    const department = document.getElementById('profile-department').value;

    fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            name,
            profile: { bio, year, department }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data._id) {
            currentUser = data;
            updateUIForAuthenticatedUser();
            showToast('Profile updated successfully!', 'success');
        } else {
            showToast(data.message || 'Failed to update profile', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile', 'error');
    });
}

// Utility functions
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target === modal) {
        closeAuthModal();
    }
}
