const PASSWORD_HASH = "5b05b73fc9f9ed6413a5d8d94d4a4416eb099bc914f09651190a612ee4d168e5";

const loginDiv = document.getElementById("login");
const contentDiv = document.getElementById("content");
const pwInput = document.getElementById("pw");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("error");

// Password login
loginBtn.addEventListener("click", checkPassword);
pwInput.addEventListener("keyup", e => {
  if (e.key === "Enter") checkPassword();
});

async function checkPassword() {
  const entered = pwInput.value;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(entered))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join(""));
  if (hash === PASSWORD_HASH) {
    loginDiv.style.display = "none";
    contentDiv.style.display = "block";
    pwInput.value = "";
    errorMsg.style.display = "none";
    resetLockTimer();
    loadTemplates();
  } else {
    errorMsg.style.display = "block";
    pwInput.value = "";
  }
}

// ----- LOAD TEMPLATES FROM JSON -----
const list = document.getElementById("templateList");
const title = document.getElementById("templateTitle");
const content = document.getElementById("templateContent");
const copyBtn = document.getElementById("copyBtn");
const search = document.getElementById("search");

let templates = {}; // key = filename, value = template content

async function loadTemplates() {
  const indexResp = await fetch('templates/index.json');
  const files = await indexResp.json();

  for (const file of files) {
    const resp = await fetch(`templates/${file}`);
    const text = await resp.text();
    templates[file] = text; // only content

    // Sidebar shows filename as title
    const li = document.createElement('li');
    li.dataset.id = file;
    li.textContent = file.replace('.txt','').replace(/_/g,' ');
    list.appendChild(li);
  }
}

// ----- TEMPLATE SELECTION -----
list.addEventListener("click", e => {
  if (e.target.tagName !== "LI") return;
  document.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  e.target.classList.add("active");
  title.innerText = e.target.textContent; // display file name
  content.innerText = templates[e.target.dataset.id]; // copy only content
});

// ----- COPY BUTTON -----
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(content.innerText);
  copyBtn.innerText = "Copied!";
  setTimeout(() => copyBtn.innerText = "📋 Copy", 1000);
});

// ----- SEARCH -----
search.addEventListener("input", () => {
  const q = search.value.toLowerCase();
  document.querySelectorAll("#templateList li").forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
  });
});

// ----- AUTO-LOCK 5 MINUTES -----
let lockTimer;
function resetLockTimer() {
  clearTimeout(lockTimer);
  lockTimer = setTimeout(() => location.reload(), 1*60*1000);
}
["click","keydown","mousemove"].forEach(e => document.addEventListener(e, resetLockTimer));
