require('dotenv').config();

const express = require('express'); // common js, synchronously working
const app = express();

const dummydata = {
    "users": [
        {
            "id": 1,
            "name": "John Doe",
            "email": "johndoe@example.com",
            "age": 28,
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "zipcode": "10001"
            },
            "phone": "555-1234"
        },
        {
            "id": 2,
            "name": "Jane Smith",
            "email": "janesmith@example.com",
            "age": 32,
            "address": {
                "street": "456 Oak St",
                "city": "Los Angeles",
                "zipcode": "90001"
            },
            "phone": "555-5678"
        },
        {
            "id": 3,
            "name": "Michael Johnson",
            "email": "michaelj@example.com",
            "age": 41,
            "address": {
                "street": "789 Pine St",
                "city": "Chicago",
                "zipcode": "60601"
            },
            "phone": "555-9101"
        }
    ]
}

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

app.get('/json', (req, res) => {
    res.json(dummydata)
})

app.listen(process.env.PORT, () => {
    console.log(`========================================Example app listening on port ${process.env.PORT}==========================================`)
})