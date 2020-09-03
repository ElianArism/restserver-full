const express = require('express');
const fs = require('fs');
const path = require('path');
let app = express(); 

const { verificaToken } = require('../middlewares/autenticacion');

app.get('/imagen/:tipo/:img', verificaToken ,(req, res) => { 
    let tipo = req.params.tipo; 
    let img = req.params.img; 

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`); 
    
    if(fs.existsSync(pathImagen)) res.sendFile(pathImagen);
    else {
        //Crear el path absoluto de la imagen x def
        let defectoImgPath = path.resolve(__dirname, '../assets/desktop.jpg');
   
        //enviar img "not found" al usuario
        res.sendFile(defectoImgPath); 
    }
});
















module.exports = app; 