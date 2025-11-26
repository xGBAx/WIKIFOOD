let empresaAtual = null;
const LOGOPADRAO = "../assets/logo-padrao.jpg";
const DIAS_PT = {
  sunday: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado'
};

window.addEventListener("DOMContentLoaded", async () => {
  await carregarEmpresa();
  document.getElementById('cardapioForm')?.addEventListener('submit', adicionarItemCardapio);
});

async function carregarEmpresa() {
  const urlParams = new URLSearchParams(window.location.search);
  const empresaId = urlParams.get("id");
  const token = localStorage.getItem('authToken');

  if (!empresaId) {
    alert("ID da empresa não encontrado!");
    voltarParaListagem();
    return;
  }

  const response = await makeRequest(`Company/${empresaId}`, {}, token, "GET");

  if (response.ok && response.payload) {
    empresaAtual = response.payload;
    exibirDadosEmpresa(empresaAtual);
    await carregarCardapio();
  } else {
    alert("Empresa não encontrada!");
    voltarParaListagem();
  }
}

function exibirDadosEmpresa(empresa) {
  const header = document.getElementById("companyHeader");

  header.innerHTML = `
    <h1>${empresa.name}</h1>
    <p><strong>Tipo:</strong> ${empresa.type}</p>
    <p><strong>CNPJ:</strong> ${empresa.cnpj}</p>
    <p><strong>Telefone:</strong> ${empresa.phone || "N/A"}</p>
    <p><strong>Email:</strong> ${empresa.email || "N/A"}</p>
    <p><strong>CEP:</strong> ${empresa.cep}</p>
    <p><strong>Endereço:</strong> ${empresa.addressComplement || ""} nº ${empresa.addressNumber}</p>
    <div class="actions">
      <button class="btn btn-warning" onclick="editarEmpresa('${empresa.id}')">✏️ Editar</button>
      <button class="btn btn-danger" onclick="deletarEmpresa('${empresa.id}')">🗑️ Deletar</button>
      <button class="btn btn-secondary" onclick="voltarParaListagem()">⬅️ Voltar</button>
    </div>
  `;
}

function editarEmpresa(id) {
  window.location.href = `empresas-cadastro.html?id=${id}`;
}

async function carregarCardapio() {
  const cardapioContainer = document.getElementById('cardapioContainer');

  if (cardapioContainer) {
    const cardapio = JSON.parse(localStorage.getItem(`cardapio_${empresaAtual.id}`)) || [];

    if (cardapio.length === 0) {
      cardapioContainer.innerHTML = '<p>Nenhum item no cardápio ainda.</p>';
    } else {
      cardapioContainer.innerHTML = cardapio.map(item => `
        <div class="cardapio-item">
          <h4>${item.nome}</h4>
          <p>${item.descricao}</p>
          <p><strong>Preço:</strong> R$ ${item.preco.toFixed(2)}</p>
          <button class="btn btn-danger btn-sm" onclick="deletarItemCardapio('${empresaAtual.id}', '${item.id}')">
            Remover
          </button>
        </div>
      `).join('');
    }
  }
}

async function adicionarItemCardapio(e) {
  e.preventDefault();

  const nome = document.getElementById('nomeItem')?.value;
  const descricao = document.getElementById('descricaoItem')?.value;
  const preco = parseFloat(document.getElementById('precoItem')?.value);

  if (!nome || !descricao || !preco || preco <= 0) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  const cardapio = JSON.parse(localStorage.getItem(`cardapio_${empresaAtual.id}`)) || [];

  const novoItem = {
    id: 'item_' + Date.now(),
    nome,
    descricao,
    preco
  };

  cardapio.push(novoItem);
  localStorage.setItem(`cardapio_${empresaAtual.id}`, JSON.stringify(cardapio));

  alert("Item adicionado com sucesso!");
  document.getElementById('cardapioForm').reset();
  await carregarCardapio();
}

function deletarItemCardapio(empresaId, itemId) {
  if (confirm("Tem certeza que deseja remover este item?")) {
    const cardapio = JSON.parse(localStorage.getItem(`cardapio_${empresaId}`)) || [];
    const index = cardapio.findIndex(item => item.id === itemId);

    if (index !== -1) {
      cardapio.splice(index, 1);
      localStorage.setItem(`cardapio_${empresaId}`, JSON.stringify(cardapio));
      carregarCardapio();
    }
  }
}

function deletarEmpresa(id) {
  if (confirm("Tem certeza que deseja deletar esta empresa? Esta ação não pode ser desfeita.")) {
    const token = localStorage.getItem('authToken');

    makeRequest(`Company/${id}`, {}, token, "DELETE").then(response => {
      if (response.ok) {
        alert("Empresa deletada com sucesso!");
        window.location.href = "empresas-listagem.html";
      } else {
        alert("Erro ao deletar empresa");
      }
    });
  }
}

function voltarParaListagem() {
  window.location.href = "empresas-listagem.html";
}
