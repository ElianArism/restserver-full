const express = require('express'); 
const { verificaToken, verificarAdminRole } = require('../middlewares/autenticacion'); 
let app = express(); 
let Producto = require('../models/producto');



//Obtener productos 
app.get('/productos', verificaToken ,(req, res) => {
    let desde = Number(req.query.desde) || 0;  
    let hasta = Number(req.query.hasta) || 15;

    Producto.find({})
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .skip(desde) 
        .limit(hasta)
        .exec((err, productos) => {
            if(err) return res.status(500).json({ ok: false, err: { msg: 'Algo salio mal en el servidor', err } });
            if(productos) return res.json({ ok: true, productos }); 
        });

    
}); 


//producto x id 
app.get('/productos/:id', (req, res) => {
    let id = req.params.id;
    Producto.findById(id) 
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoBD) => {
            if(err) return res.status(500).json({ ok: false, err: { msg: 'Algo salio mal en el servidor', err } });
            if(!productoBD) return res.status(400).json({ok: false, err: { msg: 'No se encontro un id que coincida', err}}); 
            if(productoBD) return res.json({ ok: true, productoBD }); 
        });

});

// Busqueda Producto 
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino; 
    //Expresion regular para encontrar texto de acuerdo a un patron (i para ignorar mayusculas y minusculas)
    let regEx = new RegExp(termino, 'i'); 

    Producto.find({ nombre: regEx })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if(err) return res.status(500).json({ ok: false, err: { msg: 'Algo salio mal en el servidor', err } });
            if(productos) return res.json({ ok: true, productos });    
        });

});

//Cargar producto
app.post('/productos', verificaToken ,(req, res) => {
    let data = req.body; 

    let nuevoProducto = new Producto({
        usuario: req.usuario._id, 
        nombre: data.nombre,
        descripcion: data.descripcion, 
        precioUni: data.precioUni,
        disponible: data.disponible,  
        categoria: data.categoria,
    });

    
    nuevoProducto.save((err, productoDB) => { 
        if(err) return res.status(500).json( { ok: false, err } ); 
        if(!productoDB) return res.status(400).json( { ok: false, err: { msg: ' El producto no se guardo ', err} } );
        else return res.status(201).json( { ok: true, productoDB } ); 
    });

    
});

// Actualizar producto por id
app.put('/productos/:id',[verificaToken, verificarAdminRole], (req, res) => { 
    let data = req.body; 
    let id = req.params.id; 
    
    let producto = { 
        nombre: data.nombre, 
        precioUni: data.precioUni, 
        descripcion: data.descripcion, 
        disponible: data.disponible || true, 
    }; 

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true }, (err, productoDB) => {
        if(err) return res.status(500).json({ ok: false, err  });
        if(!productoDB) return res.status(400).json({ ok: false, err: { msg: 'Id no encontrado', err } })
        if(productoDB) return res.json({ ok:true, productoDB }); 
    });

});

//eliminar producto
app.delete('/productos/:id', [verificaToken, verificarAdminRole],(req, res) => {
    let id = req.params.id; 

    let desactivar = { disponible: false }
    Producto.findByIdAndUpdate(id, desactivar, { new: true, runValidators: true }, (err, prodDesactivado) => {
        if(err) return res.status(500).json({ ok: false, err });
        if(!prodDesactivado) return res.status(400).json({ err: { msg: 'Id no encontrado', err } });
        if(prodDesactivado) return res.json({ ok: true, prodDesactivado }); 
    });
});


module.exports = app; 