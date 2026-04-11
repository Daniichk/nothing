// --- ХРАНИЛИЩЕ ДАННЫХ ---
const getArticles = () => JSON.parse(localStorage.getItem("articles") || "[]");
const saveArticles = (articles) => localStorage.setItem("articles", JSON.stringify(articles));

// --- ЛАЙКИ И ПРОСМОТРЫ (WIRES) ---
function addLike(id) {
    let articles = getArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index !== -1) {
        if (!articles[index].likes) articles[index].likes = 0;
        articles[index].likes++;
        saveArticles(articles);
        displayArticles(); // Обновить главную
    }
}

function addView(id) {
    let articles = getArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index !== -1) {
        if (!articles[index].views) articles[index].views = 0;
        articles[index].views++;
        saveArticles(articles);
    }
}

// --- АВТОРИЗАЦИЯ ---
function handleAuthClick() {
    const email = prompt("Enter @://escuelassj.com email:");
    if (!email || !email.endsWith("@://escuelassj.com")) return alert("School domain required!");
    
    const nick = prompt("Professional Nickname:");
    if (!nick || nick.length < 3) return alert("Invalid nickname.");

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userNick", nick);
    location.reload();
}

function checkAuth() {
    const nick = localStorage.getItem("userNick");
    if (nick) {
        document.getElementById('login-btn').style.display = "none";
        const display = document.getElementById('user-display');
        display.innerText = `@${nick}`;
        display.style.display = "flex";
        document.getElementById('write-btn').style.display = "flex";
    }
}
