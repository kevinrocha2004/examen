const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const port = 3020;

// Setup view engine
app.set('view engine', 'ejs');

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'examen_suple'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado a la base de datos MySQL.');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key', // Use a more secure secret in production
    resave: false,
    saveUninitialized: false
}));

// Routes
app.get('/', (req, res) => {
    res.render('login', { Usuario: req.session.Usuario });
});

app.get('/home', (req, res) => {
    res.render('home' );
   
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { Usuario, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query('INSERT INTO Usuario (Usuario, contraseña) VALUES (?, ?)', [Usuario, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            return res.status(500).send('Error al registrar el usuario');
        }
        res.redirect('/');
    });
});

app.post('/ingresar', (req, res) => {
    const { Usuario, password } = req.body;

    db.query('SELECT * FROM Usuario WHERE Usuario = ?', [Usuario], (err, results) => {
        if (err) {
            console.error('Error al ingresar:', err);
            return res.status(500).send('Error al ingresar');
        }
        if (results.length > 0) {
            const user = results[0];
            if (bcrypt.compareSync(password, user.contraseña)) { // Ensure column name matches your database schema
                req.session.Usuario = user;
                res.redirect('/home');
            } else {
                res.redirect('/home');
            }
        } else {
            res.redirect('/home');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).send('Error al cerrar sesión');
        }
        res.redirect('/');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});