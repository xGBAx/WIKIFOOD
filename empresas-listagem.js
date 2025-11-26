// Arquivo atualizado: empresas-listagem.js
let empresasOriginais = [];

async function carregarEmpresas() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      document.getElementById('listaEmpresas').innerHTML = '<div class="alert alert-danger">Você precisa estar logado!</div>';
      return;
    }

    const response = await makeRequest('Company', null, token, 'GET');
    if (response.ok && Array.isArray(response.payload)) {
      empresasOriginais = response.payload;
      exibirEmpresas(empresasOriginais);
    } else {
      document.getElementById('listaEmpresas').innerHTML = '<div class="alert alert-warning">Nenhuma empresa encontrada.</div>';
    }
  } catch (error) {
    console.error('Erro:', error);
    document.getElementById('listaEmpresas').innerHTML = '<div class="alert alert-danger">Erro ao carregar empresas.</div>';
  }
}

function exibirEmpresas(empresas) {
  const container = document.getElementById('listaEmpresas');
  if (!empresas || empresas.length === 0) {
    container.innerHTML = '<div class="alert alert-warning">Nenhuma empresa encontrada.</div>';
    return;
  }

  container.innerHTML = empresas.map(empresa => `
    <div class="empresa-card">
      <h3>${empresa.name}</h3>
      <p><strong>CNPJ:</strong> ${empresa.cnpj || 'N/A'}</p>
      <p><strong>Tipo:</strong> ${empresa.type}</p>
      <p><strong>Endereço:</strong> ${empresa.addressComplement || ''} nº ${empresa.addressNumber || 'SN'}</p>
      <p><strong>CEP:</strong> ${empresa.cep || 'N/A'}</p>
      <p><strong>Telefone:</strong> ${empresa.phone || 'N/A'}</p>
      <p><strong>Email:</strong> ${empresa.email || 'N/A'}</p>
      <div class="actions">
        <button class="btn btn-primary" onclick="verDetalhes('${empresa.id}')">Ver Detalhes</button>
        <button class="btn btn-warning" onclick="editarEmpresa('${empresa.id}')">Editar</button>
        <button class="btn btn-danger" onclick="deletarEmpresa('${empresa.id}')">Deletar</button>
      </div>
    </div>
  `).join('');
}

function verDetalhes(id) {
  window.location.href = `empresa-detalhes.html?id=${id}`;
}

function editarEmpresa(id) {
  window.location.href = `empresas-cadastro.html?id=${id}`;
}

function deletarEmpresa(id) {
  if (confirm('Tem certeza que deseja deletar esta empresa?')) {
    const token = localStorage.getItem('authToken');
    makeRequest(`Company/${id}`, {}, token, 'DELETE').then(response => {
      if (response.ok) {
        alert('Empresa deletada com sucesso!');
        carregarEmpresas();
      } else {
        alert('Erro ao deletar empresa');
      }
    });
  }
}

function filtrarEmpresas() {
  const nome = document.getElementById('filtroNome')?.value.toLowerCase() || '';
  const tipo = document.getElementById('filtroTipo')?.value || '';

  const filtradas = empresasOriginais.filter(emp => 
    (emp.name.toLowerCase().includes(nome)) &&
    (tipo === '' || emp.type === tipo)
  );

  exibirEmpresas(filtradas);
}

function limparFiltros() {
  document.getElementById('filtroNome').value = '';
  document.getElementById('filtroTipo').value = '';
  exibirEmpresas(empresasOriginais);
}

window.addEventListener('DOMContentLoaded', carregarEmpresas);
