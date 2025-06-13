// ==============================
// IMPORTAÇÕES E CONFIGURAÇÕES
// ==============================
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const app = express();

// ==============================
// CONFIGURAÇÃO DO SERVIDOR E VIEW ENGINE
// ==============================
app.use(express.static(__dirname + '/public'));
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// ==============================
// MIDDLEWARES
// ==============================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ==============================
// CONEXÃO COM O BANCO DE DADOS
// ==============================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // sua senha
    database: 'estoque_vesix'
});

// ==============================
// ROTAS PRINCIPAIS
// ==============================

// Redireciona para a página de login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Renderiza a tela de login/cadastro
app.get('/login', (req, res) => {
    res.render('cadastrologin', { layout: 'auth' });
});

// ==============================
// ROTAS DE AUTENTICAÇÃO
// ==============================

// Cadastro de novo usuário (aguarda aprovação do admin)
app.post('/register', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    const hash = bcrypt.hashSync(senha, 10);
    db.query(
        'INSERT INTO usuario (nome, email, senha, loja, ativo) VALUES (?, ?, ?, ?, ?)',
        [nome, email, hash, 'Loja Principal', false],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email já cadastrado.' });
                }
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
            res.status(201).json({ success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' });
        }
    );
});

// Login de usuário
app.post('/login', (req, res) => {
    const { nome, senha } = req.body;
    // Detecta se é AJAX/fetch
    const isAjax = req.headers['content-type'] && req.headers['content-type'].includes('application/json');

    if (!nome || !senha) {
        if (isAjax) {
            return res.status(400).json({ error: 'Preencha todos os campos.' });
        }
        return res.render('cadastrologin', { layout: 'auth', error: 'Preencha todos os campos.' });
    }

    db.query('SELECT * FROM usuario WHERE nome = ?', [nome], (err, results) => {
        if (err) {
            if (isAjax) return res.status(500).json({ error: 'Erro no servidor.' });
            return res.status(500).send('Erro no servidor.');
        }
        if (results.length === 0) {
            if (isAjax) return res.status(401).json({ error: 'Usuário não encontrado.' });
            return res.render('cadastrologin', { layout: 'auth', error: 'Usuário não encontrado.' });
        }

        const usuario = results[0];
        if (!bcrypt.compareSync(senha, usuario.senha)) {
            if (isAjax) return res.status(401).json({ error: 'Senha incorreta.' });
            return res.render('cadastrologin', { layout: 'auth', error: 'Senha incorreta.' });
        }

        if (!usuario.ativo || usuario.ativo === 0 || usuario.ativo === '0') {
            return res.render('aguarde_aprovacao', { layout: 'auth', nome: usuario.nome });
        }

        res.render('agilemanager', {
            layout: 'main',
            usuario,
            usuarioEhAdmin: usuario.nivel_acesso === 'admin'
        });
    });
});

// ==============================
// ROTAS ADMINISTRATIVAS
// ==============================

// 1. Listar usuários pendentes (ativo = FALSE)
app.get('/admin/usuarios/pendentes', (req, res) => {
    db.query(
        `SELECT u.id, u.nome, u.email, u.nivel_acesso, u.ativo,
                GROUP_CONCAT(l.nome) AS lojas
         FROM usuario u
         LEFT JOIN usuario_loja ul ON u.id = ul.usuario_id
         LEFT JOIN loja l ON ul.loja_id = l.id
         WHERE u.ativo = FALSE
         GROUP BY u.id`,
        (err, results) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
            res.json(results);
        }
    );
});

// 2. Aprovar usuário (mudar ativo para TRUE)
app.post('/admin/usuarios/:id/aprovar', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE usuario SET ativo = TRUE WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao aprovar usuário.' });
        res.json({ success: true });
    });
});

// 3. Alterar nível de acesso
app.post('/admin/usuarios/:id/nivel', (req, res) => {
    const { id } = req.params;
    const { nivel_acesso } = req.body;
    db.query('UPDATE usuario SET nivel_acesso = ? WHERE id = ?', [nivel_acesso, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar nível de acesso.' });
        res.json({ success: true });
    });
});

// 4. Alterar lojas do usuário
app.post('/admin/usuarios/:id/lojas', (req, res) => {
    const { id } = req.params;
    const { lojas } = req.body; // lojas = [1,2,3]
    db.query('DELETE FROM usuario_loja WHERE usuario_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Erro ao remover lojas antigas.' });
        if (!lojas || lojas.length === 0) return res.json({ success: true });
        const values = lojas.map(loja_id => [id, loja_id]);
        db.query('INSERT INTO usuario_loja (usuario_id, loja_id) VALUES ?', [values], (err2) => {
            if (err2) return res.status(500).json({ error: 'Erro ao adicionar novas lojas.' });
            res.json({ success: true });
        });
    });
});

// ==============================
// INICIALIZAÇÃO DO SERVIDOR
// ==============================
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});