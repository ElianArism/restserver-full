//imports
const jwt = require('jsonwebtoken'); 
//Middlewares

// ============================
//  Verificar Token
// ============================

let verificaToken = ( req, res, next ) => {

    //Obtener el token que viene en el header de la request
    let token = req.query.token ? req.query.token : req.get('token');

    //Verificar token 
    jwt.verify(token, process.env.SEED, (err, decoded_information) => { 
        
        //Unauthotized (401) si el token no es valido
        if(err) { 
            return res.status(401).json({
                ok: false, 
                err
            });
        }

        //recuperando informacion del usuario (despues de verificar el token)
        req.usuario = decoded_information.usuario; 
        next(); 
   
    }); 
}   


// ============================
//  Verificar Admin Role
// ============================

let verificarAdminRole = function( req, res, next ) {
    infoUsuario = req.usuario; 

    if(infoUsuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false, 
            msg: 'Rol invalido'
        });

    } else { 
        next();
    }
}




module.exports = {
    verificaToken, 
    verificarAdminRole,
}