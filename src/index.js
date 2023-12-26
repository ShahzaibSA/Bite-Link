require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db');
const urlRoutes = require('./routes/urlRoutes');
const userRoutes = require('./routes/userRoutes');
const staticRoutes = require('./routes/staticRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const refreshTokenRoute = require('./routes/refreshTokenRoute');

const port = process.env.PORT || 8000;
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.resolve('./src/views'));

app.use(cors());
app.use(cookieParser());

//> 1 WAY
// const publicDirectoryPath = path.join(__dirname, '../public');
// app.use(express.static(publicDirectoryPath));

//> 2 WAY
// app.use(express.static(path.resolve('./public')));
// app.use(express.static(path.resolve('./public/js')));

//> 3 WAY
app.use(express.static(path.resolve('public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectDB(process.env.MONGO_URL).then(() => console.log('DB Connected'));

app.use('/', staticRoutes);

app.use('/users', userRoutes);

app.use('/url', urlRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/refresh', refreshTokenRoute);

app.use('*', function (req, res) {
  res.render('error');
});

app.listen(port, () => console.log('Server is Running on port', port));
