// --- SUBJECTS FROM YOUR IMAGE ---
const SCHOOL_SUBJECTS = ["MATS", "INGL", "FyQ", "LcyL", "EF", "MUS", "VAL", "ABSR", "EDPyV"];

// --- MODERATION & AUTH ---
function setupProfile() {
    const email = prompt("School Email:");
    if (!email || !email.endsWith("@alu.escuelassj.com")) return alert("School domain required!");
    const nick = prompt("Choose Nickname:");
    if (!nick || nick.length < 3 || (nick.replace(/\D/g, "").length / nick.length > 0.5)) return alert("Invalid Nickname!");

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userNick", nick);
    location.reload();
}

// --- ARTICLE LOGIC ---
function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').innerHTML;
    const category = document.getElementById('category').value;
    const author = localStorage.getItem("userNick");

    if (title.length < 5) return alert("Title too short");

    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    const newArticle = {
        id: Date.now(),
        title, content, category, author,
        date: new Date().toLocaleString()
    };
    
    articles.unshift(newArticle);
    localStorage.setItem("articles", JSON.stringify(articles));

    // Handle Notifications for followers
    sendNotification(author, title);
    
    location.href = 'index.html';
}

function deleteArticle(id) {
    if (!confirm("Delete this article?")) return;
    let articles = JSON.parse(localStorage.getItem("articles") || "[]");
    articles = articles.filter(a => a.id !== id);
    localStorage.setItem("articles", JSON.stringify(articles));
    displayArticles();
}

// --- NOTIFICATIONS ---
function sendNotification(author, title) {
    const followers = JSON.parse(localStorage.getItem("followers_of_" + author) || "[]");
    // In a real app, this would push to those users. 
    // Here we simulate by flagging a global "new post" for everyone else.
    localStorage.setItem("new_post_alert", `New from @${author}: ${title}`);
}

function checkNotifications() {
    const alertMsg = localStorage.getItem("new_post_alert");
    if (alertMsg) {
        document.getElementById('notif-dot').style.display = "block";
        document.getElementById('notif-bell').title = alertMsg;
    }
}

// --- DISPLAY ---
function displayArticles(filter = 'All') {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;
    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    const currentUser = localStorage.getItem("userNick");

    grid.innerHTML = articles
        .filter(a => filter === 'All' || a.category === filter)
        .map(art => `
        <div class="cube-card">
            <div class="tag">${art.category}</div>
            <h3>${art.title}</h3>
            <p>${art.content.substring(0, 100).replace(/<[^>]*>/g, '')}...</p>
            <div style="display:flex; align-items:center; margin-top:auto;">
                <small>By <b>@${art.author}</b></small>
                ${art.author === currentUser ? `<button class="delete-btn" onclick="deleteArticle(${art.id})">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}
