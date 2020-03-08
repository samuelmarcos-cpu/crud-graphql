const db = require('../../config/db')
const bcrypt = require('bcrypt-nodejs')

const mutations = {
    registrarUsuario: (_, { dados }) =>
        mutations.novoUsuario(_, { dados }),
    novoUsuario(_, { dados }, ctx) {
        ctx && ctx.validarAdmin()
        return db.transaction(trx => {
            if (!dados.perfis || !dados.perfis.length) {
                dados.perfis = [{ nome: 'comum' }]
            }
            // criptografar a senha
            if (dados.senha) {
                const salt = bcrypt.genSaltSync()
                dados.senha = bcrypt.hashSync(dados.senha, salt)
            }
            db('usuarios')
                .transacting(trx)
                .insert({
                    nome: dados.nome,
                    email: dados.email,
                    senha: dados.senha
                })
                .then(async res => {
                    if (!res) throw new Error('Usuario inexistente')
                    if (dados.perfis) {
                        const [id] = res
                        for (perfil of dados.perfis) {
                            const exist = await db('perfis')
                                .select('id')
                                .where(perfil)
                                .first()
                            if (!exist) throw new Error('Perfil inexistente')
                            await db('usuarios_perfis')
                                .transacting(trx)
                                .insert({
                                    usuario_id: id,
                                    perfil_id: exist.id
                                })
                        }
                    }
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
            .then(() => db('usuarios')
                .where({ email: dados.email })
                .first())
            .catch(e => {
                throw new Error(e)
            })
    },
    async excluirUsuario(_, { filtro }, ctx) {
        ctx && ctx.validarAdmin()
        const usuario = await db('usuarios')
            .where(filtro)
            .first()
        if (!usuario) throw new Error('Usuario não existi')
        usuario.perfis = await db('usuarios_perfis')
            .select('id', 'nome', 'rotulo')
            .join('perfis', 'perfis.id', '=', 'perfil_id')
            .where({ usuario_id: usuario.id })
        usuario.notQuery = true;
        if (usuario.perfis) {
            await db('usuarios_perfis')
                .where({ usuario_id: usuario.id })
                .delete()
        }
        await db('usuarios')
            .where(filtro)
            .delete()
        return usuario
    },
    alterarUsuario(_, { filtro, dados }, ctx) {
        ctx && ctx.validarUsuarioFiltro(filtro)
        // criptografar a senha
        if (dados.senha) {
            const salt = bcrypt.genSaltSync()
            dados.senha = bcrypt.hashSync(dados.senha, salt)
        }
        return db.transaction((trx) => {
            db('usuarios')
                .transacting(trx)
                .where(filtro)
                .update({
                    nome: dados.nome,
                    email: dados.email,
                    senha: dados.senha
                })
                .then(async () => { // exclui todos os perfis do usuario
                    const usuario = await db('usuarios')
                        .select('id')
                        .where(filtro)
                        .first()
                    await db('usuarios_perfis')
                        .transacting(trx)
                        .where({ usuario_id: usuario.id })
                        .delete()
                    if (ctx.admin && dados.perfis) {
                        for (perfil of dados.perfis) { // insere novos perfis
                            const pId = await db('perfis')
                                .select('id')
                                .where(perfil)
                                .first()
                            if (!pId) throw new Error('Perfil inexistente')
                            await db('usuarios_perfis')
                                .transacting(trx)
                                .insert({
                                    usuario_id: usuario.id,
                                    perfil_id: pId.id
                                })
                        }
                    }
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
            .then(() => db('usuarios')
                .where(filtro)
                .first())
            .catch(e => {
                throw new Error(e)
            })
    }
}

module.exports = mutations