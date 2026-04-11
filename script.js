// --- АВТОРИЗАЦИЯ И ПРОВЕРКА ПОЧТЫ ---
function handleAuthClick() {
    const email = prompt("Enter your school Gmail (@alu.escuelassj.com):");
    
    if (!email) return;

    // 1. Проверка домена
    if (!email.endsWith("@alu.escuelassj.com")) {
        alert("Access Denied: Only @alu.escuelassj.com emails allowed.");
        return;
    }

    // 2. Проверка: не занята ли эта почта уже в системе
    const existingUser = localStorage.getItem("userEmail");
    if (existingUser && existingUser !== email) {
        alert("Another account is already active in this browser. Please log out first.");
        return;
    }

    const nick = prompt("Choose your professional nickname:");
    // Проверка ника от спама типа 67 6767
    if (!nick || nick.length < 3 || (nick.replace(/\D/g, "").length / nick.length > 0.5)) {
        alert("Invalid Nickname! Use letters and more than 3 characters.");
        return;
    }

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userNick", nick);
    location.reload();
}

function checkAuth() {
    const nick = localStorage.getItem("userNick");
    const loginBtn = document.getElementById('login-btn');
    const userDisplay = document.getElementById('user-display');
    const writeBtn = document.getElementById('write-btn');

    if (nick) {
        if (loginBtn) loginBtn.style.display = "none";
        if (userDisplay) {
            userDisplay.innerText = `@${nick}`;
            userDisplay.style.display = "inline-block";
        }
        if (writeBtn) writeBtn.style.display = "inline-block";
    }
}

// --- ФУНКЦИЯ ПУБЛИКАЦИИ ---
function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').innerText;
    const category = document.getElementById('category').value;
    const author = localStorage.getItem("userNick");

    if (title.length < 5) return alert("Title is too short!");

    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    articles.unshift({
        id: Date.now(),
        title, content, category, author,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem("articles", JSON.stringify(articles));
    
    // Уведомление о новом посте
    localStorage.setItem("new_post_alert", `New article in ${category} by @${author}!`);
    
    location.href = 'index.html';
}
