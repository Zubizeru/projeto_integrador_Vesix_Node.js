document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    // Elementos para a tela de recuperação de senha
    const forgotBtn = document.querySelector(".forgot-btn");
    const voltarBtn = document.querySelector(".voltar-btn");
    const recSenha = document.querySelector(".recsenha");

    forgotBtn.addEventListener("click", (e) => {
        e.preventDefault();
        container.style.display = "none";
        recSenha.style.display = "flex";
    });

    voltarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        recSenha.style.display = "none";
        container.style.display = "flex";
    });

    // Elementos do formulário de login e cadastro
    const nomeLogin = document.getElementById('login-nome');
    const senhaLogin = document.getElementById('login-senha');
    const nomeCadastro = document.getElementById('cadastro-nome');
    const emailCadastro = document.getElementById('cadastro-email');
    const senhaCadastro = document.getElementById('cadastro-senha');
    const confirmarSenha = document.getElementById('cadastro-confirmar-senha');

    const loginForm = document.querySelector('.form-box.login form');
    const cadastroForm = document.querySelector('.form-box.register form');

    // Transição para o registro
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
        document.body.classList.add('register-active');
    });

    // Transição para o login
    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
        document.body.classList.remove('register-active');
    });

    // Mostrar/Ocultar senha
    const toggleIcons = document.querySelectorAll('.toggle-password');
    toggleIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');

            icon.classList.toggle('bx-show');
            icon.classList.toggle('bx-hide');
        });
    });

    // Inputs: adicionar classe 'filled' se tiver conteúdo
    document.querySelectorAll('.input-box input').forEach(input => {
        if (input.value.trim() !== '') {
            input.classList.add('filled');
        }
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                input.classList.add('filled');
            } else {
                input.classList.remove('filled');
            }
        });
    });

    /* -----------------------------------------------------
       Validação de formulários e funções de feedback de erro
    ----------------------------------------------------- */
    // Exibe mensagem de erro e adiciona classe 'erro' no label
    function showErrorMessage(input, mensagem) {
        let parent = input.parentElement;
        let errorElement = parent.nextElementSibling;

        const label = parent.querySelector('label');
        if (label) label.classList.add('erro');

        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('span');
            errorElement.classList.add('error-message');
            parent.parentElement.insertBefore(errorElement, parent.nextSibling);
        }
        errorElement.textContent = mensagem;
    }

    // Limpa mensagem de erro e remove classe 'erro' do label
    function clearErrorMessage(input) {
        let parent = input.parentElement;
        let errorElement = parent.nextElementSibling;

        const label = parent.querySelector('label');
        if (label) label.classList.remove('erro');

        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = '';
        }
    }

    function marcarErro(input, condicao, mensagem) {
        if (condicao) {
            input.classList.add('erro', 'bounce');
            input.focus();
            showErrorMessage(input, mensagem);
            setTimeout(() => input.classList.remove('bounce'), 750);
            return true;
        } else {
            input.classList.remove('erro');
            clearErrorMessage(input);
            return false;
        }
    }

    // Validação de Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let erro = false;

        erro |= marcarErro(nomeLogin, nomeLogin.value.trim() === '', 'Por favor, informe seu nome.');
        erro |= marcarErro(senhaLogin, senhaLogin.value.length < 6, 'A senha deve conter no mínimo 6 caracteres.');

        if (erro) {
            return;
        }

        

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nomeLogin.value,
                senha: senhaLogin.value
            })
        })
            .then(async res => {
                
                // Se for HTML, redireciona para a página recebida
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('text/html')) {
                    // Cria um blob com o HTML e redireciona
                    const html = await res.text();
                    document.open();
                    document.write(html);
                    document.close();
                } else {
                    // Se for JSON, mostra erro
                    const data = await res.json();
                    alert(data.error || 'Erro ao fazer login.');
                }
            })
            .catch(() => {
                
                alert('Erro ao fazer login.');
            });
    });

    // Validação de Cadastro
    cadastroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let erro = false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        erro |= marcarErro(nomeCadastro, nomeCadastro.value.trim() === '', 'Por favor, informe seu nome.');
        erro |= marcarErro(emailCadastro, !emailRegex.test(emailCadastro.value), 'Por favor, informe um email válido.');
        erro |= marcarErro(senhaCadastro, senhaCadastro.value.length < 6, 'A senha deve conter no mínimo 6 caracteres.');
        erro |= marcarErro(confirmarSenha, senhaCadastro.value !== confirmarSenha.value, 'As senhas não coincidem.');

        if (!erro) {
            
            fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeCadastro.value,
                    email: emailCadastro.value,
                    senha: senhaCadastro.value
                })
            })
                .then(res => res.json())
                .then(data => {
                    
                    if (data.success) {
                        alert(data.message);
                        cadastroForm.reset();
                        document.querySelectorAll('.input-box input').forEach(input => input.classList.remove('filled'));
                    } else {
                        alert(data.error || 'Erro ao cadastrar.');
                    }
                })
                .catch(() => {
                    
                    alert('Erro ao cadastrar.');
                });
        }
    });

    // Remoção de erro enquanto digita (Login)
    nomeLogin.addEventListener('input', () => {
        if (nomeLogin.value.trim() !== '') {
            nomeLogin.classList.remove('erro');
            clearErrorMessage(nomeLogin);
        }
    });
    senhaLogin.addEventListener('input', () => {
        if (senhaLogin.value.length >= 6) {
            senhaLogin.classList.remove('erro');
            clearErrorMessage(senhaLogin);
        }
    });

    // Remoção de erro enquanto digita (Cadastro)
    nomeCadastro.addEventListener('input', () => {
        if (nomeCadastro.value.trim() !== '') {
            nomeCadastro.classList.remove('erro');
            clearErrorMessage(nomeCadastro);
        }
    });
    emailCadastro.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(emailCadastro.value)) {
            emailCadastro.classList.remove('erro');
            clearErrorMessage(emailCadastro);
        }
    });
    senhaCadastro.addEventListener('input', () => {
        if (senhaCadastro.value.length >= 6) {
            senhaCadastro.classList.remove('erro');
            clearErrorMessage(senhaCadastro);
        }
    });
    confirmarSenha.addEventListener('input', () => {
        if (senhaCadastro.value === confirmarSenha.value) {
            confirmarSenha.classList.remove('erro');
            clearErrorMessage(confirmarSenha);
        }
    });
});