import express from "express"; //module js, it works asynchronously
import cors from 'cors';

const app = express();

const port = process.env.PORT || 3010;

app.use(cors());

app.get('/', (req, res) => {
    res.send('hello world')
})

// get a list of 5 jokes

app.get('/api/jokes', (req, res) => {
    const jokes = [
        {
            id: 1,
            title: 'First Joke',
            content: "Joke desc"
        },
        {
            id: 2,
            title: 'Second Joke',
            content: "Joke desc"
        },
        {
            id: 3,
            title: 'Third Joke',
            content: "Joke desc"
        },
        {
            id: 4,
            title: 'Fourth Joke',
            content: "Joke desc"
        },
        {
            id: 5,
            title: 'Fifth Joke',
            content: "Joke desc"
        },
        {
            id: 6,
            title: 'Sixth Joke',
            content: "Joke desc"
        },
        {
            id: 7,
            title: 'Seventh Joke',
            content: "Joke desc"
        }
    ];

    res.send(jokes);
})

app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`)
})