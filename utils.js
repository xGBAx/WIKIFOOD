async function makeRequest(endpoint, data = {}, token = null, method = "GET") {
  // Simular delay de requisição
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    console.log(`[makeRequest] Endpoint: ${endpoint}, Method: ${method}, Token: ${token}`);

    // Verificar token - IMPORTANTE!
    if (!token || token !== 'fake-token-123') {
      console.error('[makeRequest] Token inválido ou não fornecido');
      return { 
        ok: false, 
        status: 401, 
        payload: { message: "Token inválido. Faça login novamente." } 
      };
    }

    const storageKey = endpoint.split('/')[0];

    if (method === 'GET') {
      return handleGetRequest(endpoint);
    } else if (method === 'POST') {
      return handlePostRequest(storageKey, data);
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
    console.error("Erro na requisição:", error);
    return { 
      ok: false, 
      status: 0, 
      payload: { message: error.message } 
    };
  }
}

/**
 * Processa requisições GET
 */
function handleGetRequest(endpoint) {
  console.log(`[GET] ${endpoint}`);
  
  if (endpoint === 'Company') {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    console.log(`[GET] Retornando ${empresas.length} empresas`);
    return { 
      ok: true, 
      status: 200, 
      payload: empresas 
    };
  } else if (endpoint.startsWith('Company/')) {
    const id = endpoint.split('/')[1];
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const empresa = empresas.find(e => e.id === id);

    if (empresa) {
      console.log(`[GET] Empresa encontrada: ${empresa.name}`);
      return { 
        ok: true, 
        status: 200, 
        payload: empresa 
      };
    } else {
      console.error(`[GET] Empresa não encontrada: ${id}`);
      return { 
        ok: false, 
        status: 404, 
        payload: { message: "Empresa não encontrada" } 
      };
    }
  }

  return { 
    ok: false, 
    status: 404, 
    payload: { message: "Endpoint não encontrado" } 
  };
}

/**
 * Processa requisições POST (criar novos dados)
 */
function handlePostRequest(storageKey, data) {
  console.log(`[POST] ${storageKey}`, data);
  
  if (storageKey === 'Company') {
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    
    // Gerar ID único
    const novoId = 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const novaEmpresa = {
      id: novoId,
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

    console.log(`[POST] Empresa criada com sucesso: ${novaEmpresa.name}`);

    return { 
      ok: true, 
      status: 201, 
      payload: novaEmpresa 
    };
  }

  return { 
    ok: false, 
    status: 400, 
    payload: { message: "Não foi possível criar o item" } 
  };
}

/**
 * Processa requisições PUT (atualizar dados)
 */
function handlePutRequest(endpoint, data) {
  const parts = endpoint.split('/');
  console.log(`[PUT] ${endpoint}`, data);
  
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
        phone: data.Phone !== undefined ? data.Phone : empresas[index].phone,
        email: data.Email !== undefined ? data.Email : empresas[index].email,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('empresas', JSON.stringify(empresas));
      console.log(`[PUT] Empresa atualizada: ${empresas[index].name}`);

      return { 
        ok: true, 
        status: 200, 
        payload: empresas[index] 
      };
    }

    console.error(`[PUT] Empresa não encontrada: ${id}`);
    return { 
      ok: false, 
      status: 404, 
      payload: { message: "Empresa não encontrada" } 
    };
  }

  return { 
    ok: false, 
    status: 400, 
    payload: { message: "Não foi possível atualizar o item" } 
  };
}

/**
 * Processa requisições DELETE
 */
function handleDeleteRequest(endpoint) {
  const parts = endpoint.split('/');
  console.log(`[DELETE] ${endpoint}`);
  
  if (parts[0] === 'Company' && parts[1]) {
    const id = parts[1];
    const empresas = JSON.parse(localStorage.getItem('empresas')) || [];
    const index = empresas.findIndex(e => e.id === id);

    if (index !== -1) {
      const empresaDeletada = empresas[index];
      empresas.splice(index, 1);
      localStorage.setItem('empresas', JSON.stringify(empresas));

      console.log(`[DELETE] Empresa deletada: ${empresaDeletada.name}`);

      return { 
        ok: true, 
        status: 200, 
        payload: { message: "Empresa deletada com sucesso", data: empresaDeletada } 
      };
    }

    console.error(`[DELETE] Empresa não encontrada: ${id}`);
    return { 
      ok: false, 
      status: 404, 
      payload: { message: "Empresa não encontrada" } 
    };
  }

  return { 
    ok: false, 
    status: 400, 
    payload: { message: "Não foi possível deletar o item" } 
  };
}

/**
 * Inicializa dados de exemplo no localStorage
 * IMPORTANTE: Só executa se não houver dados ainda
 */
function inicializarDados() {
  try {
    // 1. SEMPRE criar o token (é obrigatório!)
    if (!localStorage.getItem('authToken')) {
      console.log('[Init] Criando token de autenticação...');
      localStorage.setItem('authToken', 'fake-token-123');
    }

    // 2. Criar dados de exemplo se não existirem
    if (!localStorage.getItem('empresas')) {
      console.log('[Init] Inicializando empresas de exemplo...');
      
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
      console.log('[Init] Empresas de exemplo criadas');
    } else {
      const empresas = JSON.parse(localStorage.getItem('empresas'));
      console.log(`[Init] Encontradas ${empresas.length} empresas no localStorage`);
    }

  } catch (error) {
    console.error('[Init] Erro ao inicializar dados:', error);
  }
}

/**
 * Debug: Verificar estado do localStorage
 */
function verificarLocalStorage() {
  console.log('=== DIAGNÓSTICO localStorage ===');
  console.log('Token:', localStorage.getItem('authToken'));
  console.log('Empresas:', JSON.parse(localStorage.getItem('empresas') || '[]').length);
  console.log('================================');
}

// Inicializar dados ao carregar o script
if (typeof window !== 'undefined') {
  // Executar quando o DOM estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('[Init] Inicializando utils.js...');
      inicializarDados();
      verificarLocalStorage();
    });
  } else {
    // Se o DOM já foi carregado
    console.log('[Init] Inicializando utils.js...');
    inicializarDados();
    verificarLocalStorage();
  }
}