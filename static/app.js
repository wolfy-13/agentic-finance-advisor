const API = "";
function animateValue(elementId, endValue, prefix = "", suffix = "", duration = 800) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const startValue = 0;
    const startTime = performance.now();

    function update(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(startValue + (endValue - startValue) * progress);
        el.innerText = `${prefix}${current}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
/* =========================
NAVIGATION
========================= */
function go(page) {
    if (page === "login.html") {
        window.location.href = "/";
    } else if (page === "signup.html") {
        window.location.href = "/signup";                       
    } else if (page === "dashboard.html") {
        window.location.href = "/dashboard";
    } else {                             
    }
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "/";
}

function checkAuth() {
    const user = localStorage.getItem("user");
    if (!user) {
        window.location.href = "/";
    }
}

function setLoggedInUser() {
    const user = localStorage.getItem("user");
    const el = document.getElementById("loggedUser");
    if (el && user) {
        el.innerText = user;
    }
}

/* =========================
SIGNUP
========================= */
async function signup() {
    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const confirmEl = document.getElementById("confirm");
    const errorEl = document.getElementById("signupError");
    const btn = document.getElementById("signupBtn");

    const userInput = usernameEl || emailEl;

    if (!userInput || !passwordEl) {
        console.error("Signup inputs not found");
        return;
    }

    const user = userInput.value.trim();
    const pass = passwordEl.value.trim();
    const confirm = confirmEl ? confirmEl.value.trim() : pass;

    if (errorEl) errorEl.innerText = "";

    if (user.length < 3) {
        if (errorEl) errorEl.innerText = "Username must be at least 3 characters";
        return;
    }

    if (pass.length < 6) {
        if (errorEl) errorEl.innerText = "Password must be at least 6 characters";
        return;
    }

    if (pass !== confirm) {
        if (errorEl) errorEl.innerText = "Passwords do not match";
        return;
    }

    if (btn) {
        btn.innerText = "Creating...";
        btn.disabled = true;
    }

    try {
        const res = await fetch(`${API}/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("Account created successfully");
            window.location.href = "/";
        } else {
            if (errorEl) errorEl.innerText = "User already exists";
        }
    } catch (e) {
        console.error(e);
        if (errorEl) errorEl.innerText = "Server error";
    } finally {
        if (btn) {
            btn.innerText = "Create account";
            btn.disabled = false;
        }
    }
}

async function register() {
    await signup();
}

/* =========================
LOGIN
========================= */
async function login() {
    const usernameEl = document.getElementById("username");
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const errorEl = document.getElementById("loginError") || document.getElementById("signupError");
    const btn = document.getElementById("loginBtn");

    const userInput = usernameEl || emailEl;

    if (!userInput || !passwordEl) {
        console.error("Login inputs not found");
        return;
    }

    const user = userInput.value.trim();
    const pass = passwordEl.value.trim();

    if (errorEl) errorEl.innerText = "";

    if (!user || !pass) {
        if (errorEl) errorEl.innerText = "Enter username and password";
        return;
    }

    if (btn) {
        btn.innerText = "Signing in...";
        btn.disabled = true;
    }

    try {
        const res = await fetch(`${API}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("user", user);
            window.location.href = "/dashboard";
        } else {
            if (errorEl) errorEl.innerText = "Invalid username or password";
        }
    } catch (e) {
        console.error(e);
        if (errorEl) errorEl.innerText = "Server error";
    } finally {
        if (btn) {
            btn.innerText = "Login";
            btn.disabled = false;
        }
    }
}

/* =========================
EXPENSES
========================= */
let allExpenses = [];

async function load() {
    const user = localStorage.getItem("user") || "demo";
    loadProfileCard();

    try {
        const res = await fetch(`${API}/expenses/${user}`);
        const data = await res.json();

        allExpenses = Array.isArray(data) ? data : [];

        renderExpenses(allExpenses);
        updateExpenseSummary(allExpenses);
    } catch (err) {
        console.error("Expense load error:", err);
    }
}

function renderExpenses(data) {
    const list = document.getElementById("list");
    if (!list) return;

    if (list.tagName.toLowerCase() === "tbody") {
        list.innerHTML = "";

        if (data.length === 0) {
            list.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center;color:#94a3b8;padding:24px;">
                        No expenses added yet.
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(e => {
            list.innerHTML += `
                <tr>
                    <td>${e.date || "-"}</td>
                    <td>${e.category || "-"}</td>
                    <td>₹${Number(e.amount || 0)}</td>
                    <td>${e.description || "-"}</td>
                </tr>
            `;
        });
    } else {
        list.innerHTML = "";
        data.forEach(e => {
            list.innerHTML += `
                <li>${e.category} ₹${e.amount} <small>${e.date || ""}</small></li>
            `;
        });
    }
}

function updateExpenseSummary(data) {
    let total = 0;
    let categoryMap = {};

    data.forEach(e => {
        const amt = Number(e.amount || 0);
        total += amt;
        categoryMap[e.category] = (categoryMap[e.category] || 0) + amt;
    });
    const balanceEl = document.getElementById("availableBalance");
if(balanceEl){
    balanceEl.innerText = `₹${Math.max(0, 50000 - total)}`;
    if (totalEl) animateValue("totalExpenseValue", total, "₹");
if (countEl) animateValue("expenseCountValue", data.length);
if (topCatEl) topCatEl.innerText = topCategory;
}

    let topCategory = "-";
    let max = 0;

    for (const key in categoryMap) {
        if (categoryMap[key] > max) {
            max = categoryMap[key];
            topCategory = key;
        }
    }

    const totalEl = document.getElementById("totalExpenseValue");
    const topCatEl = document.getElementById("topCategoryValue");
    const countEl = document.getElementById("expenseCountValue");

    if (totalEl) totalEl.innerText = `₹${total}`;
    if (topCatEl) topCatEl.innerText = topCategory;
    if (countEl) countEl.innerText = data.length;
}

async function addExpense() {
    const user = localStorage.getItem("user") || "demo";
    showToast(`Expense added: ₹${expense.amount} for ${expense.category}`);

    const expense = {
        date: document.getElementById("date")?.value || "",
        category: document.getElementById("category")?.value || "",
        amount: Number(document.getElementById("amount")?.value || 0),
        description: document.getElementById("desc")?.value || ""
    };

    if (!expense.date || !expense.amount) {
        alert("Please fill date and amount");
        return;
    }

    try {
        await fetch(`${API}/add_expense/${user}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        if (document.getElementById("date")) document.getElementById("date").value = "";
        if (document.getElementById("amount")) document.getElementById("amount").value = "";
        if (document.getElementById("desc")) document.getElementById("desc").value = "";
        if (document.getElementById("category")) document.getElementById("category").value = "Food";

        load();
    } catch (err) {
        console.error("Add expense error:", err);
    }
}

function filterExpenses() {
    const search = document.getElementById("expenseSearch");
    if (!search) return;

    const keyword = search.value.toLowerCase();

    const filtered = allExpenses.filter(e =>
        (e.category || "").toLowerCase().includes(keyword) ||
        (e.description || "").toLowerCase().includes(keyword) ||
        (e.date || "").toLowerCase().includes(keyword)
    );

    renderExpenses(filtered);
    updateExpenseSummary(filtered);
}

/* =========================
AI CHAT
========================= */
function quickAsk(text) {
    const input = document.getElementById("userInput");
    if (!input) return;
    input.value = text;
    sendMessage();
}

function appendMessage(role, text) {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return;

    const div = document.createElement("div");
    div.className = `chat-bubble ${role}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendTyping() {
    const chatBox = document.getElementById("chatBox");
    if (!chatBox) return null;

    const div = document.createElement("div");
    div.className = "chat-bubble bot";
    div.id = "typingBubble";
    div.innerHTML = `
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const btn = document.getElementById("sendBtn");
    const chatBox = document.getElementById("chatBox");

    if (!input || !btn || !chatBox) return;

    const message = input.value.trim();
    if (!message) return;

    appendMessage("user", message);
    input.value = "";
    btn.disabled = true;
    btn.innerText = "Searching...";

    const typing = appendTyping();

    try {
        const user = localStorage.getItem("user") || "demo";

        const expenseRes = await fetch(`${API}/expenses/${user}`);
        const expenses = await expenseRes.json();

        const aiRes = await fetch(`${API}/ai_chat/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message,
                expenses
            })
        });

        const data = await aiRes.json();

        if (typing) typing.remove();
        appendMessage("bot", data.reply || "No response received.");
    } catch (err) {
        if (typing) typing.remove();
        appendMessage("bot", "Something went wrong while contacting the AI service.");
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerText = "Search";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userInput");
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
});
function loadProfileCard() {
    const user = localStorage.getItem("user") || "User";

    const profileName = document.getElementById("profileName");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileEmail = document.getElementById("profileEmail");

    if (profileName) profileName.innerText = user;
    if (profileAvatar) profileAvatar.innerText = user.charAt(0).toUpperCase();
    if (profileEmail) profileEmail.innerText = `${user} • Smart financial overview`;
}
function showToast(message) {
    let toast = document.getElementById("appToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }

    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}