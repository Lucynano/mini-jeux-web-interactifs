// Creer un serveur web avec nodejs
require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Le serveur écoute sur le port ${PORT}`);
});