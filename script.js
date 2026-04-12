// --- КОНФИГУРАЦИЯ ---
const GROQ_API_KEY = "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";
const getArticles = () => JSON.parse(localStorage.getItem("articles") || "[]");
const saveArticles = (articles) => localStorage.setItem("articles", JSON.stringify(articles));

// --- 1. АВТОРИЗАЦИЯ И РОЛИ ---
const ADMINS = ['daniil.derzhakov@alu.escuelassj.com'];

function getUserRole() {
    const email = localStorage.getItem("userEmail");
    if (ADMINS.includes(email)) return 'ADMIN';
    return 'USER';
}

function handleAuthClick() {
    const email = prompt("Corporate Email (@alu.escuelassj.com):");
    if (!email) return;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@alu.escuelassj\.com$/;
    if (!emailRegex.test(email.toLowerCase())) {
        alert("ACCESS DENIED: Internal domain @escuelassj.com required.");
        return;
    }

    const nick = prompt("Professional Nickname (min 3 chars):");
    if (!nick || nick.length < 3) return alert("INVALID NICKNAME");

    localStorage.setItem("userEmail", email.toLowerCase());
    localStorage.setItem("userNick", nick.trim().replace(/[^a-zA-Z0-9_]/g, ''));
    location.reload();
}

function checkAuth() {
    const nick = localStorage.getItem("userNick");
    const loginBtn = document.getElementById('login-btn');
    const userControls = document.getElementById('user-controls');
    const userDisplay = document.getElementById('user-display');

    if (nick) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userControls) userControls.style.display = "flex";
        if (userDisplay) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${nick}&background=2563eb&color=fff&bold=true`;
            userDisplay.innerHTML = `<img src="${avatarUrl}" alt="Profile" style="width:100%; border-radius:50%">`;
        }
    }
}

function handleLogout() {
    if (confirm("Terminate session?")) {
        localStorage.clear();
        location.href = 'index.html';
    }
}

// --- 2. ПРОФЕССИОНАЛЬНЫЙ РЕДАКТОР (EDITOR) ---

// Форматирование + фокус
function format(cmd, val = null) {
    document.execCommand(cmd, false, val);
    const content = document.getElementById('content');
    if (content) {
        content.focus();
        updateToolbarStatus();
    }
}

// Подсветка активных кнопок (Bold, Italic...)
function updateToolbarStatus() {
    const checkState = (id, cmd) => {
        const btn = document.getElementById(id);
        if (btn) {
            document.queryCommandState(cmd) 
                ? btn.classList.add('active') 
                : btn.classList.remove('active');
        }
    };
    checkState('btn-bold', 'bold');
    checkState('id-italic', 'italic');
    checkState('id-underline', 'underline');
}

// Вставка изображений (дизайн)
function insertImageToEditor(src) {
    const imgHtml = `<br><img src="${src}" class="editor-img" style="max-width:100%; border-radius:12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); margin: 20px 0;"><br>`;
    document.execCommand('insertHTML', false, imgHtml);
}

// Загрузка с ПК
function handleFileUpload(files) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => insertImageToEditor(e.target.result);
        reader.readAsDataURL(file);
    }
}

// Обработка CTRL+V (Картинки из буфера)
function setupPasteHandler() {
    const content = document.getElementById('content');
    if (!content) return;

    content.addEventListener('paste', (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.kind === 'file') {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => insertImageToEditor(event.target.result);
                reader.readAsDataURL(blob);
            }
        }
    });

    // Слушатели для обновления кнопок
    content.addEventListener('keyup', updateToolbarStatus);
    content.addEventListener('mouseup', updateToolbarStatus);
}

// Вставка ссылок
function insertLink() {
    const url = prompt("Enter link (https://...):");
    if (url) format('createLink', url);
}

// --- 3. ПУБЛИКАЦИЯ И МОДЕРАЦИЯ ---

async function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').innerHTML;
    const category = document.getElementById('category-select').value;
    const nick = localStorage.getItem("userNick");

    if (!nick) return alert("Please login first!");
    if (!title || title.length < 5) return alert("Title is too short!");

    // Индикация загрузки на кнопке
    const pubBtn = document.querySelector('.btn-primary');
    pubBtn.innerText = "Analyzing...";
    pubBtn.disabled = true;

    // AI Модерация
    const aiResult = await moderateWithAI(title, content);
    
    if (!aiResult.isValid) {
        alert(`REJECTED: ${aiResult.reason}`);
        pubBtn.innerText = "Publish";
        pubBtn.disabled = false;
        return;
    }

    const articles = getArticles();
    const newArt = {
        id: Date.now(),
        title,
        content,
        category,
        author: nick,
        date: new Date().toLocaleDateString('en-GB'),
        views: 0,
        likes: 0
    };

    articles.unshift(newArt);
    saveArticles(articles);
    location.href = 'index.html';
}

async function moderateWithAI(title, content) {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ 
                    role: "user", 
                    content: `Is this article for school safe? Title: ${title}. Content: ${content}. Return ONLY JSON: {"isValid": boolean, "reason": "string"}` 
                }],
                response_format: { type: "json_object" }
            })
        });
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (e) {
        return { isValid: true, reason: "Offline skip" };
    }
}

// --- 4. ВЗАИМОДЕЙСТВИЕ (FEED) ---

function handleCardClick(event, id) {
    if (event.target.closest('.like-btn')) {
        addLike(id);
        return;
    }
    addView(id);
    window.location.href = `article.html?id=${id}`;
}

function addLike(id) {
    let articles = getArticles();
    const idx = articles.findIndex(a => a.id == id);
    if (idx !== -1) {
        articles[idx].likes = (articles[idx].likes || 0) + 1;
        saveArticles(articles);
        if (window.displayArticles) displayArticles();
    }
}

function addView(id) {
    let articles = getArticles();
    const idx = articles.findIndex(a => a.id == id);
    if (idx !== -1) {
        articles[idx].views = (articles[idx].views || 0) + 1;
        saveArticles(articles);
    }
}

function deleteArticle(id) {
    const articles = getArticles();
    const art = articles.find(a => a.id == id);
    const role = getUserRole();
    const nick = localStorage.getItem("userNick");

    if (role === 'ADMIN' || (art && art.author === nick)) {
        if (confirm("Delete this intelligence report?")) {
            saveArticles(articles.filter(a => a.id != id));
            location.reload();
        }
    } else {
        alert("Access Denied.");
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupPasteHandler();
});
