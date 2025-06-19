// ==============================
// 1. VARIÁVEIS E ELEMENTOS GLOBAIS
// ==============================
const barraLateral = document.querySelector('#barraLateral');
const botaoMenu = document.querySelector('#botaoMenu');
const logo = document.querySelector('#logoTexto');
const opcoesMenu = document.querySelectorAll('#opcoesMenu li');
const conteudoPrincipal = document.querySelector('#conteudoPrincipal');
const botaoTema = document.querySelector('#botaoTema');
const botaoLogout = document.querySelector('#botaoLogout');
const sobreposicaoModal = document.querySelector('#sobreposicaoModal');
const botaoAbrirModal = document.querySelector('.botao-adicionar-produto');
const botaoFecharModal = document.querySelector('#botaoFecharModal');
const botaoCancelarModal = document.querySelector('#botaoCancelarModal');
const formularioAdicionarProduto = document.querySelector('#formularioAdicionarProduto');
const botaoGerenciarUsuario = document.querySelector('.botao-gerenciarusuario');
const selectLocalizacao = document.getElementById('localizacao');
let tipoEntrada = null;

// ==============================
// 2. FUNÇÕES GERAIS E UTILITÁRIOS
// ==============================
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function showToastConfirm(msg, onConfirm) {
    const toast = document.getElementById('toastConfirm');
    if (!toast) return;

    toast.innerHTML = `
        <span>${msg}</span>
        <div class="toast-confirm-btns">
            <button id="toastBtnSim">Sim</button>
            <button id="toastBtnNao">Não</button>
        </div>
    `;
    toast.classList.add('show');

    const btnSim = document.getElementById('toastBtnSim');
    const btnNao = document.getElementById('toastBtnNao');

    btnSim.onclick = () => {
        toast.classList.remove('show');
        if (onConfirm) onConfirm(true);
    };
    btnNao.onclick = () => {
        toast.classList.remove('show');
        if (onConfirm) onConfirm(false);
    };
}

function ativarMenu(li) {
    for (let item of opcoesMenu) {
        item.classList.remove('ativo');
    }
    li.classList.add('ativo');
}

function mostrarSecao(secaoId) {
    const secoes = [
        'secaoDashboard',
        'secaoEstoque',
        'secaoMovimentacao',
        'secaoEntrada',
        'secaoSaida',
        'secaoSolicitacoes'
    ];
    secoes.forEach(id => {
        const secao = document.getElementById(id);
        if (secao) {
            secao.classList.toggle('ativo', id === secaoId);
        }
    });
}

function ehMobile() {
    return window.innerWidth <= 768;
}

function atualizarEstadoBarraLateral() {
    if (ehMobile()) {
        barraLateral.classList.remove('minimizada');
        botaoMenu.style.display = 'none';
        logo.style.opacity = '1';
        logo.style.visibility = 'visible';
    } else {
        botaoMenu.style.display = 'flex';
    }
}

// ==============================
// 3. TEMA CLARO/ESCURO
// ==============================
botaoTema.addEventListener('click', function () {
    document.body.classList.toggle('escuro');
    const icone = botaoTema.querySelector('i');
    if (document.body.classList.contains('escuro')) {
        icone.classList.remove('fa-moon');
        icone.classList.add('fa-sun');
        botaoTema.querySelector('span').textContent = 'Tema Claro';
    } else {
        icone.classList.remove('fa-sun');
        icone.classList.add('fa-moon');
        botaoTema.querySelector('span').textContent = 'Tema Escuro';
    }
});

// ==============================
// 4. LABEL FLUTUANTE DO SELECT LOCALIZAÇÃO
// ==============================
function atualizarClasseFilledSelectLocalizacao() {
    if (!selectLocalizacao) return;
    if (selectLocalizacao.value && selectLocalizacao.value !== '') {
        selectLocalizacao.classList.add('filled');
    } else {
        selectLocalizacao.classList.remove('filled');
    }
}
document.addEventListener('DOMContentLoaded', function () {
    atualizarClasseFilledSelectLocalizacao();
    if (selectLocalizacao) {
        selectLocalizacao.addEventListener('change', atualizarClasseFilledSelectLocalizacao);
    }
});

// ==============================
// 5. MODAL DE PRODUTO (Adicionar/Editar)
// ==============================
if (botaoAbrirModal) {
    botaoAbrirModal.addEventListener('click', () => {
        sobreposicaoModal.style.display = 'flex';
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        atualizarClasseFilledSelectLocalizacao();
        document.querySelector('.modal-adicionar').textContent = 'Adicionar';
        formularioAdicionarProduto.removeAttribute('data-editar');
        document.getElementById('quantidade').removeAttribute('readonly');
    });
}
if (botaoCancelarModal) {
    botaoCancelarModal.addEventListener('click', () => {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        atualizarClasseFilledSelectLocalizacao();
        limparTodosErrosProduto();
        sobreposicaoModal.style.display = 'none';
    });
}
if (botaoFecharModal) {
    botaoFecharModal.addEventListener('click', () => {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        atualizarClasseFilledSelectLocalizacao();
        limparTodosErrosProduto();
        sobreposicaoModal.style.display = 'none';
    });
}
sobreposicaoModal.addEventListener('click', (e) => {
    if (e.target === sobreposicaoModal) {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        atualizarClasseFilledSelectLocalizacao();
        limparTodosErrosProduto();
        sobreposicaoModal.style.display = 'none';
    }
});
const camposProduto = formularioAdicionarProduto
    ? formularioAdicionarProduto.querySelectorAll('input, select')
    : [];
function mostrarErroProduto(input, mensagem) {
    let parent = input.parentElement;
    let errorElement = parent.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.classList.add('error-message');
        parent.appendChild(errorElement);
    }
    errorElement.textContent = mensagem;
    input.classList.add('erro', 'bounce');
    setTimeout(() => input.classList.remove('bounce'), 750);
}
function limparErroProduto(input) {
    let parent = input.parentElement;
    let errorElement = parent.querySelector('.error-message');
    if (errorElement) errorElement.textContent = '';
    input.classList.remove('erro');
}
function limparTodosErrosProduto() {
    camposProduto.forEach(limparErroProduto);
}
if (formularioAdicionarProduto) {
    formularioAdicionarProduto.addEventListener('submit', function (e) {
        e.preventDefault();
        let erro = false;
        camposProduto.forEach(input => {
            if (!input.value || (input.type === 'number' && input.value === '')) {
                mostrarErroProduto(input, 'Campo obrigatório');
                erro = true;
            } else {
                limparErroProduto(input);
            }
        });
        if (!erro) {
            const dados = {
                nome: formularioAdicionarProduto.nome.value,
                sku: formularioAdicionarProduto.sku.value,
                precoCompra: formularioAdicionarProduto.precoCompra.value,
                fornecedor: formularioAdicionarProduto.fornecedor.value,
                localizacao: formularioAdicionarProduto.localizacao.value,
                quantidade: formularioAdicionarProduto.quantidade.value,
                precoVenda: formularioAdicionarProduto.precoVenda.value
            };
            const idEstoqueEditar = formularioAdicionarProduto.getAttribute('data-editar');
            if (idEstoqueEditar) {
                fetch(`/api/estoque/produtos/${idEstoqueEditar}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                })
                    .then(res => res.json())
                    .then(resposta => {
                        if (resposta.sucesso) {
                            formularioAdicionarProduto.reset();
                            camposProduto.forEach(limparErroProduto);
                            sobreposicaoModal.style.display = 'none';
                            formularioAdicionarProduto.removeAttribute('data-editar');
                            document.querySelector('.modal-adicionar').textContent = 'Adicionar';
                            carregarEstoque();
                        } else {
                            showToast(resposta.erro || 'Erro ao editar produto.', null);
                        }
                    })
                    .catch(() => {
                        showToast('Erro de comunicação com o servidor.', null);
                    });
            } else {
                fetch('/produtos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                })
                    .then(res => res.json())
                    .then(resposta => {
                        if (resposta.sucesso) {
                            formularioAdicionarProduto.reset();
                            camposProduto.forEach(limparErroProduto);
                            sobreposicaoModal.style.display = 'none';
                            carregarEstoque();
                        } else {
                            showToast(resposta.erro || 'Erro ao cadastrar produto.', null);
                        }
                    })
                    .catch(() => {
                        showToast('Erro de comunicação com o servidor.', null);
                    });
            }
        }
    });
}
function fecharModalProduto() {
    document.getElementById('formularioAdicionarProduto').removeAttribute('data-editar');
    document.querySelector('.modal-adicionar').textContent = 'Adicionar';
    document.getElementById('formularioAdicionarProduto').reset();
    document.getElementById('sobreposicaoModal').style.display = 'none';
}
function abrirModalEditarProduto(idEstoque) {
    fetch(`/api/estoque/produtos?estoque_id=${idEstoque}`)
        .then(res => res.json())
        .then(produtos => {
            const prod = produtos[0];
            if (!prod) return;
            document.getElementById('sku').value = prod.sku || '';
            document.getElementById('nome').value = prod.nome || '';
            document.getElementById('quantidade').value = prod.quantidade || '';
            document.getElementById('localizacao').value = prod.loja_nome || '';
            document.getElementById('fornecedor').value = prod.fornecedor || '';
            document.getElementById('precoCompra').value = prod.preco_compra || '';
            document.getElementById('precoVenda').value = prod.preco_venda || '';
            atualizarClasseFilledSelectLocalizacao();
            document.getElementById('quantidade').setAttribute('readonly', true);
            document.querySelector('.modal-adicionar').textContent = 'Salvar';
            sobreposicaoModal.style.display = 'flex';
            formularioAdicionarProduto.setAttribute('data-editar', idEstoque);
        });
}

// ==============================
// 6. MENU LATERAL E NAVEGAÇÃO ENTRE SEÇÕES
// ==============================
for (let item of opcoesMenu) {
    item.addEventListener('click', function () {
        ativarMenu(this);
        const conteudo = this.getAttribute('data-conteudo');
        switch (conteudo) {
            case 'dashboard':
                mostrarSecao('secaoDashboard');
                break;
            case 'estoque':
                mostrarSecao('secaoEstoque');
                carregarEstoque();
                break;
            case 'movimentacao':
                mostrarSecao('secaoMovimentacao');
                carregarHistoricoMovimentacao();
                break;
            case 'entrada':
                mostrarSecao('secaoEntrada');
                carregarEntrada();
                break;
            case 'saida':
                mostrarSecao('secaoSaida');
                carregarSaida();
                break;
            case 'solicitacoes':
                mostrarSecao('secaoSolicitacoes');
                carregarSolicitacoes();
                break;
        }
    });
}
if (botaoGerenciarUsuario) {
    botaoGerenciarUsuario.addEventListener('click', function () {
        if (botaoGerenciarUsuario.classList.contains('botao-gerenciarusuario')) {
            mostrarSecao('secaoSolicitacoes');
            carregarGerenciarUsuarios();
            botaoGerenciarUsuario.textContent = 'Ver Solicitações';
            botaoGerenciarUsuario.classList.remove('botao-gerenciarusuario');
            botaoGerenciarUsuario.classList.add('botao-versolicitacao');
        } else {
            mostrarSecao('secaoSolicitacoes');
            carregarSolicitacoes();
            botaoGerenciarUsuario.textContent = 'Gerenciar Usuários';
            botaoGerenciarUsuario.classList.remove('botao-versolicitacao');
            botaoGerenciarUsuario.classList.add('botao-gerenciarusuario');
        }
    });
}

// ==============================
// 7. RESPONSIVIDADE E MENU
// ==============================
botaoMenu.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!ehMobile()) {
        barraLateral.classList.toggle('minimizada');
    }
});
window.addEventListener('resize', atualizarEstadoBarraLateral);
window.addEventListener('DOMContentLoaded', atualizarEstadoBarraLateral);
botaoMenu.addEventListener('click', function () {
    if (barraLateral.classList.contains('minimizada')) {
        logo.style.opacity = '0';
        logo.style.visibility = 'hidden';
    } else {
        logo.style.opacity = '1';
        logo.style.visibility = 'visible';
    }
});

// ==============================
// 8. SOLICITAÇÕES E GERENCIAMENTO DE USUÁRIOS
// ==============================
function carregarSolicitacoes() {
    fetch('/admin/usuarios/pendentes')
        .then(res => res.json())
        .then(usuarios => {
            const tabela = document.getElementById('tabelaSolicitacoes');
            if (!usuarios.length) {
                tabela.innerHTML = '<p style="text-align:center; color:var(--cor-principal); font-weight:600;">Nenhuma solicitação pendente.</p>';
                return;
            }
            const lojasFixas = [
                { id: 1, nome: 'Loja Principal' },
                { id: 2, nome: 'Loja 1' },
                { id: 3, nome: 'Loja 2' }
            ];
            tabela.innerHTML = `
    <div class="solicitacoes-lista">
        <div class="solicitacoes-header">
            <span>Nome</span>
            <span>Email</span>
            <span>Lojas</span>
            <span>Ações</span>
        </div>
        ${usuarios.map(u => {
                const lojasUsuario = u.lojas || [];
                const isAdmin = u.nivel_acesso === 'admin';
                return `
                <div class="solicitacao-item">
                    <span class="solicitacao-nome">${u.nome}</span>
                    <span class="solicitacao-email">${u.email}</span>
                    <span class="lojas-checkbox-group" data-id="${u.id}">
                        ${lojasFixas.map(loja => `
                            <label style="margin-right:10px;">
                                <input type="checkbox" value="${loja.id}"
                                    ${(isAdmin ? 'checked disabled' : (lojasUsuario.includes(loja.id) ? 'checked' : ''))}
                                    class="loja-checkbox" data-id="${u.id}">
                                ${loja.nome}
                            </label>
                        `).join('')}
                    </span>
                    <div class="btn-acoes">
                        <button class="aprovar-btn" data-id="${u.id}">Aprovar</button>
                        <button class="dispensar-btn" data-id="${u.id}">Dispensar</button>
                    </div>
                </div>
            `;
            }).join('')}
    </div>
`;

            tabela.querySelectorAll('.aprovar-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    // Verifica se pelo menos uma loja está marcada
                    const group = tabela.querySelector(`.lojas-checkbox-group[data-id="${id}"]`);
                    const checkboxes = group.querySelectorAll('.loja-checkbox');
                    const algumaMarcada = Array.from(checkboxes).some(cb => cb.checked);
                    if (!algumaMarcada) {
                        showToast('Selecione pelo menos uma loja para aprovar!');
                        return;
                    }
                    fetch(`/admin/usuarios/${id}/aprovar`, { method: 'POST' })
                        .then(res => res.json())
                        .then(() => carregarSolicitacoes());
                });
            });

            tabela.querySelectorAll('.dispensar-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    showToastConfirm('Tem certeza que deseja dispensar este usuário?', function (confirmado) {
                        if (confirmado) {
                            fetch(`/admin/usuarios/${id}/dispensar`, { method: 'POST' })
                                .then(res => res.json())
                                .then(() => carregarSolicitacoes());
                        }
                    });
                });
            });

            tabela.querySelectorAll('.nivel-acesso').forEach(sel => {
                sel.addEventListener('change', () => {
                    const id = sel.getAttribute('data-id');
                    fetch(`/admin/usuarios/${id}/nivel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nivel_acesso: sel.value })
                    });
                    const group = tabela.querySelector(`.lojas-checkbox-group[data-id="${id}"]`);
                    if (group) {
                        const checkboxes = group.querySelectorAll('.loja-checkbox');
                        if (sel.value === 'admin') {
                            checkboxes.forEach(cb => {
                                cb.checked = true;
                                cb.disabled = true;
                            });
                        } else {
                            checkboxes.forEach(cb => {
                                cb.disabled = false;
                            });
                        }
                        group.dispatchEvent(new Event('change'));
                    }
                });
            });

            tabela.querySelectorAll('.lojas-checkbox-group').forEach(group => {
                group.addEventListener('change', () => {
                    const id = group.getAttribute('data-id');
                    const checkboxes = group.querySelectorAll('.loja-checkbox');
                    const lojas = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));
                    fetch(`/admin/usuarios/${id}/lojas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lojas })
                    });
                });
            });
        });
}

function carregarGerenciarUsuarios() {
    fetch('/admin/usuarios/todos')
        .then(res => res.json())
        .then(usuarios => {
            usuarios = usuarios.filter(u => u.ativo);
            const tabela = document.getElementById('tabelaSolicitacoes');
            if (!usuarios.length) {
                tabela.innerHTML = '<p style="text-align:center; color:var(--cor-principal); font-weight:600;">Nenhum usuário cadastrado.</p>';
                return;
            }
            const lojasFixas = [
                { id: 1, nome: 'Loja Principal' },
                { id: 2, nome: 'Loja 1' },
                { id: 3, nome: 'Loja 2' }
            ];
            tabela.innerHTML = `
    <div class="solicitacoes-lista">
        <div class="solicitacoes-header">
            <span>Nome</span>
            <span>Email</span>
            <span>Lojas</span>
            <span>Ações</span>
        </div>
        ${usuarios.map(u => {
                const lojasUsuario = u.lojas || [];
                const isAdmin = u.nivel_acesso === 'admin';
                let cardClass = '';
                if (isAdmin) cardClass = 'card-admin';
                else cardClass = 'card-gerente';
                return `
                <div class="solicitacao-item ${cardClass}">
                    <span class="solicitacao-nome">${u.nome}</span>
                    <span class="solicitacao-email">${u.email}</span>
                    <span class="lojas-checkbox-group" data-id="${u.id}">
                        ${lojasFixas.map(loja => `
                            <label style="margin-right:10px;">
                                <input type="checkbox" value="${loja.id}"
                                    ${(isAdmin ? 'checked disabled' : (lojasUsuario.includes(loja.id) ? 'checked' : ''))}
                                    class="loja-checkbox" data-id="${u.id}">
                                ${loja.nome}
                            </label>
                        `).join('')}
                    </span>
                    <div class="btn-acoes">
                        ${isAdmin ? '' : `
                        <button class="salvar-btn" data-id="${u.id}">Salvar</button>
                        <button class="dispensar-btn" data-id="${u.id}">Excluir</button>
                        `}
                    </div>
                </div>
            `;
            }).join('')}
    </div>
`;

            tabela.querySelectorAll('.solicitacao-item').forEach(item => {
                const id = item.querySelector('.salvar-btn')?.getAttribute('data-id');
                if (!id) return;
                const salvarBtn = item.querySelector('.salvar-btn');
                const checkboxes = item.querySelectorAll('.loja-checkbox');
                const selectNivel = item.querySelector('.nivel-acesso');

                // Salva o estado inicial
                const estadoInicialCheckbox = Array.from(checkboxes).map(cb => cb.checked);
                const nivelInicial = selectNivel ? selectNivel.value : null;

                function verificarMudanca() {
                    const mudouCheckbox = Array.from(checkboxes).some((cb, idx) => cb.checked !== estadoInicialCheckbox[idx]);
                    const mudouNivel = selectNivel && selectNivel.value !== nivelInicial;
                    salvarBtn.disabled = !(mudouCheckbox || mudouNivel);
                }

                // Inicialmente desabilitado
                salvarBtn.disabled = true;

                checkboxes.forEach(cb => cb.addEventListener('change', verificarMudanca));
                if (selectNivel) selectNivel.addEventListener('change', verificarMudanca);
            });

            tabela.querySelectorAll('.dispensar-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    showToastConfirm('Tem certeza que deseja excluir este usuário?', function (confirmado) {
                        if (confirmado) {
                            fetch(`/admin/usuarios/${id}/dispensar`, { method: 'POST' })
                                .then(res => res.json())
                                .then(() => carregarGerenciarUsuarios());
                        }
                    });
                });
            });
            tabela.querySelectorAll('.salvar-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const nivel = tabela.querySelector(`.nivel-acesso[data-id="${id}"]`).value;
                    const group = tabela.querySelector(`.lojas-checkbox-group[data-id="${id}"]`);
                    const checkboxes = group.querySelectorAll('.loja-checkbox');
                    const lojas = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));

                    // Atualiza nível de acesso
                    fetch(`/admin/usuarios/${id}/nivel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nivel_acesso: nivel })
                    })
                        .then(res => res.json())
                        .then(() => {
                            // Atualiza lojas
                            fetch(`/admin/usuarios/${id}/lojas`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ lojas })
                            })
                                .then(res => res.json())
                                .then(() => {
                                    showToast('Alterações salvas com sucesso!');
                                    carregarGerenciarUsuarios(); // Atualiza a lista
                                });
                        });
                });
            });
            tabela.querySelectorAll('.nivel-acesso').forEach(sel => {
                sel.addEventListener('change', () => {
                    const id = sel.getAttribute('data-id');
                    fetch(`/admin/usuarios/${id}/nivel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nivel_acesso: sel.value })
                    });
                    const group = tabela.querySelector(`.lojas-checkbox-group[data-id="${id}"]`);
                    if (group) {
                        const checkboxes = group.querySelectorAll('.loja-checkbox');
                        if (sel.value === 'admin') {
                            checkboxes.forEach(cb => {
                                cb.checked = true;
                                cb.disabled = true;
                            });
                        } else {
                            checkboxes.forEach(cb => {
                                cb.disabled = false;
                            });
                        }
                        group.dispatchEvent(new Event('change'));
                    }
                });
            });
            tabela.querySelectorAll('.lojas-checkbox-group').forEach(group => {
                group.addEventListener('change', () => {
                    const id = group.getAttribute('data-id');
                    const checkboxes = group.querySelectorAll('.loja-checkbox');
                    const lojas = Array.from(checkboxes)
                        .filter(cb => cb.checked)
                        .map(cb => parseInt(cb.value));
                    fetch(`/admin/usuarios/${id}/lojas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lojas })
                    });
                });
            });
        });
}

// ==============================
// 9. ESTOQUE (Tabela, Filtros, Seletor de Loja)
// ==============================
function montarTabelaEstoque(produtos, filtro = '') {
    const tabela = document.getElementById('estoqueTabela');
    if (!tabela) return;
    let lista = produtos;
    if (filtro) {
        const f = filtro.toLowerCase();
        lista = produtos.filter(prod =>
            (prod.id_produto && String(prod.id_produto).toLowerCase().includes(f)) ||
            (prod.sku && prod.sku.toLowerCase().includes(f)) ||
            (prod.nome && prod.nome.toLowerCase().includes(f)) ||
            (prod.quantidade !== undefined && String(prod.quantidade).toLowerCase().includes(f)) ||
            (prod.fornecedor && prod.fornecedor.toLowerCase().includes(f)) ||
            (prod.preco_compra !== undefined && String(prod.preco_compra).toLowerCase().includes(f)) ||
            (prod.preco_venda !== undefined && String(prod.preco_venda).toLowerCase().includes(f)) ||
            (prod.data_registro && new Date(prod.data_registro).toLocaleDateString('pt-BR').toLowerCase().includes(f)) ||
            (prod.loja_nome && prod.loja_nome.toLowerCase().includes(f))
        );
    }
    if (!lista.length) {
        tabela.innerHTML = '<p style="text-align:center; color:var(--cor-principal); font-weight:600;">Nenhum produto encontrado.</p>';
        return;
    }
    if (!produtos.length) {
        tabela.innerHTML = '<p style="text-align:center; color:var(--cor-principal); font-weight:600;">Nenhum produto cadastrado nesta loja.</p>';
        return;
    }
    let html = `
        <div class="estoque-tabela">
            <div class="estoque-tabela-header">
                <div>ID</div>
                <div>SKU</div>
                <div>Nome</div>
                <div>Qtd</div>
                <div>Fornecedor</div>
                <div>Preço Compra</div>
                <div>Preço Venda</div>
                <div>Data Registro</div>
                <div>Loja</div>
                <div>Ações</div>
            </div>
                ${lista.map(prod => `
                    <div class="estoque-tabela-row estoque-loja-${prod.id_loja}" data-id="${prod.id_produto}" data-estoque-id="${prod.id_estoque_loja}">
                        <div><span class="estoque-label">ID: </span>${prod.id_produto}</div>
                        <div><span class="estoque-label">SKU: </span>${prod.sku}</div>
                        <div><span class="estoque-label">Nome: </span>${prod.nome}</div>
                        <div><span class="estoque-label">Qtd: </span>${prod.quantidade}</div>
                        <div><span class="estoque-label">Fornecedor: </span>${prod.fornecedor}</div>
                        <div><span class="estoque-label">Preço Compra: </span>R$ ${Number(prod.preco_compra).toFixed(2)}</div>
                        <div><span class="estoque-label">Preço Venda: </span>R$ ${Number(prod.preco_venda).toFixed(2)}</div>
                        <div><span class="estoque-label">Data Registro: </span>${new Date(prod.data_registro).toLocaleDateString()}</div>
                        <div><span class="estoque-label">Loja: </span>${prod.loja_nome}</div>
                        <div>
                            <button class="btn-editar-produto" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn-deletar-produto" title="Excluir"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `).join('')}
        </div>
    `;
    tabela.innerHTML = html;
    atualizarModoCardEstoque();
    tabela.querySelectorAll('.btn-deletar-produto').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = btn.closest('.estoque-tabela-row');
            const idEstoque = row.getAttribute('data-estoque-id');
            showToastConfirm('Deseja realmente excluir este produto?', confirmado => {
                if (confirmado) {
                    fetch(`/api/estoque/produtos/${idEstoque}`, { method: 'DELETE' })
                        .then(res => res.json())
                        .then(() => carregarEstoque());
                }
            });
        });
    });
    tabela.querySelectorAll('.btn-editar-produto').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = btn.closest('.estoque-tabela-row');
            const idEstoque = row.getAttribute('data-estoque-id');
            abrirModalEditarProduto(idEstoque);
        });
    });
}

function atualizarModoCardEstoque() {
    const tabela = document.querySelector('.estoque-tabela');
    if (!tabela) return;
    if (tabela.offsetWidth <= 789) {
        tabela.classList.add('modo-card');
    } else {
        tabela.classList.remove('modo-card');
    }
}

window.addEventListener('resize', atualizarModoCardEstoque);
window.addEventListener('DOMContentLoaded', atualizarModoCardEstoque);

function montarSeletorLoja(lojasUsuario, lojaSelecionadaId, onChange) {
    const selector = document.getElementById('estoque-loja-selector');
    if (!selector) return;
    const idsPermitidos = lojasUsuario.map(loja => loja.id);
    const lojasFixas = [
        { id: 1, nome: 'Loja Principal', icone: 'fa-shop' },
        { id: 2, nome: 'Loja 1', icone: 'fa-shop' },
        { id: 3, nome: 'Loja 2', icone: 'fa-shop' }
    ];
    let botoes = lojasFixas.map(loja => {
        const permitido = idsPermitidos.includes(loja.id);
        let classe = 'loja-btn';
        if (!permitido) {
            classe += ' loja-btn-inativo';
        } else if (lojaSelecionadaId === loja.id) {
            classe += ' loja-btn-filtrada';
        } else {
            classe += ' loja-btn-ativo';
        }
        return `
            <button 
                class="${classe}" 
                type="button" 
                title="${loja.nome}" 
                data-id="${loja.id}" 
                ${!permitido ? 'disabled' : ''}
            >
                <i class="fa-solid ${loja.icone}"></i>
            </button>
        `;
    }).join('');
    selector.innerHTML = botoes;
    selector.querySelectorAll('.loja-btn-ativo, .loja-btn-filtrada').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            if (lojaSelecionadaId === id) {
                onChange(null);
            } else {
                onChange(id);
            }
        });
    });
}
let lojasPermitidasGlobal = [];
let lojaSelecionadaIdGlobal = null;
function carregarEstoque() {
    fetch('/api/estoque/lojas')
        .then(res => res.json())
        .then(lojasUsuario => {
            lojasPermitidasGlobal = lojasUsuario.map(l => l.id);
            lojaSelecionadaIdGlobal = null;
            montarSeletorLoja(lojasUsuario, lojaSelecionadaIdGlobal, (novaLojaId) => {
                lojaSelecionadaIdGlobal = novaLojaId;
                montarSeletorLoja(lojasUsuario, lojaSelecionadaIdGlobal, arguments.callee);
                carregarProdutosDaLoja(lojaSelecionadaIdGlobal);
            });
            carregarProdutosDaLoja(lojaSelecionadaIdGlobal);
        });
}

let produtosEstoqueCache = [];
function carregarProdutosDaLoja(lojaId) {
    if (!lojaId) {
        Promise.all(lojasPermitidasGlobal.map(id =>
            fetch(`/api/estoque/produtos?loja=${id}`).then(res => res.json())
        )).then(arrays => {
            const produtos = [].concat(...arrays);
            produtosEstoqueCache = produtos;
            montarTabelaEstoque(produtos);
        });
    } else {
        fetch(`/api/estoque/produtos?loja=${lojaId}`)
            .then(res => res.json())
            .then(produtos => {
                produtosEstoqueCache = produtos;
                montarTabelaEstoque(produtos);
            });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const inputPesquisa = document.getElementById('estoque-pesquisa');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('input', function () {
            montarTabelaEstoque(produtosEstoqueCache, this.value);
        });
    }
});

// ==============================
// 10. ENTRADA DE PRODUTOS E TRANSFERÊNCIAS
// ==============================
function carregarEntrada() {
    document.getElementById('estoquePorLojaEntrada').innerHTML =
        '<p style="color:var(--cor-principal);margin:8px 0;">Selecione uma loja e produto para verificar o estoque por loja.</p>';
    fetch('/api/estoque/lojas')
        .then(res => res.json())
        .then(lojas => {
            const selectLoja = document.querySelector('#entrada-loja-origem');
            selectLoja.innerHTML = '<option value="" disabled selected hidden>Selecione</option>' +
                lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');
            selectLoja.onchange = function () {
                carregarProdutosEntrada(this.value);
            };
            const selectProd = document.querySelector('#entrada-produto');
            selectProd.innerHTML = '<option value="" disabled selected hidden>Selecione</option>';
        });
}
function carregarProdutosEntrada(lojaId) {
    document.getElementById('estoquePorLojaEntrada').innerHTML =
        '<p style="color:var(--cor-principal);margin:8px 0;">Selecione um produto para verificar o estoque por loja.</p>';
    fetch(`/api/estoque/produtos?loja=${lojaId}`)
        .then(res => res.json())
        .then(produtos => {
            const selectProd = document.querySelector('#entrada-produto');
            selectProd.innerHTML = '<option value="" disabled selected hidden>Selecione</option>' +
                produtos.map(p => `<option value="${p.id_estoque_loja}" data-id-produto="${p.id_produto}">${p.nome} (SKU: ${p.sku})</option>`).join('');
            selectProd.onchange = function () {
                const selectedOption = selectProd.options[selectProd.selectedIndex];
                const id_produto = selectedOption ? selectedOption.getAttribute('data-id-produto') : null;
                if (id_produto) {
                    mostrarEstoquePorLoja(id_produto);
                } else {
                    document.getElementById('estoquePorLojaEntrada').innerHTML =
                        '<p style="color:var(--cor-principal);margin:8px 0;">Selecione um produto para verificar o estoque por loja.</p>';
                }
            };

            const entradaFormContainer = document.querySelector('#entradaFormContainer');
            if (entradaFormContainer) entradaFormContainer.innerHTML = '';
        });
}

function mostrarEstoquePorLoja(id_produto) {
    fetch(`/api/estoque/produto/${id_produto}/por-loja`)
        .then(res => res.json())
        .then(dados => {
            const div = document.getElementById('estoquePorLojaEntrada');
            if (!dados.length) {
                div.innerHTML = '<p style="color:var(--cor-principal);margin:8px 0;">Produto não cadastrado em nenhuma loja.</p>';
                return;
            }
            div.innerHTML = `
                <div class="estoque-por-loja-lista">
                    <strong>Estoque por loja:</strong>
                    <ul>
                        ${dados.map(l => `<li>${l.loja_nome}: <b>${l.quantidade}</b></li>`).join('')}
                    </ul>
                </div>
            `;
        });
}

// ==============================
// 10.1. FORMULÁRIO DE ENTRADA/TRANSFERÊNCIA
// ==============================
const btnRegistrarEntrada = document.querySelector('#btn-registrar-entrada');
const btnTransferirEntrada = document.querySelector('#btn-transferir-entrada');
const entradaFormContainer = document.querySelector('#entradaFormContainer');

// Renderiza o formulário conforme o tipo
function renderizarFormEntrada(tipo) {
    if (!entradaFormContainer) return;
    if (tipo === 'entrada') {
        entradaFormContainer.innerHTML = `
            <form class="entrada-container" id="formEntrada" autocomplete="off">
                <div class="modal-campo">
                    <input type="number" id="entradaQuantidade" name="quantidade" min="1" placeholder=" " required>
                    <label for="entradaQuantidade">Quantidade</label>
                </div>
                <div class="entrada-form-acoes">
                    <button type="submit" class="btn-entrada" id="confirmarEntrada">Confirmar</button>
                    <button type="button" class="btn-entrada" id="cancelarEntrada">Cancelar</button>
                </div>
            </form>
        `;
    } else if (tipo === 'transferencia') {
        entradaFormContainer.innerHTML = `
            <form class="entrada-container" id="formEntrada" autocomplete="off">
                <div class="modal-campo">
                    <input type="number" id="entradaQuantidade" name="quantidade" min="1" placeholder=" " required>
                    <label for="entradaQuantidade">Quantidade</label>
                </div>
                <div class="modal-campo">
                    <select id="entradaLojaDestino" name="lojaDestino" required>
                        <option value="" disabled selected hidden></option>
                        <option value="1">Loja Principal</option>
                        <option value="2">Loja 1</option>
                        <option value="3">Loja 2</option>
                    </select>
                    <label for="entradaLojaDestino">Loja de Destino</label>
                </div>
                <div class="entrada-form-acoes">
                    <button type="submit" class="btn-entrada" id="confirmarEntrada">Confirmar</button>
                    <button type="button" class="btn-entrada" id="cancelarEntrada">Cancelar</button>
                </div>
            </form>
        `;
    } else {
        entradaFormContainer.innerHTML = '';
    }
    adicionarListenersFormEntrada(tipo);
    atualizarLabelFlutuanteEntrada();
}

// Adiciona listeners ao formulário renderizado
function adicionarListenersFormEntrada(tipo) {
    const formEntrada = document.querySelector('#formEntrada');
    const cancelarEntrada = document.querySelector('#cancelarEntrada');
    if (cancelarEntrada) {
        cancelarEntrada.addEventListener('click', () => {
            entradaFormContainer.innerHTML = '';
        });
    }
    if (formEntrada) {
        formEntrada.addEventListener('submit', (e) => {
            e.preventDefault();

            // NOVA VALIDAÇÃO: Loja de origem e produto obrigatórios
            const selectLojaOrigem = document.querySelector('#entrada-loja-origem');
            const selectProd = document.querySelector('#entrada-produto');
            const idLojaOrigem = selectLojaOrigem && selectLojaOrigem.value ? selectLojaOrigem.value : null;
            const idEstoque = selectProd && selectProd.value ? selectProd.value : null;

            if (!idLojaOrigem) {
                showToast('Selecione a loja de origem!');
                return;
            }
            if (!idEstoque) {
                showToast('Selecione um produto!');
                return;
            }

            const quantidade = Number(formEntrada.quantidade.value);

            if (tipo === 'entrada') {
                fetch('/api/estoque/entrada', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstoque, quantidade })
                })
                    .then(res => res.json())
                    .then(resposta => {
                        if (resposta.sucesso) {
                            showToast('Entrada registrada!');
                            entradaFormContainer.innerHTML = '';
                            carregarProdutosEntrada(idLojaOrigem);
                        } else {
                            showToast(resposta.erro || 'Erro ao registrar entrada.');
                        }
                    });
            } else if (tipo === 'transferencia') {
                const lojaDestino = formEntrada.lojaDestino.value;
                if (!lojaDestino) {
                    showToast('Selecione a loja de destino!');
                    return;
                }
                fetch('/api/estoque/transferencia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idEstoque, quantidade, lojaDestino })
                })
                    .then(res => res.json())
                    .then(resposta => {
                        if (resposta.sucesso) {
                            showToast('Transferência realizada!');
                            entradaFormContainer.innerHTML = '';
                            carregarProdutosEntrada(idLojaOrigem);
                        } else {
                            showToast(resposta.erro || 'Erro ao transferir.');
                        }
                    });
            }
        });
    }
}

// Função para ativar o efeito flutuante do label nos campos do formulário de entrada
function atualizarLabelFlutuanteEntrada() {
    // Para input number
    const inputQtd = document.querySelector('#entradaQuantidade');
    if (inputQtd) {
        inputQtd.addEventListener('blur', function () {
            if (this.value) {
                this.classList.add('filled');
            } else {
                this.classList.remove('filled');
            }
        });
    }
    // Para select loja destino (se existir)
    const selectLoja = document.querySelector('#entradaLojaDestino');
    if (selectLoja) {
        selectLoja.addEventListener('change', function () {
            if (this.value) {
                this.classList.add('filled');
            } else {
                this.classList.remove('filled');
            }
        });
    }
}

// Eventos dos botões principais
if (btnRegistrarEntrada) {
    btnRegistrarEntrada.addEventListener('click', (e) => {
        const selectLoja = document.querySelector('#entrada-loja-origem');
        const selectProd = document.querySelector('#entrada-produto');
        if (!selectLoja.value || !selectProd.value) {
            showToast('Selecione Loja de Origem e Produto!');
            e.preventDefault();
            return;
        }
        renderizarFormEntrada('entrada');
    });
}
if (btnTransferirEntrada) {
    btnTransferirEntrada.addEventListener('click', (e) => {
        const selectLoja = document.querySelector('#entrada-loja-origem');
        const selectProd = document.querySelector('#entrada-produto');
        if (!selectLoja.value || !selectProd.value) {
            showToast('Selecione Loja de Origem e Produto!');
            e.preventDefault();
            return;
        }
        renderizarFormEntrada('transferencia');
    });
}

// ==============================
// 11. CARREGAR SAIDAS
// ==============================
function carregarSaida() {
    // Mensagem inicial igual à entrada
    document.getElementById('estoquePorLojaSaida').innerHTML =
        '<p style="color:var(--cor-principal);margin:8px 0;">Selecione uma loja e produto para verificar o estoque por loja.</p>';
    // Limpa o formulário
    document.getElementById('saidaFormContainer').innerHTML = '';
    // Carrega lojas
    fetch('/api/estoque/lojas')
        .then(res => res.json())
        .then(lojas => {
            const selectLoja = document.getElementById('saida-loja');
            selectLoja.innerHTML = '<option value="" disabled selected hidden>Selecione</option>' +
                lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');
            selectLoja.onchange = function () {
                carregarProdutosSaida(this.value);
                // Limpa o formulário ao trocar de loja
                document.getElementById('saidaFormContainer').innerHTML = '';
            };
            // Limpa produtos ao trocar loja
            document.getElementById('saida-produto').innerHTML = '<option value="" disabled selected hidden>Selecione</option>';
        });
}

function carregarProdutosSaida(lojaId) {
    fetch(`/api/estoque/produtos?loja=${lojaId}`)
        .then(res => res.json())
        .then(produtos => {
            const selectProd = document.getElementById('saida-produto');
            selectProd.innerHTML = '<option value="" disabled selected hidden>Selecione</option>' +
                produtos.map(p => `<option value="${p.id_estoque_loja}" data-id-produto="${p.id_produto}">${p.nome} (SKU: ${p.sku})</option>`).join('');
            selectProd.onchange = function () {
                const selectedOption = selectProd.options[selectProd.selectedIndex];
                const id_produto = selectedOption ? selectedOption.getAttribute('data-id-produto') : null;
                if (id_produto) {
                    mostrarEstoquePorLojaSaida(id_produto);
                } else {
                    document.getElementById('estoquePorLojaSaida').innerHTML =
                        '<p style="color:var(--cor-principal);margin:8px 0;">Selecione um produto para verificar o estoque por loja.</p>';
                }
                // Some o formulário se trocar produto
                document.getElementById('saidaFormContainer').innerHTML = '';
            };
            // Limpa a lista ao trocar de loja
            document.getElementById('estoquePorLojaSaida').innerHTML =
                '<p style="color:var(--cor-principal);margin:8px 0;">Selecione um produto para verificar o estoque por loja.</p>';
        });
}

function mostrarEstoquePorLojaSaida(id_produto) {
    fetch(`/api/estoque/produto/${id_produto}/por-loja`)
        .then(res => res.json())
        .then(dados => {
            const div = document.getElementById('estoquePorLojaSaida');
            if (!dados.length) {
                div.innerHTML = '<p style="color:var(--cor-principal);margin:8px 0;">Produto não cadastrado em nenhuma loja.</p>';
                return;
            }
            div.innerHTML = `
                <div class="estoque-por-loja-lista">
                    <ul>
                        ${dados.map(l => `<li>${l.loja_nome}: <b>${l.quantidade}</b></li>`).join('')}
                    </ul>
                </div>
            `;
        });
}

// Renderiza o formulário de saída
function renderizarFormSaida() {
    const saidaFormContainer = document.getElementById('saidaFormContainer');
    saidaFormContainer.innerHTML = `
        <form class="entrada-container" id="formSaida" autocomplete="off">
            <div class="modal-campo">
                <input type="number" id="saidaQuantidade" name="quantidade" min="1" placeholder=" " required>
                <label for="saidaQuantidade">Quantidade</label>
            </div>
            <div class="entrada-form-acoes">
                <button type="submit" class="btn-entrada" id="confirmarSaida">Confirmar</button>
                <button type="button" class="btn-entrada" id="cancelarSaida">Cancelar</button>
            </div>
        </form>
    `;
    adicionarListenersFormSaida();
}

// Listeners do formulário de saída
function adicionarListenersFormSaida() {
    const formSaida = document.getElementById('formSaida');
    const cancelarSaida = document.getElementById('cancelarSaida');
    if (cancelarSaida) {
        cancelarSaida.addEventListener('click', () => {
            document.getElementById('saidaFormContainer').innerHTML = '';
        });
    }
    if (formSaida) {
        formSaida.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectLoja = document.getElementById('saida-loja');
            const selectProd = document.getElementById('saida-produto');
            const idLoja = selectLoja && selectLoja.value ? selectLoja.value : null;
            const idEstoque = selectProd && selectProd.value ? selectProd.value : null;
            if (!idLoja) {
                showToast('Selecione a loja!');
                return;
            }
            if (!idEstoque) {
                showToast('Selecione um produto!');
                return;
            }
            const quantidade = Number(formSaida.quantidade.value);
            fetch('/api/estoque/saida', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idEstoque, quantidade })
            })
                .then(res => res.json())
                .then(resposta => {
                    if (resposta.sucesso) {
                        showToast('Saída registrada!');
                        document.getElementById('saidaFormContainer').innerHTML = '';
                        carregarProdutosSaida(idLoja);
                    } else {
                        showToast(resposta.erro || 'Erro ao registrar saída.');
                    }
                });
        });
    }
}

// Evento do botão principal
document.addEventListener('DOMContentLoaded', function () {
    const btnRegistrarSaida = document.getElementById('btn-registrar-saida');
    if (btnRegistrarSaida) {
        btnRegistrarSaida.addEventListener('click', function (e) {
            const selectLoja = document.getElementById('saida-loja');
            const selectProd = document.getElementById('saida-produto');
            if (!selectLoja.value || !selectProd.value) {
                showToast('Selecione Loja e Produto!');
                e.preventDefault();
                return;
            }
            renderizarFormSaida();
        });
    }
});

// ==============================
// 12. MOVIMENTAÇÃO DE ESTOQUE
// ==============================
function carregarHistoricoMovimentacao() {
    fetch('/api/estoque/historico')
        .then(res => res.json())
        .then(historico => {
            const secao = document.getElementById('secaoMovimentacao');
            if (!secao) return;
            if (!historico.length) {
                secao.innerHTML = '<h1 class="titulosecao">Movimentação</h1><p class="subtitulo-secao">Nenhuma movimentação registrada.</p>';
                return;
            }
            secao.innerHTML = `
                <h1 class="titulosecao">Movimentação</h1>
                <p class="subtitulo-secao">Histórico das últimas ações no estoque.</p>
                <div class="historico-cards">
                    ${historico.map(item => `
                        <div class="historico-card historico-${item.tipo_acao}">
                            <div class="historico-cabecalho">
                                <span class="historico-tipo">${item.tipo_acao.toUpperCase()}</span>
                                <span class="historico-data">${new Date(item.data_acao).toLocaleString('pt-BR')}</span>
                            </div>
                            <div class="historico-info">
                                <b>Produto:</b> ${item.produto_nome || '-'} (SKU: ${item.sku || '-'})<br>
                                <b>Usuário:</b> ${item.usuario_nome || '-'}
                                ${item.quantidade ? `<br><b>Quantidade:</b> ${item.quantidade}` : ''}
                                ${item.loja_origem_nome ? `<br><b>Loja Origem:</b> ${item.loja_origem_nome}` : ''}
                                ${item.loja_destino_nome ? `<br><b>Loja Destino:</b> ${item.loja_destino_nome}` : ''}
                                ${item.detalhes ? `<br><b>Detalhes:</b> ${item.detalhes}` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        });
}

// ==============================
// 13. LOGOUT COM CONFIRMAÇÃO
// ==============================
botaoLogout.addEventListener('click', function () {
    showToastConfirm('Tem certeza que deseja sair?', function (confirmado) {
        if (confirmado) {
            window.location.href = '/login';
        }
    });
});
