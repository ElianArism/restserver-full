const express = require('express'); 
const { verificaToken } = require('../middlewares/autenticacion'); 
let app = express(); 
let Producto = require('../models/producto');
const producto = require('../models/producto');


//Obtener productos 
app.get('/productos', verificaToken ,(req, res) => {
    let desde = Number(req.query.desde) || 0;  
    let hasta = Number(req.query.hasta) || 15;

    Producto.find({})
        .sort('nombre')
        .populate('usuario categoria', 'nombre email descripcion')
        .skip(desde) 
        .limit(hasta)
        .exec((err, productos) => {
            if(err) return res.status(500).json({ ok: false, err: { msg: 'Algo salio mal en el servidor', err } });
            if(productos) return res.json({ ok: true, productos }); 
        });

    
}); 


//producto x id 
app.get('/productos/:id', (req, res) => {
    //populate usuario categoria 
    //paginado 
});

//Cargar producto
app.post('/productos', verificaToken ,(req, res) => {
    let data = req.body; 

    let nuevoProducto = new Producto({
        nombre: data.nombre,
        descripcion: data.descripcion, 
        precioUni: data.precioUni,
        disponible: data.disponible,  
        categoria: data.categoria,
        usuario: data.usuario 
    });

    
    nuevoProducto.save((err, productoDB) => { 
        if(err) return res.status(500).json( { ok: false, err } ); 
        if(!productoDB) return res.status(400).json( { ok: false, err: { msg: ' El producto no se guardo ', err} } );
        else return res.status(201).json( { ok: true, productoDB } ); 
    });

    
});

// Actualizar producto por id
app.put('/productos/:id', (req, res) => { 
    let data = req.body; 
    let id = req.params.id; 
    
    let producto = { 
        nombre: data.nombre, 
        precioUni: data.precioUni, 
        descripcion: data.descripcion, 
        disponible: data.disponible || true, 
        categoria: data.categoria, 
    }; 

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
        if(err) return res.status(500).json({ ok: false, err  });
        if(!productoDB) return res.status(400).json({ ok: false, err: { msg: 'Id no encontrado', err } })
        if(productoDB) return res.json({ ok:true, productoDB }); 
    });

});

//eliminar producto
app.delete('/productos/:id', (req, res) => {
    let id = req.params.id; 

    let desactivar = { disponible: false }
    Producto.findByIdAndUpdate(id, desactivar, { new: true, runValidators: true }, (err, prodDesactivado) => {
        if(err) return res.status(500).json({ ok: false, err });
        if(!prodDesactivado) return res.status(400).json({ err: { msg: 'Id no encontrado', err } });
        if(prodDesactivado) return res.json({ ok: true, prodDesactivado }); 
    });
});


module.exports = app; 