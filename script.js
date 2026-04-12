// --- КОНФИГУРАЦИЯ ---
const GROQ_API_KEY = "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";
const getArticles = () => JSON.parse(localStorage.getItem("articles") || "[]");
const saveArticles = (articles) => localStorage.setItem("articles", JSON.stringify(articles));
const ADMINS = ['daniil.derzhakov@alu.escuelassj.com'];

// --- 1. АВТОРИЗАЦИЯ ---
function checkAuth() {
    const nick = localStorage.getItem("userNick");
    const userControls = document.getElementById('user-controls');
    const userDisplay = document.getElementById('user-display');

    if (nick) {
        if (userControls) userControls.style.display = "flex";
        if (userDisplay) {
            const avatarUrl = `https://ui-avatars.com/api/?name=${nick}&background=2563eb&color=fff&bold=true`;
            userDisplay.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width:32px; border-radius:50%">`;
        }
    }
}

// --- 2. РЕДАКТОР (ФУНКЦИИ) ---
function format(cmd, val = null) {
    document.execCommand(cmd, false, val);
    updateToolbarStatus();
}

// Подсветка активных кнопок
function updateToolbarStatus() {
    const check = (id, cmd) => {
        const el = document.getElementById(id);
        if (el) {
            document.queryCommandState(cmd) ? el.classList.add('active') : el.classList.remove('active');
        }
    };
    check('btn-bold', 'bold');
    check('id-italic', 'italic');
    check('id-underline', 'underline');
}

// Работа с изображениями
function insertImageToEditor(src) {
    const imgHtml = `<img src="${src}" style="max-width:100%; border-radius:12px; margin: 15px 0; display:block;">`;
    document.execCommand('insertHTML', false, imgHtml);
}

function handleFileUpload(files) {
    if (files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => insertImageToEditor(e.target.result);
        reader.readAsDataURL(files[0]);
    }
}

// --- 3. ПУБЛИКАЦИЯ ---
async function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').innerHTML;
    const category = document.getElementById('category-select').value;
    const nick = localStorage.getItem("userNick");

    if (!title || title.length < 5) return alert("Title too short!");
    
    const articles = getArticles();
    articles.unshift({
        id: Date.now(),
        title, content, category,
        author: nick || "Anonymous",
        date: new Date().toLocaleDateString(),
        views: 0, likes: 0
    });
    
    saveArticles(articles);
    location.href = 'index.html';
}

// --- 4. ОБРАБОТКА ПАСТЫ (CTRL+V) ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    const editor = document.getElementById('content');
    if (editor) {
        editor.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.kind === 'file') {
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (ev) => insertImageToEditor(ev.target.result);
                    reader.readAsDataURL(blob);
                }
            }
        });
        editor.addEventListener('keyup', updateToolbarStatus);
        editor.addEventListener('mouseup', updateToolbarStatus);
    }
});
