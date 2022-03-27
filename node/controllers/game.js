var dbController = require('../controllers/db');

exports.hostNew=function(req, res){
    console.log('hosting new game')
    var path = require('path')

    const gameHTML = req.body.game + '.html'
    console.log(gameHTML)
    res.sendFile(gameHTML, {root: path.join(__dirname, '../views/')})
}
exports.getNewBuzzword=function(req, res){
    console.log("Request for a new Buzzword for a game: " + req.body.game);
    dbController.getNewBuzzword(function(buzzword){
        res.send({buzzword: buzzword});
    });
}
//TODO: make it possible to join with a buzzword