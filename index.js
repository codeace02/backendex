require('dotenv').config();

const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("Hello world!")
});

app.get('/twitter', (req, res) => {
    res.send(`Twitter page route`)
})

app.get('/login', (req, res) => {
    res.send(`
        <h1>Login page route<h1>
        <h2>Please login here</h2>
    `)
});

app.get('/youtube', (req, res) => {
    res.send(`
        <h2>My youtube route</h2>    
    `)
})

app.listen(process.env.PORT, () => {
    console.log(`========================================Example app listening on port ${process.env.PORT}==========================================`)
})