const db = require('../../config/db')
const table = 'perfis'

module.exports = {
    async novoPerfil(_, { dados }, ctx) {
        ctx && ctx.validarAdmin()
        try {
            const u = await db(table)
                .insert(dados)
            return db(table)
                .where({ id: u[0] })
                .first()
        } catch (e) {
            throw new Error(e)
        }
    },
    async excluirPerfil(_, { filtro }, ctx) {
        ctx && ctx.validarAdmin()
        try {
            const perfil = await db(table)
                .where(filtro)
                .first()
            console.log(perfil)
            await db(table)
                .where({ id: perfil.id })
                .delete()
            return perfil
        } catch (e) {
            throw new Error(e)
        }
    },
    async alterarPerfil(_, { filtro, dados }, ctx) {
        ctx && ctx.validarAdmin()
        const { id, nome } = filtro
        if (!id && !nome) {
            throw new Error('Filtro inválido')
        }
        try {
            const p = await db(table)
                .where(filtro)
                .first()
            await db(table)
                .where({ id: p.id })
                .update(dados)
            return await db(table)
                .where({ id: p.id })
                .first()
        } catch (e) {
            throw new Error(e)
        }
    }
}