const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hit the homepage');
});

router.get('/panel', (req, res) => {
    res.sendFile(__dirname + '/public/panel/panel.html');
});

router.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/public/auth/auth.html');
});

module.exports = router;