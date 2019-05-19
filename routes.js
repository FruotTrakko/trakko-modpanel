const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect(308, '/panel');
});

router.get('/panel', (req, res) => {
    res.sendFile(__dirname + '/public/panel/panel.html');
});

router.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/public/auth/auth.html');
});

router.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact/contact.html');
});

module.exports = router;