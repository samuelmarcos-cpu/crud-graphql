const db = require('../../config/db')
const bcrypt = require('bcrypt-nodejs')
const { getUsuarioLogado } = require('../comum/usuario')

const table = 'usuarios'

module.exports = {
    async login(_, { dados }) {
        const usuario = await db('usuarios')
            .where({ email: dados.email })
            .first()
        if (!usuario) throw new Error('Usuário/Senha inválido')

        const saoIguais = bcrypt.compareSync(dados.senha, usuario.senha)
        if (!saoIguais) throw new Error('Usuário/Senha inválido')

        return getUsuarioLogado(usuario)
    },
    usuarios(parent, args, ctx) {
        ctx && ctx.validarAdmin()
        return db(table)
    },
    usuario(_, { filtro }, ctx) {
        ctx && ctx.validarUsuarioFiltro(filtro)
        const { id, email } = filtro
        if (!(id || email)) return null
        return db(table)
            .where(filtro)
            .first()
    }
}