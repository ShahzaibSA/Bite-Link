require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const urlRoutes = require('./routes/urlRoutes');
const staticRoutes = require('./routes/staticRoutes');

const port = process.env.PORT || 8000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.resolve('./src/views'));

app.use(cors());
app.use(express.static(path.resolve('./public')));
app.use(express.static(path.resolve('./public/js')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB(process.env.MONGO_URL).then(() => console.log('DB Connected'));

app.use('/', staticRoutes);

app.use('/url', urlRoutes);

app.listen(port, () => console.log('Server is Running on port', port));
