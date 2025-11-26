console.log('[INIT] Iniciando utils.js');

// 2️⃣ GARANTIR EMPRESAS DE EXEMPLO EXISTEM
if (!localStorage.getItem('empresas')) {
  console.log('[INIT] Criando empresas de exemplo...');
  
  const empresasExemplo = [
    {
      id: 'emp_001',
      name: 'Pizzaria Italiana',
      type: 'Pizzaria',
      cnpj: '12.345.678/0001-90',
      cep: '01310100',
      addressNumber: '100',
      addressComplement: 'Rua Augusta',
      phone: '(11) 3012-3456',
      email: 'contato@pizzariaitaliana.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'emp_002',
      name: 'Sushi Bar Premium',
      type: 'Sushi Bar',
      cnpj: '98.765.432/0001-10',
      cep: '04543130',
      addressNumber: '500',
      addressComplement: 'Avenida Paulista',
      phone: '(11) 3045-6789',
      email: 'contato@sushibarpremium.com',
      createdAt: new Date().toISOString()
    }
  ];
  
  localStorage.setItem('empresas', JSON.stringify(empresasExemplo));
  console.log('[INIT] ✅ Empresas de exemplo criadas');
} else {
  const qty = JSON.parse(localStorage.getItem('empresas')).length;
  console.log('[INIT] ✅ Encontradas', qty, 'empresas');
}

/**
 * Simula requisições HTTP usando localStorage
 */
async function makeRequest(endpoint, data = {}, token = null, method = "GET") {
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log(`[REQUEST] ${method} ${endpoint}`);

  try {
    const tokenAtual = localStorage.getItem('authToken');
    
    // NOVA VALIDAÇÃO UNIFICADA (exige login real)
    if (!tokenAtual || !token || token !== tokenAtual) {
      console.error('[AUTH] Token ausente ou inválido');
      return {
        ok: false,
        status: 401,
        payload: { message: "Você precisa estar logado para realizar esta ação." }
      };
    }

    console.log('[TOKEN] ✅ Token válido!');

    // PROCESSAR REQUISIÇÃO
    if (method === 'GET') {
      return handleGetRequest(endpoint);
    } else if (method === 'POST') {
      return handlePostRequest(endpoint, data);
    } else if (method === 'PUT') {
      return handlePutRequest(endpoint, data);
    } else if (method === 'DELETE') {
      return handleDeleteRequest(endpoint);
    }

    return {
      ok: false,
      status: 400,
      payload: { message: "Método não suportado" }
    };

  } catch (error) {
    console.error("[ERROR]", error);
    return {
      ok: false,
      status: 500,
      payload: { message: error.message }
    };
  }
}

// === GET, POST, PUT, DELETE (mantidos iguais) ===
function handleGetRequest(endpoint) {
  console.log('[GET]', endpoint);

  if (endpoint === 'Company') {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    return { ok: true, status: 200, payload: empresas };
  }

  if (endpoint.startsWith('Company/')) {
    const id = endpoint.split('/')[1];
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const empresa = empresas.find(e => e.id === id);

    if (empresa) {
      return { ok: true, status: 200, payload: empresa };
    }

    return { ok: false, status: 404, payload: { message: "Empresa não encontrada" } };
  }

  return { ok: false, status: 404, payload: { message: "Endpoint não encontrado" } };
}

function handlePostRequest(endpoint, data) {
  console.log('[POST]', endpoint, data);

  if (endpoint === 'Company') {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];

    const novaEmpresa = {
      id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: data.Name,
      type: data.Type,
      cnpj: data.Cnpj,
      cep: data.Cep,
      addressNumber: data.AddressNumber,
      addressComplement: data.AddressComplement,
      phone: data.Phone || '',
      email: data.Email || '',
      createdAt: new Date().toISOString()
    };

    empresas.push(novaEmpresa);
    localStorage.setItem('empresas', JSON.stringify(empresas));

    console.log('[POST] ✅ Empresa criada:', novaEmpresa.id);

    return { ok: true, status: 201, payload: novaEmpresa };
  }

  return { ok: false, status: 400, payload: { message: "Não foi possível criar" } };
}

function handlePutRequest(endpoint, data) {
  console.log('[PUT]', endpoint, data);

  const parts = endpoint.split('/');
  if (parts[0] === 'Company' && parts[1]) {
    const id = parts[1];
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const index = empresas.findIndex(e => e.id === id);

    if (index !== -1) {
      empresas[index] = {
        ...empresas[index],
        name: data.Name || empresas[index].name,
        type: data.Type || empresas[index].type,
        cnpj: data.Cnpj || empresas[index].cnpj,
        cep: data.Cep || empresas[index].cep,
        addressNumber: data.AddressNumber || empresas[index].addressNumber,
        addressComplement: data.AddressComplement || empresas[index].addressComplement,
        phone: data.Phone || empresas[index].phone,
        email: data.Email || empresas[index].email,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('empresas', JSON.stringify(empresas));
      return { ok: true, status: 200, payload: empresas[index] };
    }
  }

  return { ok: false, status: 404, payload: { message: "Empresa não encontrada" } };
}

function handleDeleteRequest(endpoint) {
  const parts = endpoint.split('/');
  if (parts[0] === 'Company' && parts[1]) {
    const id = parts[1];
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const index = empresas.findIndex(e => e.id === id);

    if (index !== -1) {
      empresas.splice(index, 1);
      localStorage.setItem('empresas', JSON.stringify(empresas));
      return { ok: true, status: 200, payload: { message: "Deletada com sucesso" } };
    }
  }

  return { ok: false, status: 404, payload: { message: "Não encontrada" } };
}

function verificarLocalStorage() {
  console.log('=== DIAGNÓSTICO ===');
  console.log('Token:', localStorage.getItem('authToken'));
  const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
  console.log('Empresas:', empresas.length);
  console.log('===================');
}

console.log('[INIT] ✅ utils.js carregado com sucesso!');
verificarLocalStorage();