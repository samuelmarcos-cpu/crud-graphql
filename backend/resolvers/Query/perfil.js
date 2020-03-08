const db = require('../../config/db')
const table = 'perfis'

module.exports = {
    perfis(parent, args, ctx) {
        ctx && ctx.validarAdmin()
        return db(table)
    },
    perfil(parent, { filtro }, ctx) {
        ctx && ctx.validarAdmin()
        const { id, nome } = filtro
        if (!(id || nome)) return null
        return db(table)
            .where(filtro)
            .first()
    }
}