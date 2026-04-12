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

function publishArticle() {
    const titleVal = document.getElementById('title').value;
    const contentVal = document.getElementById('content').innerHTML;
    // ВАЖНО: Проверь, чтобы в HTML был id="category-select"
    const categoryVal = document.getElementById('category-select').value; 

    if (!titleVal || titleVal.trim() === "") {
        alert("Enter title!");
        return;
    }

    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    const newArt = {
        id: Date.now(),
        title: titleVal,
        content: contentVal,
        category: categoryVal,
        author: localStorage.getItem("userNick"),
        date: new Date().toLocaleDateString(),
        views: 0,
        likes: 0
    };

    articles.unshift(newArt);
    localStorage.setItem("articles", JSON.stringify(articles));
    location.href = 'index.html';
}
// Список привилегированных почт
const ADMINS = ['daniil.derzhakov@alu.escuelassj.com'];
const MODERATORS = ['daniil.derzhakov@alu.escuelassj.com'];

function getUserRole() {
    const email = localStorage.getItem("userEmail");
    if (ADMINS.includes(email)) return 'ADMIN';
    if (MODERATORS.includes(email)) return 'MODERATOR';
    return 'USER';
}

// Улучшенная функция удаления (вызывай её в профиле или на главной)
function deleteArticle(id) {
    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    const article = articles.find(a => a.id === id);
    const currentUser = localStorage.getItem("userNick");
    const role = getUserRole();

    // Проверка прав: автор ИЛИ админ ИЛИ модератор
    if (article.author === currentUser || role === 'ADMIN' || role === 'MODERATOR') {
        if (confirm(`Action authorized for ${role}. Delete this report?`)) {
            const updated = articles.filter(a => a.id !== id);
            localStorage.setItem("articles", JSON.stringify(updated));
            location.reload();
        }
    } else {
        alert("Access Denied: You don't have permission to delete this report.");
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', checkAuth);
