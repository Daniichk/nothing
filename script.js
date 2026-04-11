// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem("userEmail");
    if (user) {
        document.getElementById('login-btn').style.display = "none";
        document.getElementById('user-display').innerText = user;
        document.getElementById('user-display').style.display = "inline";
        document.getElementById('write-btn').style.display = "inline-block";
    }
}

// Simple Login Simulation (Requires @://escuelassj.com)
function login() {
    const email = prompt("Enter your school email:");
    if (email && email.endsWith("@alu.escuelassj.com")) {
        localStorage.setItem("userEmail", email);
        location.reload();
    } else {
        alert("Access denied! Use your @alu.escuelassj.com email.");
    }
}

// Moderation Logic
function validateArticle(title, content) {
    if (title.length < 5) return "Title is too short!";
    if (content.length < 20) return "Article content is too short!";
    
    // Check for spam like "67 6767" (Ratio of digits)
    const digits = content.replace(/\D/g, "").length;
    if (digits / content.length > 0.4) return "Error: Too many numbers. Use words!";

    // Check for repeated characters (aaaaa)
    if (/(.)\1{5,}/.test(content)) return "Spam detected (repeated characters).";

    return null; // OK
}

function publishArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const status = document.getElementById('status-msg');

    const error = validateArticle(title, content);
    if (error) {
        status.innerText = error;
        status.style.color = "red";
        return;
    }

    // Save to LocalStorage (Global for this browser session)
    const articles = JSON.parse(localStorage.getItem("articles") || "[]");
    articles.unshift({ 
        title, 
        content, 
        author: localStorage.getItem("userEmail"),
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem("articles", JSON.stringify(articles));

    alert("Published successfully!");
    location.href = 'index.html';
}

function displayArticles() {
    const feed = document.getElementById('articles-feed');
    const articles = JSON.parse(localStorage.getItem("articles") || "[]");

    if (articles.length === 0) {
        feed.innerHTML = "<p>No articles yet. Be the first to write!</p>";
        return;
    }

    feed.innerHTML = articles.map(art => `
        <div class="article-card">
            <h3>${art.title}</h3>
            <p>${art.content}</p>
            <div class="meta">By: ${art.author} | ${art.date}</div>
        </div>
    `).join('');
}
