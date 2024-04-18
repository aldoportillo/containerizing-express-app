# Containerizing and Deploying an Express App with a PostgresDB using Docker

## Prerequisites

1. Have Docker installed locally
2. Have the daemon running

## Installing packages and creating files

1. Initialize npm
2. Install pg and express
3. Create server.js
4. Create db.js

## Write db.js

```javascript

const { Pool } = require('pg')
const pool = new Pool({
    host: 'db',
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
})

module.exports = pool

```

## Write server.js

```javascript

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
```

## Write Docker File

```dockerfile

# Install node
FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port and start application
EXPOSE 5000
CMD [ "npm", "run", "start" ]

```

## Write Compose Yaml

```yaml
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_DB: ${POSTGRES_DB}
  app:
    image: containerizing-express-app
    ports:
      - "8000:5000"
    depends_on:
      - db
```

## Write node scripts

```json

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build-docker": "docker build -t containerizing-express-app .",
    "compose-docker": "docker-compose up"
  },

```

## Run Scripts

```bash

npm run build-docker

npm run compose-docker

```
