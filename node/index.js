var http = require('http');
const express = require('express');

var indexRouter = require('./routes/index');
var gameRouter = require('./routes/game');
var dbController = require('./controllers/db')

const app = express();
var path = require('path')
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

app.use('/', indexRouter);
app.use('/game', gameRouter);


var listener = app.listen(8081, function () {
    console.log('Listening on port ' + listener.address().port);
    dbController.clearBuzzwords();
    dbController.clearEntries();
    dbController.populateBuzzwords();
});