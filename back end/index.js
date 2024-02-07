const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

const port = 3000;

// PostgreSQL configuration (replace with your database details)

const pool = new Pool({
    connectionString: 'postgres://znvlykdb:sTJaVzlkYj4izL-h6f568vccT2OVb7SE@arjuna.db.elephantsql.com/znvlykdb',
    ssl: {

        rejectUnauthorized: false

    }

});

// Sample data store (replace with a database in a real application)
const usersinfos = [];

app.use(cors()); 
app.use(bodyParser.json());
// Index route

app.get('/', (req, res) => {
    res.send('Server is running!');
});

pool.query(`
    CREATE TABLE IF NOT EXISTS usersinfos (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INTEGER,
        dob DATE,
        contact VARCHAR(255)
    )
`, (err, results) => {
    if (err) {
        console.error('Error creating usersinfos table:', err);
    } else {
        console.log('usersinfos table created or already exists.');
    }
});

// Signup API
app.post('/signup', (req, res) => {
    const { username, password, email, age, dob, contact } = req.body;
    // Validate request parameters
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Incomplete information provided' });
    }
    // Check if user already exists
    pool.query('SELECT * FROM usersinfos WHERE username = $1', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.rows.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        // Create a new user
        pool.query('INSERT INTO usersinfos (username, password, email, age, dob, contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [username, password, email, age, dob, contact],
            (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                const newUser = {
                    id: results.rows[0].id,
                    username,
                    email,
                    age: results.rows[0].age,
                    dob: results.rows[0].dob,
                    contact: results.rows[0].contact,
                };
                return res.json({ message: 'Signup successful', user: newUser });
            });
    });
});

// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Find user by username
    pool.query('SELECT * FROM usersinfos WHERE username = $1 AND password = $2', [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = {
            id: results.rows[0].id,
            username,
            email: results.rows[0].email,
            age: results.rows[0].age,
            dob: results.rows[0].dob,
            contact: results.rows[0].contact,
        };
        return res.json({ message: 'Login successful', user });
    });
});

// Get user details API
app.get('/getUserDetails/:username', (req, res) => {
    const { username } = req.params;
    // Find user by username
    pool.query('SELECT * FROM usersinfos WHERE username = $1', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = {
            id: results.rows[0].id,
            username,
            email: results.rows[0].email,
            age: results.rows[0].age,
            dob: results.rows[0].dob,
            contact: results.rows[0].contact,
        };
        return res.json({ user });
    });
});

// Edit user details API
app.put('/editUserDetails/:username', (req, res) => {
    const { username } = req.params;
    const { newPassword, newEmail, newAge, newDob, newContact } = req.body;

    // Check if newEmail is provided
    if (!newEmail) {
        return res.status(400).json({ error: 'New email is required for the update' });
    }

    // Construct the parameters array based on whether newPassword is provided or not
    const params = newPassword
        ? [newPassword, newEmail, newAge, newDob, newContact, username]
        : [newEmail, newAge, newDob, newContact, username];

    // Update user details directly in the database
    const updateQuery = newPassword
        ? 'UPDATE usersinfos SET password = $1, email = $2, age = $3, dob = $4, contact = $5 WHERE username = $6 RETURNING *'
        : 'UPDATE usersinfos SET email = $1, age = $2, dob = $3, contact = $4 WHERE username = $5 RETURNING *';

    pool.query(updateQuery, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updatedUserDetails = results.rows[0];
        return res.json({ message: 'User details updated', user: updatedUserDetails });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
