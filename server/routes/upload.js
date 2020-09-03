const express = require('express');
const fileUpload = require('express-fileupload');
const e = require('express');
const app = express();

const Usuario = require('../models/usuario'); 
const Producto =  require('../models/producto'); 
const fs = require('fs'); 
const path = require('path'); 

// default options
app.use(fileUpload({useTempFiles: true}));


app.put('/upload/:tipo/:id', function(req, res) {
    
    let tipo = req.params.tipo;
    let id = req.params.id;


//si no hay archivos  
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ ok: false, err: { msg: 'No se selecciono ningun archivo.' } });
    }

//Controlando tipos validos 
    let tiposValidos = ['productos', 'usuarios']; 
    if(!tiposValidos.includes(tipo)){ 
        res.status(404).json({ok: false, err: {msg: 'ingrese un tipo valido'}});
    }
// si viene un archivo se captura en la variable
    let archivo = req.files.archivo;  

// Controlar extensiones que pueden subirse  
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']; 
    let nombreArchCortado = archivo.name.split('.'); 
    let extension = nombreArchCortado[nombreArchCortado.length - 1]; 
    
    if(!extensionesValidas.includes(extension)) { 
        res.status(400).json({ok: false, err:{  msg: 'las extensiones validas son: ' + extensionesValidas  }, ext: { msg: 'la extension recibida fue: .'+ extension }}); 
    
    }

//Cambiar nombre del archivo para que sea unico 
let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;     // Ej: 21312312Asdefa-335.jpg


// Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if(err) {
            return res.status(500).json({ok: false, err});
        }

        //Aqui la imagen ya esta cargada
        if(tipo == 'productos') imagenProducto(id, res, nombreArchivo)
        else imagenUsuario(id, res, nombreArchivo); 
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if(err) { 
            borrarArchivo(nombreArchivo, 'usuarios');     
            return res.status(500).json({ok : false, err}); 
        }
        if(!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');     
            return res.status(400).json({ ok: false, err: { msg: 'Usuario no existe' }}); 
        }
        
        borrarArchivo(usuarioDB.img, 'usuarios'); 
        // Setear img de perfil de usuario por la nueva cargada
        usuarioDB.img = nombreArchivo; 

        usuarioDB.save((err, usuarioGuardado) => { 
            if(err) return res.status(500).json({ ok: false, err}); 
            return res.json({ ok: true, usuarioGuardado, img: nombreArchivo });
        });

    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => { 
        if(err) { 
            borrarArchivo(nombreArchivo, 'productos'); 
            return res.status(500).json ({ ok: false, err });
        }
        if(!productoDB) { 
            borrarArchivo(nombreArchivo, 'productos');
            return res.status(400).json({ ok: false, err: { msg: 'Producto no existe' }});     
        }

        borrarArchivo(productoDB.img, 'productos'); 
        productoDB.img = nombreArchivo;
         

        productoDB.save((err, productoGuardado) => { 
            if(err) return res.status(500).json({ ok: false, err}); 
            return res.json({ ok: true, productoGuardado, img: nombreArchivo });
        });
        
    });
}

function borrarArchivo(nombreImagen, tipo) {

    //Verificar que la img existe
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`); 
    if(fs.existsSync(pathImagen)) { 
        //Si existe, se elimina la imagen antigua para dejarle el lugar a la nueva
        fs.unlinkSync(pathImagen); 
}

}
//para usar esta configuracion en any place se debe exportar
module.exports = app; 