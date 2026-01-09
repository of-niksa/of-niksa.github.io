const PASSWORD_HASH = "5b05b73fc9f9ed6413a5d8d94d4a4416eb099bc914f09651190a612ee4d168e5";

/* Login */
const login = document.getElementById("login");
const content = document.getElementById("content");
const pw = document.getElementById("pw");
const error = document.getElementById("error");

document.getElementById("loginBtn").onclick = checkPassword;
pw.onkeyup = e => e.key === "Enter" && checkPassword();

async function checkPassword() {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw.value))
    .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,"0")).join(""));
  if (hash === PASSWORD_HASH) {
    login.style.display = "none";
    content.style.display = "block";
    loadTemplates();
    resetLock();
  } else {
    error.style.display = "block";
    pw.value = "";
  }
}

/* Templates */
const list = document.getElementById("templateList");
const title = document.getElementById("templateTitle");
const contentBox = document.getElementById("templateContent");
const imagesBox = document.getElementById("templateImages");

const templates = {};

async function loadTemplates() {
  const files = await fetch("templates/index.json").then(r => r.json());
  for (const f of files) {
    templates[f] = await fetch(`templates/${f}`).then(r => r.text());

    const li = document.createElement("li");
    li.textContent = f.replace(".txt","").replace(/_/g," ");
    li.onclick = () => showTemplate(f, li);
    list.appendChild(li);
  }
}

function showTemplate(file, li) {
  document.querySelectorAll("li").forEach(x => x.classList.remove("active"));
  li.classList.add("active");

  title.innerText = li.textContent;
  contentBox.innerText = templates[file];
  imagesBox.innerHTML = "";

  const base = file.replace(".txt","");
  loadImage(base);
}

/* Auto-load images */
function loadImage(baseName) {
  const imgPath = `templates/images/${baseName}.png`;
  const img = new Image();

  img.onload = () => {
    imagesBox.appendChild(img);
  };

  // Do NOT assign onerror → prevents console spam
  img.src = imgPath;
}


/* Copy */
document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(contentBox.innerText);
  copyBtn.innerText = "Copied!";
  setTimeout(() => copyBtn.innerText = "📋 Copy", 1000);
};

/* Search */
document.getElementById("search").oninput = e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll("#templateList li").forEach(li => {
    li.style.display = li.textContent.toLowerCase().includes(q) ? "" : "none";
  });
};

/* Auto-lock */
let lock;
function resetLock() {
  clearTimeout(lock);
  lock = setTimeout(() => location.reload(), 3*60*1000);
}
["mousemove","keydown","click"].forEach(e => document.addEventListener(e, resetLock));
