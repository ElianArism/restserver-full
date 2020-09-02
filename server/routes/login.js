const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

// Google imports 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


app.post('/login', function(req, res) {
    let body = req.body; 
    //Buscar usuario
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        
        //err de BD
        if (err) { 
            return res.status(500).json({
                ok: false,
                err
            }); 
        }

        //Usuario no existe
        if(!usuarioDB) { 
            return res.status(404).json({
                ok: false,
                err: {
                    message: '[Usuario] o password incorrectos'
                }
            }); 
        }
    
        //Verificar password con metodo de bcrypt
        if (!bcrypt.compareSync(body.password , usuarioDB.password) )  { 
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o [password] incorrectos'
                }
            }); 
        }

        //Generar un token 
        let token = jwt.sign({
            usuario: usuarioDB 
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN } );


        //Si todo es valido
        return res.json({
            ok: true, 
            usuario: usuarioDB, 
            token
        });
    
    });
});


//Configuraciones de Google Sign in 

//Verifica el token enviado como parametro
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  
        
        // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    

    //Si es correcto envia la informacion del usuario de google en un JSON
    return { 
        nombre: payload.name,
        email: payload.email,
        img: payload.picture, 
        google: true
    } 

}

//Obtiene los datos del usuario de google
app.post('/google', async function(req, res) {
    //Obtener el idtoken
    let token = req.body.idtoken;

    //Obtener los datos de usuario y almarcenarlos en una variable
    let googleUser = await verify(token) 

    //Si ocurre algun error de autenticacion durante la promise
        .catch(err => { 
            return res.status(403).json({
                ok: false, 
                err
            }); 
        });
    
    
    // Comprobar que en la BD no exista nadie con ese email 

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        //Internal sv error
        if (err) { 
            return res.status(500).json({
                ok: false,
                err
            }); 
        }

        //Si el email ya se encuentra registrado en la bd 
        if(usuarioDB) { 

            //Si no se registro por google
            if(!usuarioDB.google) { 
                res.status(400).json({
                    err: {msg: 'Debe usar su autenticacion normal. '}
                });
            } else { 
                
                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED , { expiresIn: process.env.CADUCIDAD_TOKEN } );
                
                res.json({
                    ok: true,
                    usuario: googleUser,
                    token
                });
            }
        
        //Si no existe en la bd, debe crearse
        } else { 
            let usuario = new Usuario(); 

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'; 

            // una vez creado el objeto, se lo guarda en la bd
            usuario.save ((err, usuarioBD) => {
                //Internal sv error
                if (err) { 
                    return res.status(500).json({
                        ok: false,
                        err
                    }); 
                }

                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED , { expiresIn: process.env.CADUCIDAD_TOKEN } );
                
                return res.json({
                    ok: true, 
                    usuarioBD, 
                    token
                })

            }); 
        } 

    });





});























module.exports = app; 