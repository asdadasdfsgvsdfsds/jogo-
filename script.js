// Sistema de Login/Registro
function applyTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark-mode', theme === 'dark');
}

function toggleTheme() {
  const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme();
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
}

function isLoggedIn() {
  return localStorage.getItem('loggedIn') === 'true';
}

function getCurrentUsername() {
  return localStorage.getItem('currentUser');
}

// Autenticação
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <h2>Login</h2>
      <input type="text" id="loginUsername" placeholder="Usuário" required>
      <input type="password" id="loginPassword" placeholder="Senha" required>
      <button onclick="login()">Entrar</button>
      <button class="toggle-btn" onclick="renderRegister()">Cadastrar-se</button>
    </div>
  `;
  applyTheme();
}

function renderRegister() {
  document.getElementById('app').innerHTML = `
    <div class="auth-container">
      <h2>Cadastro</h2>
      <input type="text" id="registerUsername" placeholder="Novo usuário" required>
      <input type="password" id="registerPassword" placeholder="Nova senha" required>
      <button onclick="register()">Cadastrar</button>
      <button class="toggle-btn" onclick="renderLogin()">Voltar ao Login</button>
    </div>
  `;
  applyTheme();
}

function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  if (!username || !password) { alert('Preencha todos os campos!'); return; }
  const users = getUsers();
  if (users.some(u => u.username === username)) {
    alert('Usuário já existe!');
  } else {
    saveUser({ username, password });
    alert('Cadastro realizado com sucesso!');
    renderLogin();
  }
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const users = getUsers();
  const validUser = users.find(u => u.username === username && u.password === password);
  if (validUser) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('currentUser', username);
    renderNotebookApp();
  } else {
    alert('Usuário ou senha incorretos!');
  }
}

function logout() {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('currentUser');
  renderLogin();
}

// Sistema de Notas
let notes = [];

function getUserNotesKey() {
  return `notes_${getCurrentUsername()}`;
}

function loadNotes() {
  return JSON.parse(localStorage.getItem(getUserNotesKey())) || [];
}

function saveNotes() {
  localStorage.setItem(getUserNotesKey(), JSON.stringify(notes));
}

function createNewNote() {
  notes.push({ id: Date.now(), title: '', content: '', lastEdited: Date.now() });
  saveNotes();
  renderNotes();
}

function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function createVideoNote() {
  const url = prompt('Cole o link do vídeo do YouTube:');
  if (!url) return;
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    notes.push({ id: Date.now(), videoUrl: `https://www.youtube.com/embed/${videoId}`, lastEdited: Date.now() });
    saveNotes();
    renderNotes();
  } else {
    alert('Link inválido de YouTube.');
  }
}

function createPdfNote() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/pdf';
  
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const pdfData = e.target.result;
        notes.push({
          id: Date.now(),
          type: 'pdf',
          pdfUrl: pdfData,
          title: file.name,
          lastEdited: Date.now()
        });
        saveNotes();
        renderNotes();
      };
      reader.readAsDataURL(file);
    }
  };
  
  input.click();
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  saveNotes();
  renderNotes();
}

function updateNote(id, field, value) {
  const note = notes.find(n => n.id === id);
  if (note) {
    note[field] = value;
    note.lastEdited = Date.now();
    saveNotes();
  }
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleString('pt-BR');
}

// Voz
function startVoiceInput(noteId) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { alert('Reconhecimento de voz não suportado neste navegador'); return; }
  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.start();
  recognition.onresult = e => {
    const texto = e.results[0][0].transcript;
    updateNote(noteId, 'content', notes.find(n => n.id === noteId).content + '\n' + texto);
    renderNotes();
  };
}

function readNoteText(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (note?.content) {
    const utter = new SpeechSynthesisUtterance(note.content);
    utter.lang = 'pt-BR';
    window.speechSynthesis.speak(utter);
  }
}

// Renderização
function renderNotes() {
  const container = document.getElementById('notesContainer');
  container.innerHTML = '';
  notes.forEach(n => {
    const noteEl = document.createElement('div');
    noteEl.className = 'note';
    if (n.videoUrl) {
      noteEl.innerHTML = `
        <iframe width="100%" height="200" src="${n.videoUrl}" frameborder="0" allowfullscreen></iframe>
        <div class="note-date">${formatDateTime(n.lastEdited)}</div>
        <button class="delete-btn" onclick="deleteNote(${n.id})">Apagar</button>
      `;
    } else if (n.audioUrl) {
      noteEl.innerHTML = `
        <audio id="audio_${n.id}" controls style="width:100%">
          <source src="${n.audioUrl}" type="audio/webm">
        </audio>
        <div style="margin-top:10px">
          <button onclick="playAudio(${n.id})">▶️ Play</button>
          <button onclick="pauseAudio(${n.id})">⏸️ Pause</button>
          <button onclick="speedUpAudio(${n.id})">⏩ Acelerar</button>
        </div>
        <div class="note-date">${formatDateTime(n.lastEdited)}</div>
        <button class="delete-btn" onclick="deleteNote(${n.id})">Apagar</button>
      `;
    } else if (n.type === 'pdf') {
      noteEl.innerHTML = `
        <div class="pdf-note">
          <h3>${n.title}</h3>
          <iframe src="${n.pdfUrl}" type="application/pdf" width="100%" height="400px"></iframe>
          <div class="note-date">${formatDateTime(n.lastEdited)}</div>
          <button class="delete-btn" onclick="deleteNote(${n.id})">Apagar</button>
          <button class="expand-btn" onclick="openPdfViewer('${n.pdfUrl}')">Expandir</button>
        </div>
      `;
    } else {
      noteEl.innerHTML = `
        <input type="text" placeholder="Título..." value="${n.title}" oninput="updateNote(${n.id}, 'title', this.value)">
        <textarea placeholder="Escreva algo..." oninput="updateNote(${n.id}, 'content', this.value)">${n.content}</textarea>
        <div class="note-date">${formatDateTime(n.lastEdited)}</div>
        <button class="read-btn" onclick="readNoteText(${n.id})">🔊</button>
        <button class="voice-btn" onclick="startVoiceInput(${n.id})">🎤</button>
        <button class="delete-btn" onclick="deleteNote(${n.id})">Apagar</button>
      `;
    }
    container.appendChild(noteEl);
  });
}

function renderNotebookApp() {
  document.getElementById('app').innerHTML = `
    <div class="container">
      <div class="header">
        <h1>MY NOTES </h1>
      </div>
      <div class="notes-container" id="notesContainer"></div>
      <div class="dock">
        <button class="toggle-theme-btn" onclick="toggleTheme()">🌙 / ☀️</button>
        <button class="new-note-btn" onclick="createNewNote()">NOTA</button>
        <button class="new-note-btn" onclick="createVideoNote()">VÍDEO</button>
        <button class="new-note-btn" onclick="createPdfNote()">PDF</button>
        <button class="logout-btn" onclick="logout()">SAIR</button>
      </div>
    </div>
  `;
  notes = loadNotes();
  renderNotes();
  applyTheme();
}

function openPdfViewer(pdfUrl) {
  const viewer = document.createElement('div');
  viewer.className = 'pdf-viewer-overlay';
  viewer.innerHTML = `
    <div class="pdf-viewer-container">
      <button class="close-viewer" onclick="this.parentElement.parentElement.remove()">✕</button>
      <iframe src="${pdfUrl}" type="application/pdf" width="100%" height="100%"></iframe>
    </div>
  `;
  document.body.appendChild(viewer);
}

// Inicialização
applyTheme();
if (isLoggedIn()) renderNotebookApp();
else renderLogin();
