const express = require('express');
const expresslayouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat, deletecontact, updateContacts } = require('./utils/contacts');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;


app.set('view engine', 'ejs');
app.use(expresslayouts); // third-party middleware
app.use(express.static('public')); // Built-in middleware
app.use(express.urlencoded({extended: true}));


// configurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: true,
        saveUninitialized: true,
    })
);
app.use(flash());

app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Rizkon Nurkholis',
            email: 'rizkon86system@gmail.com',
        },
        {
            nama: 'gorengan',
            email: 'gorengan86system@gmail.com',
        },
        {
            nama: 'bakwan',
            email: 'bakwan86system@gmail.com',
        },
    ];
    res.render('index', { 
        nama: 'Rizkon', 
        title: 'Halaman Home',
        mahasiswa,
        layout: 'layouts/main-layout'
    });
});

app.get('/about', (req, res) => {
    res.render('about', { 
        layout: 'layouts/main-layout',
        title: 'Halaman About' });
});

app.get('/contact', (req, res) => {
    const contacts = loadContact();

    res.render('contact', { 
        title: 'Halaman Contact',
        layout: 'layouts/main-layout',
        contacts,
        msg: req.flash('msg'),
     });
});


// halaman form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
    });
});

// proses data contact
app.post('/contact', [
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value);
        if (duplikat) {
            throw new Error('Nama contact sudah terdaftar');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'Nomor hp tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render('add-contact', {
            title: 'Form Tambah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
        });
    } else {
        addContact(req.body);
        // kirimkan flash massage
        req.flash('msg', 'Data contact berhasil ditambahkan!');
        res.redirect('/contact');
    }
});

// proses delete kontak
app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    // jika contact tidak ada
    if(!contact) {
        res.status(404);
        res.send('<h1>404</h1>');
    } else {
        deletecontact(req.params.nama);
        req.flash('msg', 'Data contact berhasil dihapus!');
        res.redirect('/contact');
    }
});


// halaman form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        contact,
    });
});


// proses ubah data
app.post('/contact/update', [
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value);
        if ( value !== req.body.oldNama && duplikat) {
            throw new Error('Nama contact sudah terdaftar');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'Nomor hp tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body,
        });
    } else {
        updateContacts(req.body);
        // kirimkan flash massage
        req.flash('msg', 'Data contact berhasil diubah!');
        res.redirect('/contact');
    }
});

// halaman detail contact
app.get('/contact/:nama', (req, res) => {
    const contact = findContact(req.params.nama);
    
    res.render('detail', { 
        title: 'Halaman Detail Contact',
        layout: 'layouts/main-layout',
        contact,
     });
});

app.use((req, res) => {
    res.status(404);
    res.send('<h1>404</h1>');
});


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
