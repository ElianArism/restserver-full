
// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;

// ============================
//  Entorno
// ============================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ============================
//  Vencimiento del Token
// ============================
    process.env.CADUCIDAD_TOKEN = "2 days";

// ============================
//  Seed
// ============================
    process.env.SEED = process.env.SEED || "este-es-el-seed-desarrollo" 

// ============================
//  Google Client ID
// ============================
process.env.CLIENT_ID = process.env.CLIENT_ID  || '644223079720-rqg48rk9evjugcsl3nh1oot2f19ea17q.apps.googleusercontent.com';



// ============================
//  Base de datos
// ============================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

