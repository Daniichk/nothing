// --- MODERATION ---
function validateText(text, type = "content") {
    if (text.length < 3) return "Too short!";
    const digits = text.replace(/\D/g, "").length;
    if (digits / text.length > 0.5) return "Too many numbers! Use letters.";
    if (/(.)\1{4,}/.test(text)) return "Spam detected!";
    return null;
}

// --- AUTH & NICKNAME ---
function setupProfile() {
    const email = prompt("Enter school email (@alu.escuelassj.com):");
    if (!email || !email.endsWith("@alu.escuelassj.com")) return alert("Wrong domain!");

    const nick = prompt("Choose a nickname (Moderated):");
    const error = validateText(nick, "nickname");
    if (error) return alert("Nickname Error: " + error);

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
        display.style.display = "inline";
        document.getElementById('write-btn').style.display = "inline-block";
    }
}

// --- ARTICLES ---
function formatDoc(cmd) { document.execCommand(cmd, false, null); }

function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').innerHTML; // HTML из редактора
    const icon = document.getElementById('icon').value || "📄";
    const category = document.getElementById('category').value;

    const error = validateText(title) || validateText(document.getElementById('content').innerText);
    if (error) {
        document.getElementById('status-msg').innerText = error;
        return;
    }

    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    articles.unshift({
        id: Date.now(),
        title, content, icon, category,
        author: localStorage.getItem("userNick"),
        authorEmail: localStorage.getItem("userEmail"),
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem("articles", JSON.stringify(articles));
    location.href = 'index.html';
}

function displayArticles(filter = 'All') {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;
    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter);

    grid.innerHTML = filtered.map(art => `
        <div class="cube-card">
            <div class="card-icon">${art.icon}</div>
            <span class="tag">${art.category}</span>
            <h3>${art.title}</h3>
            <p>${art.content.substring(0, 60).replace(/<[^>]*>/g, '')}...</p>
            <div class="card-footer">
                <span onclick="event.stopPropagation(); followUser('${art.author}')" class="follow-link">Follow</span>
                <strong>@${art.author}</strong>
            </div>
        </div>
    `).join('');
}

function followUser(nick) {
    let following = JSON.parse(localStorage.getItem("following") || "[]");
    if (!following.includes(nick)) {
        following.push(nick);
        localStorage.setItem("following", JSON.stringify(following));
        alert(`You are now following @${nick}`);
    }
}
