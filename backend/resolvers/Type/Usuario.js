const db = require('../../config/db')

module.exports = {
    perfis(usuario) {
        if (usuario.notQuery) return usuario.perfis
        return db('usuarios_perfis')
            .select('id', 'nome', 'rotulo')
            .join(
                'perfis',
                'perfis.id',
                '=',
                'usuarios_perfis.perfil_id'
            )
            .where({ usuario_id: usuario.id })
    }
}