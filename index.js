const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const port = 3020


app.set('view engine','ejs')

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
    secret: 'secret',
    resave: false,
    saveUninitialized: false
  }));
  
  app.set('view engine','ejs');
  
  // Rutas
  app.get('/', (req, res) => {
    res.render('login', { Usuario: req.session.Usuario });
  });

  app.get('/home', (req, res) => {
    res.render('home',{ Usuario: req.session.Usuario });
  });
  
  
  app.get('/register', (req, res) => {
    res.render('register');
  });
  
  app.post('/register', (req, res) => {
    const { Usuario, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    db.query('INSERT INTO Usuario (Usuario, contraseña) VALUES (?, ?)', [Usuario, hashedPassword], (err, results) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
  
  app.post('/ingresar', (req, res) => {
    const { Usuario, password } = req.body;
  
    db.query('SELECT * FROM usuario WHERE Usuario = ?', [Usuario], (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        const Usuario = results[0];
        if (bcrypt.compareSync(password,Usuario.password)) {
          req.session.Usuario = Usuario;
          res.redirect('/');
        } else {
          res.redirect('/home.ejs');
        }
      } else {
        res.redirect('/');
      }
    });
  });
  
  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

app.listen(port,() =>{
    console.log(`Servidor ejecutandose http://localhost:${port}`)
});