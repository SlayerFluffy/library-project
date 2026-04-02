require ('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var requestLogger = require('./middleware/requestLogger');
var notFound = require('./middleware/notFound');
var errorHandler = require('./middleware/errorHandler');

var app = express();
var port = process.env.PORT || 3000;

const mongodb = require('./data/database');


app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, function() {
  console.log('Server listening on port ' + port);
});

//MongoDB connection
mongodb.initDb((err, mongodb) => {
    if (err) {
        console.log(err);
    } else 
    {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
});

module.exports = app;
