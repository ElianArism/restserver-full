const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();




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
        }, 'este-es-el-seed-desarrollo', { expiresIn: process.env.CADUCIDAD_TOKEN } );


        //Si todo es valido
        return res.json({
            ok: true, 
            usuario: usuarioDB, 
            token
        });
    
    });
});






















module.exports = app; 