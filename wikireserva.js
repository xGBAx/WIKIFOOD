// wikireserva.js - VERSÃO FINAL (Local Storage + Imagem Fixa + Feed)

// --- CONFIGURAÇÃO ---
// IMPORTANTE: Certifique-se de que a foto está na mesma pasta com este nome:
const DEFAULT_IMAGE = './padraorecipe.jpg'; 

const msg = document.getElementById('message');

function debugLog(...args) {
  if (window && window.console) console.log('[wiki-debug-default]', ...args);
}

// --- BANCO DE DADOS (LocalStorage) ---
function getLocalUsers() { return JSON.parse(localStorage.getItem('wiki_users') || '[]'); }
function saveLocalUser(u) { const users = getLocalUsers(); users.push(u); localStorage.setItem('wiki_users', JSON.stringify(users)); }

function getLocalRecipes() { return JSON.parse(localStorage.getItem('wiki_recipes') || '[]'); }
function saveLocalRecipe(r) { const recipes = getLocalRecipes(); recipes.push(r); localStorage.setItem('wiki_recipes', JSON.stringify(recipes)); }

// --- UI ---
function showMessage(text, type = 'error') {
  if (!msg) return;
  msg.className = 'msg ' + (type === 'success' ? 'success' : 'error');
  msg.textContent = text;
}

// Funções de navegação entre abas
function showRegister() {
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('register-form')?.classList.add('active');
  document.getElementById('recipe-section')?.classList.remove('active');
  document.getElementById('form-title').textContent = 'Cadastro';
  msg.textContent = '';
}
function showLogin() {
  document.getElementById('register-form')?.classList.remove('active');
  document.getElementById('login-form')?.classList.add('active');
  document.getElementById('recipe-section')?.classList.remove('active');
  document.getElementById('form-title').textContent = 'Login';
  msg.textContent = '';
}
function showRecipeSection() {
  document.getElementById('login-form')?.classList.remove('active');
  document.getElementById('register-form')?.classList.remove('active');
  document.getElementById('recipe-section')?.classList.add('active');
  document.getElementById('form-title').textContent = 'Nova Receita';
  msg.textContent = '';
}

// --- REQUEST FAKE (Simula o Backend) ---
async function makeRequest(endpoint, data, token = null) {
    debugLog('Request para:', endpoint);
    await new Promise(r => setTimeout(r, 300)); // Delayzinho pra parecer real

    // LOGIN
    if (endpoint === '/Auth/login') {
        const users = getLocalUsers();
        const user = users.find(u => u.email === data.email && u.password === data.password);
        if (user) return { ok: true, payload: { token: 'token-fake-' + Date.now(), name: user.name, email: user.email } };
        return { ok: false, payload: { message: 'Dados incorretos' } };
    }

    // CADASTRO DE USUÁRIO
    if (endpoint === '/Auth/register') {
        saveLocalUser({ ...data, id: Date.now() });
        return { ok: true, payload: { message: 'Sucesso' } };
    }

    // CADASTRO DE RECEITA
    if (endpoint === '/Receipt') {
        if (!token) return { ok: false, payload: { message: 'Logue primeiro' } };
        
        const newRecipe = {
            id: Date.now(),
            title: data.title,
            lore: data.lore,
            description: data.description,
            imageUrl: DEFAULT_IMAGE, // Usa a imagem fixa definida lá em cima
            createdAt: new Date().toISOString()
        };
        saveLocalRecipe(newRecipe);
        return { ok: true, payload: newRecipe };
    }
    return { ok: false };
}

// --- BOTÕES E CLIQUES ---
function registerEventListeners() {
  
  // 1. Botão Login
  document.getElementById('btn-login')?.addEventListener('click', async () => {
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const res = await makeRequest('/Auth/login', { email, password });
      
      if (res.ok) {
          localStorage.setItem('authToken', res.payload.token);
          showMessage('Logado com sucesso!', 'success');
          setTimeout(showRecipeSection, 500);
      } else {
          showMessage('E-mail ou senha errados');
      }
  });

  // 2. Botão Cadastrar Usuário
  document.getElementById('btn-register')?.addEventListener('click', async () => {
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      
      if(await makeRequest('/Auth/register', { name, email, password }).then(r=>r.ok)) {
          showMessage('Cadastrado! Faça login.', 'success'); 
          setTimeout(showLogin, 1000);
      }
  });

  // 3. Botão Nova Receita
  const btnAdd = document.getElementById('btn-add-recipe');
  if (btnAdd) {
      btnAdd.addEventListener('click', async () => {
          const token = localStorage.getItem('authToken');
          if (!token) return showMessage('Sessão expirou. Faça login novamente.');

          const title = document.getElementById('recipe-title').value;
          const lore = document.getElementById('recipe-lore').value;
          const ingredients = document.getElementById('recipe-ingredients').value;
          
          if (!title || !lore) return showMessage('Título e História são obrigatórios');

          const data = {
              title,
              lore,
              description: ingredients
          };

          showMessage('Salvando receita...', 'success');
          const res = await makeRequest('/Receipt', data, token);

          if (res.ok) {
              showMessage('Receita salva com sucesso!', 'success');
              // Limpa os campos
              document.getElementById('recipe-title').value = '';
              document.getElementById('recipe-lore').value = '';
              document.getElementById('recipe-ingredients').value = '';
              
              // Se quiser ir direto pro feed, descomente a linha abaixo:
              // setTimeout(() => { window.location.href = 'feed.html'; }, 800);
          }
      });
  }

  // 4. Botão PULAR / IR PARA HOME (AQUI ESTÁ A MUDANÇA)
  document.getElementById('btn-skip')?.addEventListener('click', () => {
      window.location.href = 'index.html'; 
  });

  // 5. Links e Logout
  document.getElementById('link-register')?.addEventListener('click', (e) => { e.preventDefault(); showRegister(); });
  document.getElementById('link-login')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  document.getElementById('btn-logout')?.addEventListener('click', () => { 
      localStorage.removeItem('authToken'); 
      showLogin(); 
  });
}

// Inicializa quando a tela carrega
document.addEventListener('DOMContentLoaded', () => {
    registerEventListeners();
    if(localStorage.getItem('authToken')) showRecipeSection();

});
