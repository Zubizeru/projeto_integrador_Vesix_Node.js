// Elementos principais
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

// Modal Adicionar Produto
if (botaoAbrirModal) {
    botaoAbrirModal.addEventListener('click', () => {
        sobreposicaoModal.style.display = 'flex';
    });
}
// Fechar ao clicar fora do modal
sobreposicaoModal.addEventListener('click', (e) => {
    if (e.target === sobreposicaoModal) {
        sobreposicaoModal.style.display = 'none';
    }
});
// Prevenir submit real
formularioAdicionarProduto.addEventListener('submit', function (e) {
    e.preventDefault();
});

// Ativar menu
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

// Minimizar/Maximizar barra lateral (apenas desktop/tablet)
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

// Tema claro/escuro
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

// Logout
botaoLogout.addEventListener('click', function () {
    if (confirm('Tem certeza que deseja sair?')) {
        window.location.href = '/login';
    }
});

// Responsividade
window.addEventListener('resize', atualizarEstadoBarraLateral);
window.addEventListener('DOMContentLoaded', atualizarEstadoBarraLateral);

// Garante que ao minimizar, o botão hamburger sempre fique clicável e centralizado
// e que ao maximizar, a logo volte a aparecer
botaoMenu.addEventListener('click', function () {
    if (barraLateral.classList.contains('minimizada')) {
        logo.style.opacity = '0';
        logo.style.visibility = 'hidden';
    } else {
        logo.style.opacity = '1';
        logo.style.visibility = 'visible';
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

if (formularioAdicionarProduto) {
    formularioAdicionarProduto.addEventListener('submit', function (e) {
        e.preventDefault(); // Sempre previne o envio/fechamento do modal
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
        // O modal nunca fecha aqui!
    });

    // Efeito label flutuante e limpa erro ao digitar/selecionar
    camposProduto.forEach(input => {
        input.addEventListener('input', () => {
            // Efeito label flutuante
            if (input.tagName === 'SELECT') {
                if (input.value) {
                    input.classList.add('filled');
                } else {
                    input.classList.remove('filled');
                }
            } else {
                if (input.value) {
                    input.classList.add('filled');
                } else {
                    input.classList.remove('filled');
                }
            }
            // Limpa erro ao digitar/selecionar
            if (input.value && !(input.type === 'number' && input.value === '')) {
                limparErroProduto(input);
            }
        });
        // Inicializa estado ao carregar
        if (input.value) input.classList.add('filled');
        else input.classList.remove('filled');
    });
}

// Função para limpar todos os erros dos campos do produto
function limparTodosErrosProduto() {
    camposProduto.forEach(limparErroProduto);
}

// Ao cancelar ou fechar, limpa os erros também
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

function carregarSolicitacoes() {
    fetch('/admin/usuarios/pendentes')
        .then(res => res.json())
        .then(usuarios => {
            const tabela = document.getElementById('tabelaSolicitacoes');
            if (!usuarios.length) {
                tabela.innerHTML = '<p style="text-align:center; color:var(--cor-principal); font-weight:600;">Nenhuma solicitação pendente.</p>';
                return;
            }
            // Opções fixas de loja
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

