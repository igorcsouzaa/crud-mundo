const BASE_URL = '../backend/';

const OPENWEATHERMAP_API_KEY = '7bbfe9d89bd3511defdf4e4475b26150'; // Substitua pela sua chave!
/**
 * Exibe um alerta de sucesso ou erro na página.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de alerta ('success' ou 'danger').
 */
function showAlert(message, type) {
    const container = document.querySelector('.container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Insere o alerta no topo do container
    container.insertBefore(alertDiv, container.firstChild);

    // Remove o alerta após 5 segundos
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Faz uma requisição AJAX (GET, POST, PUT, DELETE) para o backend PHP.
 * @param {string} endpoint - O nome do arquivo PHP (ex: 'paises_crud.php').
 * @param {string} action - A ação a ser executada (ex: 'read', 'create').
 * @param {string} method - O método HTTP ('GET', 'POST', 'PUT', 'DELETE').
 * @param {object} data - Os dados a serem enviados no corpo da requisição (para POST/PUT).
 * @returns {Promise<object>} - A resposta JSON do servidor.
 */
// função genérica pra chamar os endpoints (sempre POST em JSON)
async function apiRequest(endpoint, action, method = 'POST', data = null) {
    const url = `${BASE_URL}${endpoint}`;

    // sempre mando "action" no corpo, junto com os outros dados
    const payload = data ? { action, ...data } : { action };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição API:', error);
        showAlert(`Erro ao comunicar com o servidor: ${error.message}`, 'danger');
        return { success: false, message: 'Erro de comunicação.' };
    }
}


// =================================================================
// CRUD PAÍSES (index.html)
// =================================================================

/**
 * Lista todos os países e preenche a tabela.
 */
async function listarPaises() {
    const tabelaBody = document.querySelector('#tabela-paises tbody');
    if (!tabelaBody) return; // Sai se não estiver na página de países

    tabelaBody.innerHTML = '<tr><td colspan="6">Carregando países...</td></tr>';

    const result = await apiRequest('paises_crud.php', 'read');

    tabelaBody.innerHTML = ''; // Limpa o carregando

    if (result.success && result.data.length > 0) {
        result.data.forEach(pais => {
            const row = tabelaBody.insertRow();
            row.dataset.nome = pais.nome.toLowerCase(); // Para pesquisa dinâmica
            row.innerHTML = `
                <td>${pais.id_pais}</td>
                <td>${pais.nome}</td>
                <td>${pais.continente}</td>
                <td>${new Intl.NumberFormat('pt-BR').format(pais.populacao)}</td>
                <td>${pais.idioma}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="prepararEdicaoPais(${pais.id_pais})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirPais(${pais.id_pais}, '${pais.nome}')"><i class="fas fa-trash"></i> Excluir</button>
                    <button class="btn btn-sm btn-secondary" onclick="mostrarDetalhesPais('${pais.nome}')"><i class="fas fa-info-circle"></i> Detalhes</button>
                </td>
            `;
        });
    } else if (result.success) {
        tabelaBody.innerHTML = '<tr><td colspan="6">Nenhum país cadastrado.</td></tr>';
    } else {
        tabelaBody.innerHTML = `<tr><td colspan="6">${result.message}</td></tr>`;
    }
}

/**
 * Prepara o formulário para edição de um país.
 * @param {number} id_pais - O ID do país a ser editado.
 */
async function prepararEdicaoPais(id_pais) {
    const result = await apiRequest('paises_crud.php', 'read_one', 'GET', { id_pais });

    if (result.success) {
        const pais = result.data;
        document.getElementById('form-pais-title').textContent = `Editar País: ${pais.nome}`;
        document.getElementById('btn-submit-pais').textContent = 'Salvar Alterações';
        document.getElementById('btn-cancelar-edicao').style.display = 'inline-block';

        // Preenche o formulário
        document.getElementById('id_pais').value = pais.id_pais;
        document.getElementById('nome').value = pais.nome;
        document.getElementById('continente').value = pais.continente;
        document.getElementById('populacao').value = pais.populacao;
        document.getElementById('idioma').value = pais.idioma;

        // Rola para o formulário
        document.getElementById('form-pais-card').scrollIntoView({ behavior: 'smooth' });
    } else {
        showAlert(result.message, 'danger');
    }
}

/**
 * Reseta o formulário de país para o modo de cadastro.
 */
function resetFormPais() {
    document.getElementById('form-pais').reset();
    document.getElementById('id_pais').value = '';
    document.getElementById('form-pais-title').textContent = 'Cadastrar Novo País';
    document.getElementById('btn-submit-pais').textContent = 'Cadastrar';
    document.getElementById('btn-cancelar-edicao').style.display = 'none';
}

/**
 * Envia o formulário de país (criação ou edição).
 */
if (document.getElementById('form-pais')) {
    document.getElementById('form-pais').addEventListener('submit', async function(e) {
        e.preventDefault();

        const id_pais = document.getElementById('id_pais').value;
        const method = id_pais ? 'PUT' : 'POST';
        const action = id_pais ? 'update' : 'create';

        const data = {
            id_pais: id_pais || undefined,
            nome: document.getElementById('nome').value,
            continente: document.getElementById('continente').value,
            populacao: document.getElementById('populacao').value,
            idioma: document.getElementById('idioma').value,
        };

        const result = await apiRequest('paises_crud.php', action, method, data);

        if (result.success) {
            showAlert(result.message, 'success');
            resetFormPais();
            listarPaises();
        } else {
            showAlert(result.message, 'danger');
        }
    });

    // Listener para o botão de cancelar edição
    document.getElementById('btn-cancelar-edicao')?.addEventListener('click', resetFormPais);

    // Listener para a pesquisa dinâmica de países
    document.getElementById('search-pais')?.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#tabela-paises tbody tr');

        rows.forEach(row => {
            const nomePais = row.dataset.nome || '';
            if (nomePais.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

/**
 * Exclui um país após confirmação.
 * @param {number} id_pais - O ID do país a ser excluído.
 * @param {string} nome_pais - O nome do país para a mensagem de confirmação.
 */
async function excluirPais(id_pais, nome_pais) {
    if (confirm(`Tem certeza que deseja excluir o país ${nome_pais}? Todas as cidades associadas também serão excluídas.`)) {
        const result = await apiRequest('paises_crud.php', 'delete', 'GET', { id_pais });

        if (result.success) {
            showAlert(result.message, 'success');
            listarPaises();
        } else {
            showAlert(result.message, 'danger');
        }
    }
}

// =================================================================
// CRUD CIDADES (cidades.html)
// =================================================================

/**
 * Carrega a lista de países para o <select> do formulário de cidades.
 */
async function carregarPaisesParaSelect() {
    const selectPais = document.getElementById('id_pais_cidade');
    if (!selectPais) return;

    selectPais.innerHTML = '<option value="">Carregando Países...</option>';

    const result = await apiRequest('paises_crud.php', 'read');

    selectPais.innerHTML = '<option value="">Selecione um País</option>';

    if (result.success && result.data.length > 0) {
        result.data.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais.id_pais;
            option.textContent = pais.nome;
            selectPais.appendChild(option);
        });
    } else {
        selectPais.innerHTML = '<option value="">Erro ao carregar países</option>';
    }
}

/**
 * Lista todas as cidades e preenche a tabela.
 */
async function listarCidades() {
    const tabelaBody = document.querySelector('#tabela-cidades tbody');
    if (!tabelaBody) return; // Sai se não estiver na página de cidades

    tabelaBody.innerHTML = '<tr><td colspan="5">Carregando cidades...</td></tr>';

    const result = await apiRequest('cidades_crud.php', 'read');

    tabelaBody.innerHTML = ''; // Limpa o carregando

    if (result.success && result.data.length > 0) {
        result.data.forEach(cidade => {
            const row = tabelaBody.insertRow();
            row.dataset.nome = cidade.nome.toLowerCase(); // Para pesquisa dinâmica
            row.innerHTML = `
                <td>${cidade.id_cidade}</td>
                <td>${cidade.nome}</td>
                <td>${new Intl.NumberFormat('pt-BR').format(cidade.populacao)}</td>
                <td>${cidade.nome_pais}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="prepararEdicaoCidade(${cidade.id_cidade})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirCidade(${cidade.id_cidade}, '${cidade.nome}')"><i class="fas fa-trash"></i> Excluir</button>
                    <button class="btn btn-sm btn-secondary" onclick="mostrarClimaCidade('${cidade.nome}', '${cidade.nome_pais}')"><i class="fas fa-cloud-sun"></i> Clima</button>
                </td>
            `;
        });
    } else if (result.success) {
        tabelaBody.innerHTML = '<tr><td colspan="5">Nenhuma cidade cadastrada.</td></tr>';
    } else {
        tabelaBody.innerHTML = `<tr><td colspan="5">${result.message}</td></tr>`;
    }
}

/**
 * Prepara o formulário para edição de uma cidade.
 * @param {number} id_cidade - O ID da cidade a ser editada.
 */
async function prepararEdicaoCidade(id_cidade) {
    // A API de cidades não tem um 'read_one' simples, vamos simular lendo todas e filtrando
    const result = await apiRequest('cidades_crud.php', 'read');

    if (result.success) {
        const cidade = result.data.find(c => c.id_cidade == id_cidade);

        if (cidade) {
            document.getElementById('form-cidade-title').textContent = `Editar Cidade: ${cidade.nome}`;
            document.getElementById('btn-submit-cidade').textContent = 'Salvar Alterações';
            document.getElementById('btn-cancelar-edicao-cidade').style.display = 'inline-block';

            // Preenche o formulário
            document.getElementById('id_cidade').value = cidade.id_cidade;
            document.getElementById('nome_cidade').value = cidade.nome;
            document.getElementById('populacao_cidade').value = cidade.populacao;
            document.getElementById('id_pais_cidade').value = cidade.id_pais; // Seleciona o país

            // Rola para o formulário
            document.getElementById('form-cidade-card').scrollIntoView({ behavior: 'smooth' });
        } else {
            showAlert('Cidade não encontrada.', 'danger');
        }
    } else {
        showAlert(result.message, 'danger');
    }
}

/**
 * Reseta o formulário de cidade para o modo de cadastro.
 */
function resetFormCidade() {
    document.getElementById('form-cidade').reset();
    document.getElementById('id_cidade').value = '';
    document.getElementById('form-cidade-title').textContent = 'Cadastrar Nova Cidade';
    document.getElementById('btn-submit-cidade').textContent = 'Cadastrar';
    document.getElementById('btn-cancelar-edicao-cidade').style.display = 'none';
}

/**
 * Envia o formulário de cidade (criação ou edição).
 */
if (document.getElementById('form-cidade')) {
    document.getElementById('form-cidade').addEventListener('submit', async function(e) {
        e.preventDefault();

        const id_cidade = document.getElementById('id_cidade').value;
        const method = id_cidade ? 'PUT' : 'POST';
        const action = id_cidade ? 'update' : 'create';

        const data = {
            id_cidade: id_cidade || undefined,
            nome: document.getElementById('nome_cidade').value,
            populacao: document.getElementById('populacao_cidade').value,
            id_pais: document.getElementById('id_pais_cidade').value,
        };

        const result = await apiRequest('cidades_crud.php', action, method, data);

        if (result.success) {
            showAlert(result.message, 'success');
            resetFormCidade();
            listarCidades();
        } else {
            showAlert(result.message, 'danger');
        }
    });

    // Listener para o botão de cancelar edição
    document.getElementById('btn-cancelar-edicao-cidade')?.addEventListener('click', resetFormCidade);

    // Listener para a pesquisa dinâmica de cidades
    document.getElementById('search-cidade')?.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#tabela-cidades tbody tr');

        rows.forEach(row => {
            const nomeCidade = row.dataset.nome || '';
            if (nomeCidade.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

/**
 * Exclui uma cidade após confirmação.
 * @param {number} id_cidade - O ID da cidade a ser excluída.
 * @param {string} nome_cidade - O nome da cidade para a mensagem de confirmação.
 */
async function excluirCidade(id_cidade, nome_cidade) {
    if (confirm(`Tem certeza que deseja excluir a cidade ${nome_cidade}?`)) {
        const result = await apiRequest('cidades_crud.php', 'delete', 'GET', { id_cidade });

        if (result.success) {
            showAlert(result.message, 'success');
            listarCidades();
        } else {
            showAlert(result.message, 'danger');
        }
    }
}

// =================================================================
// FUNÇÕES DE INTEGRAÇÃO COM API EXTERNA (REST Countries e OpenWeatherMap)
// =================================================================

/**
 * Busca e exibe detalhes de um país usando a REST Countries API.
 * @param {string} nome_pais - O nome do país.
 */
async function mostrarDetalhesPais(nome_pais) {
    const url = `https://restcountries.com/v3.1/name/${nome_pais}?fields=flags,capital,currencies`;
    const detalhesDiv = document.getElementById('detalhes-pais');
    const container = document.querySelector('.container');

    if (!detalhesDiv) {
        // Cria a div de detalhes se não existir
        const newDiv = document.createElement('div');
        newDiv.id = 'detalhes-pais';
        newDiv.className = 'details-section';
        container.insertBefore(newDiv, document.querySelector('hr').nextSibling);
    }

    const targetDiv = document.getElementById('detalhes-pais');
    targetDiv.innerHTML = '<h3>Detalhes do País (API Externa)</h3><p>Carregando...</p>';
    targetDiv.style.display = 'block';

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.length > 0) {
            const pais = data[0];
            const capital = pais.capital ? pais.capital[0] : 'N/A';
            const moedaCode = Object.keys(pais.currencies)[0];
            const moeda = pais.currencies[moedaCode].name;
            const bandeiraUrl = pais.flags.svg;

            targetDiv.innerHTML = `
                <h3>Detalhes de ${nome_pais}</h3>
                <p><img src="${bandeiraUrl}" alt="Bandeira de ${nome_pais}" class="flag-icon" style="width: 50px; height: auto; border: 1px solid #ccc; vertical-align: middle;"> <strong>Capital:</strong> ${capital}</p>
                <p><strong>Moeda:</strong> ${moeda} (${moedaCode})</p>
                <button class="btn btn-sm btn-danger" onclick="document.getElementById('detalhes-pais').style.display = 'none';">Fechar Detalhes</button>
            `;
        } else {
            targetDiv.innerHTML = `<h3>Detalhes de ${nome_pais}</h3><p>Detalhes não encontrados na API externa.</p>`;
        }
    } catch (error) {
        targetDiv.innerHTML = `<h3>Detalhes de ${nome_pais}</h3><p>Erro ao buscar dados da API REST Countries.</p>`;
        console.error('Erro ao buscar detalhes do país:', error);
    }
}

/**
 * Busca e exibe o clima atual de uma cidade usando a OpenWeatherMap API.
 * @param {string} nome_cidade - O nome da cidade.
 * @param {string} nome_pais - O nome do país (para melhor precisão).
 */
async function mostrarClimaCidade(nome_cidade, nome_pais) {
    if (OPENWEATHERMAP_API_KEY === 'SUA_CHAVE_OPENWEATHERMAP_AQUI') {
        showAlert('Por favor, insira sua chave da OpenWeatherMap API no arquivo script.js para usar esta funcionalidade.', 'danger');
        return;
    }

    const detalhesDiv = document.getElementById('detalhes-clima');
    const container = document.querySelector('.container');

    if (!detalhesDiv) {
        // Cria a div de detalhes se não existir
        const newDiv = document.createElement('div');
        newDiv.id = 'detalhes-clima';
        newDiv.className = 'details-section';
        container.insertBefore(newDiv, document.querySelector('hr').nextSibling);
    }

    const targetDiv = document.getElementById('detalhes-clima');
    targetDiv.innerHTML = `<h3>Clima Atual em ${nome_cidade}</h3><p>Carregando...</p>`;
    targetDiv.style.display = 'block';

    try {
        // Primeiro, busca as coordenadas (lat/lon) da cidade
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${nome_cidade},${nome_pais}&limit=1&appid=${OPENWEATHERMAP_API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoResponse.ok || geoData.length === 0) {
            targetDiv.innerHTML = `<h3>Clima Atual em ${nome_cidade}</h3><p>Coordenadas da cidade não encontradas.</p>`;
            return;
        }

        const { lat, lon } = geoData[0];

        // Segundo, busca o clima atual usando as coordenadas
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=pt_br`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
            const temp = weatherData.main.temp.toFixed(1);
            const descricao = weatherData.weather[0].description;
            const icone = weatherData.weather[0].icon;
            const iconeUrl = `https://openweathermap.org/img/wn/${icone}@2x.png`;

            targetDiv.innerHTML = `
                <h3>Clima Atual em ${nome_cidade}</h3>
                <div class="weather-info">
                    <img src="${iconeUrl}" alt="${descricao}" class="weather-icon">
                    <div>
                        <p><strong>Temperatura:</strong> ${temp}°C</p>
                        <p><strong>Condição:</strong> ${descricao.charAt(0).toUpperCase() + descricao.slice(1)}</p>
                        <p><strong>Umidade:</strong> ${weatherData.main.humidity}%</p>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" onclick="document.getElementById('detalhes-clima').style.display = 'none';">Fechar Clima</button>
            `;
        } else {
            targetDiv.innerHTML = `<h3>Clima Atual em ${nome_cidade}</h3><p>Erro ao buscar dados de clima: ${weatherData.message || 'Erro desconhecido'}</p>`;
        }
    } catch (error) {
        targetDiv.innerHTML = `<h3>Clima Atual em ${nome_cidade}</h3><p>Erro ao buscar dados de clima.</p>`;
        console.error('Erro ao buscar clima:', error);
    }
}

// =================================================================
// FUNÇÕES DE ESTATÍSTICAS (estatisticas.html)
// =================================================================

/**
 * Carrega e exibe as estatísticas na página.
 */
async function carregarEstatisticas() {
    const maisPopulosaDiv = document.getElementById('cidade-mais-populosa');
    const cidadesPorContinenteDiv = document.getElementById('cidades-por-continente');

    if (!maisPopulosaDiv || !cidadesPorContinenteDiv) return;

    // 1. Cidade mais populosa por país
    maisPopulosaDiv.innerHTML = '<h4>Cidade Mais Populosa por País</h4><p>Carregando...</p>';
    const resultPopulosa = await apiRequest('estatisticas_backend.php', 'cidade_mais_populosa_por_pais');

    if (resultPopulosa.success) {
        let html = '<h4>Cidade Mais Populosa por País</h4><table class="data-table"><thead><tr><th>País</th><th>Cidade</th><th>População</th></tr></thead><tbody>';
        resultPopulosa.data.forEach(item => {
            html += `<tr><td>${item.nome_pais}</td><td>${item.nome_cidade}</td><td>${new Intl.NumberFormat('pt-BR').format(item.populacao)}</td></tr>`;
        });
        html += '</tbody></table>';
        maisPopulosaDiv.innerHTML = html;
    } else {
        maisPopulosaDiv.innerHTML = `<h4>Cidade Mais Populosa por País</h4><p>${resultPopulosa.message}</p>`;
    }

    // 2. Total de cidades por continente
    cidadesPorContinenteDiv.innerHTML = '<h4>Total de Cidades por Continente</h4><p>Carregando...</p>';
    const resultContinente = await apiRequest('estatisticas_backend.php', 'total_cidades_por_continente');

    if (resultContinente.success) {
        let html = '<h4>Total de Cidades por Continente</h4><table class="data-table"><thead><tr><th>Continente</th><th>Total de Cidades</th></tr></thead><tbody>';
        resultContinente.data.forEach(item => {
            html += `<tr><td>${item.continente}</td><td>${item.total_cidades}</td></tr>`;
        });
        html += '</tbody></table>';
        cidadesPorContinenteDiv.innerHTML = html;
    } else {
        cidadesPorContinenteDiv.innerHTML = `<h4>Total de Cidades por Continente</h4><p>${resultContinente.message}</p>`;
    }
}

// =================================================================
// INICIALIZAÇÃO DE PÁGINAS
// =================================================================

// A inicialização das páginas de Países e Cidades está nos respectivos HTMLs.

// Inicialização da página de Estatísticas
if (document.getElementById('estatisticas-page')) {
    document.addEventListener('DOMContentLoaded', carregarEstatisticas);
}
