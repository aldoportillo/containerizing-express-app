const express = require('express');
const pool = require('./db');
const port = 5000;

const app = express();
app.use(express.json());

//routes
app.get('/', async (req, res) => {
    try{
        const allUsers = await pool.query('SELECT * FROM users');
        res.json(allUsers.rows);
    } catch (err){
        console.error(err.message);
        res.sendStatus(500);
    }
})

app.post('/', async (req, res) => {
    try{
        const { name, location } = req.body;
        const newUser = await pool.query('INSERT INTO users (name, location) VALUES($1, $2) RETURNING *', [name, location]);
        res.json(newUser.rows[0]).status(201).send({message: 'User added successfully'});
    } catch (err){
        console.error(err.message);
        res.sendStatus(500);
    }
})

app.get('/setup', async (req, res) => {
    try{
        await pool.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name VARCHAR(50), location VARCHAR(50))');
        res.status(201).send({message: 'Table created successfully'});
    } catch (err){
        console.error(err.message);
        res.sendStatus(500);
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})