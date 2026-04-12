// --- КОНФИГУРАЦИЯ ---
const GROQ_API_KEY = "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"; // Вставь сюда свой API ключ
const getArticles = () => JSON.parse(localStorage.getItem("articles") || "[]");
const saveArticles = (articles) => localStorage.setItem("articles", JSON.stringify(articles));

// --- 1. АВТОРИЗАЦИЯ И ДОСТУП ---

function handleAuthClick() {
    const email = prompt("Corporate Email (@alu.escuelassj.com):");
    if (!email) return;

    // Валидация почты (RegEx)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@alu.escuelassj\.com$/;
    if (!emailRegex.test(email.toLowerCase())) {
        alert("ACCESS DENIED: Internal domain @escuelassj.com required.");
        return;
    }

    const nick = prompt("Professional Nickname (min 3 chars):");
    if (!nick || nick.length < 3) {
        alert("INVALID NICKNAME: Too short.");
        return;
    }

    // Очистка ника от мусора
    const cleanNick = nick.trim().replace(/[^a-zA-Z0-9_]/g, '');

    localStorage.setItem("userEmail", email.toLowerCase());
    localStorage.setItem("userNick", cleanNick);
    
    alert(`Welcome to the grid, @${cleanNick}`);
    location.reload();
}

function checkAuth() {
    const nick = localStorage.getItem("userNick");
    const loginBtn = document.getElementById('login-btn');
    const userControls = document.getElementById('user-controls'); // Наш новый контейнер
    const userDisplay = document.getElementById('user-display');

    if (nick) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userControls) userControls.style.display = "flex"; // Показываем сразу кнопку и аватар
        
        if (userDisplay) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${nick}&background=2563eb&color=fff&bold=true`;
            userDisplay.innerHTML = `<img src="${avatarUrl}" alt="Profile">`;
        }
    }
}

function handleLogout() {
    if (confirm("Terminate current session?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- 2. ЛОГИКА СТАТЕЙ (ЛАЙКИ, ПРОСМОТРЫ, КЛИКИ) ---

function handleCardClick(event, id) {
    // Если кликнули по кнопке лайка - не переходим
    if (event.target.closest('.like-btn')) {
        addLike(id);
        return;
    }
    
    // Засчитываем просмотр и открываем
    addView(id);
    window.location.href = `article.html?id=${id}`;
}

function addLike(id) {
    let articles = getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx !== -1) {
        articles[idx].likes = (articles[idx].likes || 0) + 1;
        saveArticles(articles);
        if (typeof displayArticles === 'function') displayArticles();
    }
}

function addView(id) {
    let articles = getArticles();
    const idx = articles.findIndex(a => a.id === id);
    if (idx !== -1) {
        articles[idx].views = (articles[idx].views || 0) + 1;
        saveArticles(articles);
    }
}

// --- 3. СУПЕР-МОДЕРАЦИЯ (LOCAL + AI) ---

async function moderateArticle(title, content) {
    // А) Локальная проверка (быстрая)
    if (title.length < 5 || content.length < 20) {
        return { isValid: false, reason: "Insufficient data depth (too short)." };
    }
    
    // Б) Проверка через Groq AI
    try {
        const promptText = `Analyze article for "School Press" (academic portal). 
        Title: ${title}. Content: ${content}. 
        Check for: toxicity, spam, non-academic content. 
        Respond ONLY JSON: {"isValid": boolean, "reason": "string"}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: promptText }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        console.warn("AI offline, passing to manual mode.");
        return { isValid: true, reason: "Local bypass" };
    }
}

// --- 4. ПУБЛИКАЦИЯ (ДЛЯ editor.html) ---

async function publishArticle() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const category = document.getElementById('post-category').value;
    const btn = document.getElementById('publish-btn');

    if (!title || !content) return alert("Fill all fields.");

    btn.disabled = true;
    btn.innerText = "Neural Scanning...";

    const moderation = await moderateArticle(title, content);

    if (!moderation.isValid) {
        alert(`PROTOCOL ERROR: ${moderation.reason}`);
        btn.disabled = false;
        btn.innerText = "Publish";
        return;
    }

    const newArticle = {
        id: Date.now(),
        title,
        content,
        category,
        author: localStorage.getItem("userNick") || "Guest",
        views: 0,
        likes: 0,
        date: new Date().toISOString()
    };

    const articles = getArticles();
    articles.unshift(newArticle);
    saveArticles(articles);

    window.location.href = 'index.html';
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', checkAuth);
