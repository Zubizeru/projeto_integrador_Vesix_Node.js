// ==============================
// IMPORTAÇÕES E CONFIGURAÇÕES
// ==============================
const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const app = express();
const session = require('express-session');

// ==============================
// CONFIGURAÇÃO DO SESSION
// ==============================
app.use(session({
    secret: 'seuSegredoSuperSecreto',
    resave: false,
    saveUninitialized: false
}));

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
    const { nome, email, senha, lojas } = req.body; // lojas deve ser um array de ids
    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    const hash = bcrypt.hashSync(senha, 10);
    db.query(
        'INSERT INTO usuario (nome, email, senha, ativo) VALUES (?, ?, ?, ?)',
        [nome, email, hash, false],
        (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'Email já cadastrado.' });
                }
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
            const userId = result.insertId;
            if (lojas && lojas.length > 0) {
                const values = lojas.map(loja_id => [userId, loja_id]);
                db.query('INSERT INTO usuario_loja (usuario_id, loja_id) VALUES ?', [values], (err2) => {
                    if (err2) return res.status(500).json({ error: 'Erro ao cadastrar lojas.' });
                    res.status(201).json({ success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' });
                });
            } else {
                res.status(201).json({ success: true, message: 'Cadastro realizado! Aguarde aprovação do administrador.' });
            }
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

        req.session.usuario_id = usuario.id;

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
                GROUP_CONCAT(ul.loja_id) as lojas
         FROM usuario u
         LEFT JOIN usuario_loja ul ON u.id = ul.usuario_id
         WHERE u.ativo = FALSE
         GROUP BY u.id`,
        (err, results) => {
            if (err) return res.status(500).json([]);
            const usuarios = results.map(u => ({
                ...u,
                lojas: u.lojas ? u.lojas.split(',').map(Number) : []
            }));
            res.json(usuarios);
        }
    );
});

// 2. Aprovar usuário (mudar ativo para TRUE)
app.post('/admin/usuarios/:id/aprovar', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE usuario SET ativo = TRUE, nivel_acesso = "gerente" WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao aprovar usuário.' });
        res.json({ success: true });
    });
});

// 3. Alterar nível de acesso
app.post('/admin/usuarios/:id/nivel', (req, res) => {
    const { id } = req.params;
    db.query('SELECT nivel_acesso FROM usuario WHERE id = ?', [id], (err, rows) => {
        if (err || !rows.length) return res.status(500).json({ error: 'Usuário não encontrado.' });
        if (rows[0].nivel_acesso === 'admin') return res.json({ success: true });
        db.query('UPDATE usuario SET nivel_acesso = "gerente" WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: 'Erro ao atualizar nível de acesso.' });
            res.json({ success: true });
        });
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

// 5. Rota para dispensar (deletar) usuário
app.post('/admin/usuarios/:id/dispensar', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM usuario WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erro ao dispensar usuário.' });
        res.json({ success: true });
    });
});

// 6. Listar todos os usuários (ativos e inativos)
app.get('/admin/usuarios/todos', (req, res) => {
    db.query(
        `SELECT u.id, u.nome, u.email, u.nivel_acesso, u.ativo, 
                GROUP_CONCAT(ul.loja_id) as lojas
         FROM usuario u
         LEFT JOIN usuario_loja ul ON u.id = ul.usuario_id
         GROUP BY u.id`,
        (err, results) => {
            if (err) return res.status(500).json([]);
            const usuarios = results.map(u => ({
                ...u,
                lojas: u.lojas ? u.lojas.split(',').map(Number) : []
            }));
            res.json(usuarios);
        }
    );
});

// ==============================
// ROTAS DE ENVIO DE PRODUTOS
// ==============================

app.post('/produtos', (req, res) => {
    const { nome, sku, precoCompra, fornecedor, localizacao, quantidade, precoVenda } = req.body;
    const usuario_id = req.session.usuario_id || null;

    // 0. Verifica se o SKU já existe
    db.query('SELECT id_produto FROM Produto WHERE sku = ?', [sku], (err, rows) => {
        if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao verificar SKU.' });
        if (rows.length > 0) {
            return res.status(400).json({ sucesso: false, erro: 'Produto já cadastrado com este SKU.' });
        }

        // 1. Inserir Produto diretamente com fornecedor_nome
        db.query(
            'INSERT INTO Produto (nome, sku, preco_compra, fornecedor_nome) VALUES (?, ?, ?, ?)',
            [nome, sku, precoCompra, fornecedor],
            (err3, resultProd) => {
                if (err3) return res.status(500).json({ sucesso: false, erro: 'Erro ao inserir produto.' });
                const id_produto = resultProd.insertId;

                // 2. Buscar id_loja
                db.query('SELECT id FROM loja WHERE nome = ?', [localizacao], (err4, lojaRows) => {
                    if (err4 || lojaRows.length === 0) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar loja.' });
                    const id_loja = lojaRows[0].id;

                    // 3. Inserir estoque_loja
                    db.query(
                        'INSERT INTO estoque_loja (id_produto, id_loja, quantidade, preco_venda) VALUES (?, ?, ?, ?)',
                        [id_produto, id_loja, quantidade, precoVenda],
                        (err5, resultEstoque) => {
                            if (err5) return res.status(500).json({ sucesso: false, erro: 'Erro ao inserir estoque.' });

                            // 4. Registrar no histórico
                            db.query(
                                'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_estoque_loja, id_loja_origem, quantidade, usuario_id, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                [
                                    'adicao',
                                    id_produto,
                                    resultEstoque.insertId,
                                    id_loja,
                                    quantidade,
                                    usuario_id,
                                    JSON.stringify({ nome, sku })
                                ],
                                () => res.json({ sucesso: true })
                            );
                        }
                    );
                });
            }
        );
    });
});

// 1. Lojas do usuário
app.get('/api/estoque/lojas', (req, res) => {
    if (!req.session.usuario_id) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    const usuarioId = req.session.usuario_id;
    db.query(
        `SELECT l.id, l.nome 
         FROM loja l
         INNER JOIN usuario_loja ul ON ul.loja_id = l.id
         WHERE ul.usuario_id = ?`,
        [usuarioId],
        (err, rows) => {
            if (err) return res.status(500).json([]);
            res.json(rows);
        }
    );
});

// 2. Produtos da loja
app.get('/api/estoque/produtos', (req, res) => {
    const estoqueId = req.query.estoque_id;
    const lojaId = req.query.loja;

    let sql = `
    SELECT 
        p.id_produto, p.sku, p.nome, 
        el.quantidade, 
        p.fornecedor_nome as fornecedor, 
        p.preco_compra, 
        el.preco_venda, 
        el.data_registro,
        l.nome as loja_nome,
        el.id_loja,
        el.id as id_estoque_loja
    FROM estoque_loja el
    INNER JOIN Produto p ON p.id_produto = el.id_produto
    INNER JOIN loja l ON l.id = el.id_loja
    `;
    let params = [];

    if (estoqueId) {
        sql += ' WHERE el.id = ?';
        params.push(estoqueId);
    } else if (lojaId) {
        sql += ' WHERE el.id_loja = ?';
        params.push(lojaId);
    }

    sql += ' ORDER BY el.data_registro DESC';

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

app.put('/api/estoque/produtos/:id_estoque', (req, res) => {
    const idEstoque = req.params.id_estoque;
    const { nome, sku, precoCompra, fornecedor, localizacao, quantidade, precoVenda } = req.body;
    const usuario_id = req.session.usuario_id;

    // Busca o id_produto atual
    db.query(
        `SELECT el.id_produto
         FROM estoque_loja el 
         INNER JOIN Produto p ON p.id_produto = el.id_produto 
         WHERE el.id = ?`,
        [idEstoque],
        (err, rows) => {
            if (err || !rows.length) return res.status(500).json({ sucesso: false, erro: 'Produto não encontrado.' });

            const id_produto = rows[0].id_produto;

            // Busca o id da loja pelo nome (localizacao)
            db.query('SELECT id FROM loja WHERE nome = ?', [localizacao], (errL, lojaRows) => {
                if (errL || lojaRows.length === 0) return res.status(500).json({ sucesso: false, erro: 'Loja não encontrada.' });
                const id_loja = lojaRows[0].id;

                // Atualiza Produto (incluindo fornecedor_nome)
                db.query(
                    'UPDATE Produto SET nome=?, sku=?, preco_compra=?, fornecedor_nome=? WHERE id_produto=?',
                    [nome, sku, precoCompra, fornecedor, id_produto],
                    (err2) => {
                        if (err2) return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar produto.' });

                        // Atualiza estoque_loja
                        db.query(
                            'UPDATE estoque_loja SET quantidade=?, preco_venda=?, id_loja=? WHERE id=?',
                            [quantidade, precoVenda, id_loja, idEstoque],
                            (err3) => {
                                if (err3) return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar estoque.' });

                                // REGISTRA NO HISTÓRICO
                                db.query(
                                    'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_estoque_loja, id_loja_origem, quantidade, usuario_id, detalhes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                                    [
                                        'edicao',
                                        id_produto,
                                        idEstoque,
                                        id_loja,
                                        quantidade,
                                        usuario_id,
                                        JSON.stringify({ nome, sku })
                                    ],
                                    () => res.json({ sucesso: true })
                                );
                            }
                        );
                    }
                );
            });
        }
    );
});

// Deletar produto do estoque (excluir estoque_loja)
app.delete('/api/estoque/produtos/:id_estoque', (req, res) => {
    const idEstoque = req.params.id_estoque;
    const usuario_id = req.session.usuario_id;

    // Busca dados antes de deletar
    db.query('SELECT id_produto, id_loja, quantidade FROM estoque_loja WHERE id = ?', [idEstoque], (err, rows) => {
        if (err || !rows.length) return res.status(404).json({ sucesso: false, erro: 'Estoque não encontrado.' });
        const { id_produto, id_loja, quantidade } = rows[0];

        // Deleta o estoque
        db.query('DELETE FROM estoque_loja WHERE id = ?', [idEstoque], (err2) => {
            if (err2) return res.status(500).json({ sucesso: false, erro: 'Erro ao excluir estoque.' });

            // REGISTRA NO HISTÓRICO
            db.query(
                'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_estoque_loja, id_loja_origem, quantidade, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    'exclusao',
                    id_produto,
                    idEstoque,
                    id_loja,
                    quantidade,
                    usuario_id
                ],
                () => res.json({ sucesso: true })
            );
        });
    });
});

// ==============================
// ROTAS DE HISTÓRICO DE ESTOQUE
// ==============================
app.get('/api/estoque/historico', (req, res) => {
    db.query(`
        SELECT h.*, u.nome as usuario_nome, p.nome as produto_nome, p.sku, l1.nome as loja_origem_nome, l2.nome as loja_destino_nome
        FROM Historico_Estoque h
        LEFT JOIN usuario u ON h.usuario_id = u.id
        LEFT JOIN Produto p ON h.id_produto = p.id_produto
        LEFT JOIN loja l1 ON h.id_loja_origem = l1.id
        LEFT JOIN loja l2 ON h.id_loja_destino = l2.id
        ORDER BY h.data_acao DESC
        LIMIT 100
    `, (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

// Registrar entrada de produto (aumentar quantidade em estoque_loja)
app.post('/api/estoque/entrada', (req, res) => {
    const { idEstoque, quantidade } = req.body;
    const usuario_id = req.session.usuario_id;
    if (!idEstoque || !quantidade || quantidade <= 0) {
        return res.status(400).json({ sucesso: false, erro: 'Dados inválidos.' });
    }
    db.query(
        'UPDATE estoque_loja SET quantidade = quantidade + ? WHERE id = ?',
        [quantidade, idEstoque],
        (err, result) => {
            if (err) return res.status(500).json({ sucesso: false, erro: 'Erro ao registrar entrada.' });

            // Busca dados para registrar no histórico
            db.query('SELECT id_produto, id_loja FROM estoque_loja WHERE id = ?', [idEstoque], (err2, rows) => {
                if (err2 || !rows.length) return res.json({ sucesso: true }); // estoque atualizado, mas não registrou histórico
                const { id_produto, id_loja } = rows[0];
                db.query(
                    'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_estoque_loja, id_loja_origem, quantidade, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                    ['entrada', id_produto, idEstoque, id_loja, quantidade, usuario_id],
                    () => res.json({ sucesso: true })
                );
            });
        }
    );
});

// Transferir produto de uma loja para outra
app.post('/api/estoque/transferencia', (req, res) => {
    const { idEstoque, quantidade, lojaDestino } = req.body;
    const usuario_id = req.session.usuario_id;
    if (!idEstoque || !quantidade || quantidade <= 0 || !lojaDestino) {
        return res.status(400).json({ sucesso: false, erro: 'Dados inválidos.' });
    }

    db.query('SELECT id_produto, id_loja FROM estoque_loja WHERE id = ?', [idEstoque], (err, rows) => {
        if (err || !rows.length) return res.status(400).json({ sucesso: false, erro: 'Estoque de origem não encontrado.' });
        const { id_produto, id_loja } = rows[0];

        db.query('SELECT quantidade, preco_venda FROM estoque_loja WHERE id = ?', [idEstoque], (err2, rows2) => {
            if (err2 || !rows2.length) return res.status(400).json({ sucesso: false, erro: 'Estoque não encontrado.' });
            if (rows2[0].quantidade < quantidade) {
                return res.status(400).json({ sucesso: false, erro: 'Quantidade insuficiente para transferência.' });
            }
            const preco_venda = rows2[0].preco_venda;

            // Remove do estoque origem
            db.query('UPDATE estoque_loja SET quantidade = quantidade - ? WHERE id = ?', [quantidade, idEstoque], (err3) => {
                if (err3) return res.status(500).json({ sucesso: false, erro: 'Erro ao debitar estoque de origem.' });

                // Verifica se já existe estoque_loja para o produto na loja destino
                db.query('SELECT id FROM estoque_loja WHERE id_produto = ? AND id_loja = ?', [id_produto, lojaDestino], (err4, rows4) => {
                    if (err4) return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar estoque destino.' });

                    const finalizar = () => {
                        // Registra no histórico de movimentação
                        db.query(
                            'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_loja_origem, id_loja_destino, quantidade, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                            ['transferencia', id_produto, id_loja, lojaDestino, quantidade, usuario_id],
                            () => res.json({ sucesso: true })
                        );
                    };

                    if (rows4.length > 0) {
                        // Já existe: soma a quantidade
                        db.query('UPDATE estoque_loja SET quantidade = quantidade + ? WHERE id = ?', [quantidade, rows4[0].id], (err5) => {
                            if (err5) return res.status(500).json({ sucesso: false, erro: 'Erro ao creditar estoque destino.' });
                            finalizar();
                        });
                    } else {
                        // Não existe: cria novo registro
                        db.query(
                            'INSERT INTO estoque_loja (id_produto, id_loja, quantidade, preco_venda) VALUES (?, ?, ?, ?)',
                            [id_produto, lojaDestino, quantidade, preco_venda],
                            (err6) => {
                                if (err6) return res.status(500).json({ sucesso: false, erro: 'Erro ao criar estoque destino.' });
                                finalizar();
                            }
                        );
                    }
                });
            });
        });
    });
});

app.get('/api/estoque/produto/:id_produto/por-loja', (req, res) => {
    const { id_produto } = req.params;
    db.query(
        `SELECT el.quantidade, l.nome AS loja_nome
         FROM estoque_loja el
         INNER JOIN loja l ON l.id = el.id_loja
         WHERE el.id_produto = ?`,
        [id_produto],
        (err, rows) => {
            if (err) return res.status(500).json({ erro: 'Erro ao buscar estoque por loja.' });
            res.json(rows);
        }
    );
});

// Registrar saída de produto (baixar quantidade em estoque_loja)
app.post('/api/estoque/saida', (req, res) => {
    const { idEstoque, quantidade } = req.body;
    const usuario_id = req.session.usuario_id;
    if (!idEstoque || !quantidade || quantidade <= 0) {
        return res.status(400).json({ sucesso: false, erro: 'Dados inválidos.' });
    }
    db.query('SELECT id_produto, id_loja, quantidade FROM estoque_loja WHERE id = ?', [idEstoque], (err, rows) => {
        if (err || !rows.length) return res.status(400).json({ sucesso: false, erro: 'Estoque não encontrado.' });
        if (rows[0].quantidade < quantidade) {
            return res.status(400).json({ sucesso: false, erro: 'Quantidade insuficiente em estoque.' });
        }
        const { id_produto, id_loja } = rows[0];
        db.query('UPDATE estoque_loja SET quantidade = quantidade - ? WHERE id = ?', [quantidade, idEstoque], (err2) => {
            if (err2) return res.status(500).json({ sucesso: false, erro: 'Erro ao registrar saída.' });

            // REGISTRA NO HISTÓRICO
            db.query(
                'INSERT INTO Historico_Estoque (tipo_acao, id_produto, id_estoque_loja, id_loja_origem, quantidade, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                ['saida', id_produto, idEstoque, id_loja, quantidade, usuario_id],
                () => res.json({ sucesso: true })
            );
        });
    });
});

// ==============================
// INICIALIZAÇÃO DO SERVIDOR
// ==============================
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});