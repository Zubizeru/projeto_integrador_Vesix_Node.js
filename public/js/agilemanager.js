// ==============================
// ELEMENTOS PRINCIPAIS DA INTERFACE
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

// ==============================
// MODAL DE PRODUTO
// ==============================
if (botaoAbrirModal) {
    botaoAbrirModal.addEventListener('click', () => {
        sobreposicaoModal.style.display = 'flex';
    });
}
sobreposicaoModal.addEventListener('click', (e) => {
    if (e.target === sobreposicaoModal) {
        sobreposicaoModal.style.display = 'none';
    }
});
if (formularioAdicionarProduto) {
    formularioAdicionarProduto.addEventListener('submit', function (e) {
        e.preventDefault();
    });
}

// ==============================
// MENU LATERAL E SEÇÕES
// ==============================
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
                break;
            case 'movimentacao':
                mostrarSecao('secaoMovimentacao');
                break;
            case 'entrada':
                mostrarSecao('secaoEntrada');
                break;
            case 'saida':
                mostrarSecao('secaoSaida');
                break;
            case 'solicitacoes':
                mostrarSecao('secaoSolicitacoes');
                carregarSolicitacoes();
                break;
        }
    });
}

// ==============================
// GERENCIAR USUÁRIOS
// ==============================
if (botaoGerenciarUsuario) {
    botaoGerenciarUsuario.addEventListener('click', function () {
        mostrarSecao('secaoSolicitacoes');
        carregarGerenciarUsuarios();
    });
}

// ==============================
// RESPONSIVIDADE E MENU
// ==============================
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
// TEMA CLARO/ESCURO
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
// TOAST DE CONFIRMAÇÃO
// ==============================
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

// ==============================
// LOGOUT COM CONFIRMAÇÃO
// ==============================
botaoLogout.addEventListener('click', function () {
    showToastConfirm('Tem certeza que deseja sair?', function (confirmado) {
        if (confirmado) {
            window.location.href = '/login';
        }
    });
});

// ==============================
// MODAL PRODUTO - ERROS E VALIDAÇÃO
// ==============================
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
            formularioAdicionarProduto.reset();
            camposProduto.forEach(limparErroProduto);
        }
    });

    camposProduto.forEach(input => {
        input.addEventListener('input', () => {
            if (input.value) {
                input.classList.add('filled');
            } else {
                input.classList.remove('filled');
            }
            if (input.value && !(input.type === 'number' && input.value === '')) {
                limparErroProduto(input);
            }
        });
        if (input.value) input.classList.add('filled');
        else input.classList.remove('filled');
    });
}

function limparTodosErrosProduto() {
    camposProduto.forEach(limparErroProduto);
}

if (botaoCancelarModal) {
    botaoCancelarModal.addEventListener('click', () => {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        limparTodosErrosProduto();
    });
}
if (botaoFecharModal) {
    botaoFecharModal.addEventListener('click', () => {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        limparTodosErrosProduto();
        sobreposicaoModal.style.display = 'none';
    });
}
sobreposicaoModal.addEventListener('click', (e) => {
    if (e.target === sobreposicaoModal) {
        if (formularioAdicionarProduto) formularioAdicionarProduto.reset();
        limparTodosErrosProduto();
        sobreposicaoModal.style.display = 'none';
    }
});

// ==============================
// SOLICITAÇÕES DE USUÁRIOS PENDENTES
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
            <span>Nível</span>
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
                    <span>
                        <select data-id="${u.id}" class="nivel-acesso">
                            <option value="usuario" ${u.nivel_acesso === 'usuario' ? 'selected' : ''}>Usuário</option>
                            <option value="gerente" ${u.nivel_acesso === 'gerente' ? 'selected' : ''}>Gerente</option>
                            <option value="admin" ${u.nivel_acesso === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </span>
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

            // Eventos para aprovar usuário
            tabela.querySelectorAll('.aprovar-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    fetch(`/admin/usuarios/${id}/aprovar`, { method: 'POST' })
                        .then(res => res.json())
                        .then(() => carregarSolicitacoes());
                });
            });

            // Evento para dispensar usuário com confirmação
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

            // Evento para mudança de nível de acesso
            tabela.querySelectorAll('.nivel-acesso').forEach(sel => {
                sel.addEventListener('change', () => {
                    const id = sel.getAttribute('data-id');
                    fetch(`/admin/usuarios/${id}/nivel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nivel_acesso: sel.value })
                    });

                    // Se admin, marcar todas as lojas e desabilitar
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

            // Evento para alteração das lojas (exceto admin)
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
// GERENCIAMENTO DE TODOS OS USUÁRIOS
// ==============================
function carregarGerenciarUsuarios() {
    fetch('/admin/usuarios/todos')
        .then(res => res.json())
        .then(usuarios => {
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
            <span>Nível</span>
            <span>Lojas</span>
            <span>Ações</span>
        </div>
        ${usuarios.map(u => {
                const lojasUsuario = u.lojas || [];
                const isAdmin = u.nivel_acesso === 'admin';
                const isGerente = u.nivel_acesso === 'gerente';
                let cardClass = '';
                if (isAdmin) cardClass = 'card-admin';
                else if (isGerente) cardClass = 'card-gerente';
                else cardClass = 'card-usuario';
                return `
                <div class="solicitacao-item ${cardClass}">
                    <span class="solicitacao-nome">${u.nome}</span>
                    <span class="solicitacao-email">${u.email}</span>
                    <span>
                        <select data-id="${u.id}" class="nivel-acesso" ${isAdmin ? 'disabled' : ''}>
                            <option value="usuario" ${u.nivel_acesso === 'usuario' ? 'selected' : ''}>Usuário</option>
                            <option value="gerente" ${u.nivel_acesso === 'gerente' ? 'selected' : ''}>Gerente</option>
                            <option value="admin" ${u.nivel_acesso === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </span>
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

            // Evento para dispensar usuário com confirmação
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
            // Evento para mudança de nível de acesso
            tabela.querySelectorAll('.nivel-acesso').forEach(sel => {
                sel.addEventListener('change', () => {
                    const id = sel.getAttribute('data-id');
                    fetch(`/admin/usuarios/${id}/nivel`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nivel_acesso: sel.value })
                    });
                    // Se admin, marcar todas as lojas e desabilitar
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
            // Evento para alteração das lojas (exceto admin)
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
