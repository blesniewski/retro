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
    dbController.getNewBuzzword(req.body.game, req.body.user, function(buzzword){
        res.send({buzzword: buzzword});
    });
}
exports.joinWithBuzzword=function(req, res){
    console.log("Request to join with a buzzword: ", req.body.buzzword);
    dbController.getBuzzword(req.body.buzzword, function(buzzword, isOk){
        res.send({buzzword: buzzword, valid: isOk});
    });
}
//TODO: buzzword invalidation