    // Importing the framework
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

    // PostgreSQL
const {Client} = require('pg');

    // For Heroku version we must replace code above with the code below
const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false
    }
});

db.connect();

app.use(express.static('public'));
    // The line below is crucial for sending req.body to the client side
app.use(express.json({ limit: '1mb' }));
    // Allows to use information coming from forms
app.use(express.urlencoded({ extended: true }));
    // dirname indicates the location of the file where code is executed - app.js
app.use('/css', express.static(__dirname + 'public/CSS'));
app.use('/js', express.static(__dirname + 'public/js'));
app.use('/img', express.static(__dirname + 'public/images'));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cors());

    // Renders the page
app.get('/', (req, res) => {
        res.render('schedule');
});

app.get('/getting', (req, res) => {
    const sql2 = `SELECT * FROM visits`;
    db.query(sql2, (err, data) => {
        if (!err) {
            let visitsDb = data.rows;
            res.status(200).json(visitsDb);
        } else {
            console.log(err.message);
        }
        db.end;
    });
});

app.post('/posting', (req, res, next) => {
        // Inserting into a database
    const sql = 'INSERT INTO visits (name, surname, phone_number, SSN, day, time) VALUES ($1, $2, $3, $4, $5, $6)';
    db.query(sql, [
        req.body[0],
        req.body[1],
        req.body[2],
        req.body[3],
        req.body[4],
        req.body[5]
    ], function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(201);
        }
    });
});

app.put('/change', (req, res, next) => {
        // Updating a database
    const sql = 'UPDATE visits SET name = $1, surname = $2, phone_number = $3, SSN = $4 WHERE day = $5 AND time = $6';
    db.query(sql, [
        req.body[0],
        req.body[1],
        req.body[2],
        req.body[3],
        req.body[4],
        req.body[5]
    ], function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(201);
        }
    });
});

app.delete('/day/:day/time/:time', (req, res) => {
        // Deleting data inside of the database
    const sql = 'DELETE FROM visits WHERE day = $1 AND time = $2';
    db.query(sql, [
        req.params.day,
        req.params.time
    ], function(err) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        } else {
            return res.sendStatus(204);
        }
    });
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});