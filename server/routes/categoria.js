const express = require('express'); 
let { verificaToken, verificarAdminRole } = require('../middlewares/autenticacion'); 
let app = express(); 
let Categoria = require('../models/categoria');

//Mostrar all categorias
app.get('/categoria', verificaToken ,(req, res) =>  {
    let desde = Number(req.query.desde) || 0;
    let hasta = Number(req.query.hasta) || 15; 
    
    Categoria.find()
        //Ordenar por descripcion 
        .sort('descripcion')
        //Obtener y filtrar datos del usuario cuyo id sea utilizado en la creacion de una categoria
        .populate('usuario', 'nombre email')

        .skip(desde)
        .limit(hasta)
        .exec((err, categorias) => { 
            if(err) return res.status(500).json({ ok: false, err }); 
            if(categorias) return res.json({ ok: true, categorias});
        });        
}); 

//Mostrar una categoria x id 
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id; 

    Categoria.findById(id, (err, categoriaBD) => { 

        if(err) return res.status(500).json({ ok: false, err }); 
        if(!categoriaBD) return res.status(400).json({ ok: false, err: { err, msg: 'Usuario no encontrado' } });
        
        if(categoriaBD) return res.json({ ok: true, categoriaBD});        
    });
}); 


//Crear categoria
app.post('/categoria', [verificaToken], (req, res) => { 
    //Obtener datos
    let data = req.body; 
    
    let newCategoria = new Categoria({ 
        descripcion: data.descripcion, 
        usuario: req.usuario._id
    }); 

    newCategoria.save((err, categoriaDB) => {  
        //Internal sv error
        if(err) return res.status(500).json({ ok: false, err });
        //Categoria no se guardo
        if(!categoriaDB) return res.status(400).json({ok: false, err}); 
        //Todo salio bien 
        else return res.json({ ok: true, categoriaDB });
    });

}); 

//Actualizar Categoria 
app.put('/categoria/:id', verificaToken, (req, res) => { 
    let id = req.params.id; 
    let data = req.body; 
    
    let desCategoria = { descripcion: data.descripcion }

    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaActualizada) => { 
        //No se encontro la categoria
        if(err) return res.status(400).json({ ok: false, err: {err, msg: 'no se encontro el usuario'}});
        //Todo bien
        return res.json(({ok: true, categoriaActualizada})); 
        
    });
}); 


//Borrar categoria 
app.delete('/categoria/:id', verificaToken ,(req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if(err) return res.status(500).json({ ok: false, err });
        if(!categoriaBorrada) return res.status(400).json({ ok: false, err: { msg: 'Usuario no encontrado', err } });
        
        return res.json({ ok: true, Categoria_Borrada: categoriaBorrada });
    });

}); 


module.exports = app; 