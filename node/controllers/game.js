var dbController = require('../controllers/db');

exports.hostNew = function (req, res) {
    console.log('hosting new game')
    var path = require('path')

    const gameHTML = req.body.game + '.html'
    //console.log(gameHTML)
    res.sendFile(gameHTML, { root: path.join(__dirname, '../views/') })
}
exports.getNewBuzzword = function (req, res) {
    //console.log("Request for a new Buzzword for a game: " + req.body.game);
    dbController.getNewBuzzword(req.body.game, req.body.user, function (buzzword) {
        res.send({ buzzword: buzzword });
    });
}
exports.joinWithBuzzword = function (req, res) {
    //console.log("Request to join with a buzzword: ", req.body.buzzword);
    dbController.getBuzzword(req.body.buzzword, function (buzzword, isOk, game) {
        res.send({ buzzword: buzzword, valid: isOk, game: game });
    });
}
exports.newEntry = function (req, res) {
    //console.log("Post request for a new entry. Buzzword: ", req.body.buzzword, " Category: ", req.body.category, " Contents: ", req.body.contents, " Author: ", req.body.user);
    dbController.addEntry(req.body.user, req.body.buzzword, req.body.category, req.body.contents,
        function (category) {
            res.send({ category: category });
        });
}
exports.isGameValid = function (req, res) {
    dbController.getBuzzwordisActive(req.body.buzzword, function (word, isValid, gameType) {
        console.log("Checking valididity of: ", req.body.buzzword, ", valid: ", isValid);
        res.send({ isGameValid: isValid });
    });
}
exports.getEntriesForCategory = function (req, res) {
    console.log("Getting entries for category ", req.body.category, " and game ", req.body.buzzword);
    dbController.getBuzzwordisActive(req.body.buzzword, function (word, isValid, gameType) {
        console.log("isValid: ", isValid);
        if (isValid) {
            console.log("Buzzword valid, getting entries")
            dbController.getGameEntriesByCategory(req.body.buzzword, req.body.category, function (entries) {
                console.log("found some entries for :", req.body.buzzword, " and cat: ", req.body.category);
                res.send({ entries: entries, isGameValid: true });
            })
            return;
        }
        else {
            console.log("Buzzword invalid, sending message");
            res.send({ entries: [], isGameValid: false });
        }
    });
}
exports.endGame = function (req, res) {
    //input here would be user ID, and game id, to be validated further
    console.log("Request to end game: ", req.body.buzzword, " from user: ", req.body.user);
    dbController.getBuzzword(req.body.buzzword, function (buzzword, isOk, game) {
        if (!isOk) {
            res.send({ valid: false });
            return;
        }
        dbController.invalidateBuzzword(req.body.user, req.body.buzzword, function (isOk) {
            if (!isOk) {
                console.log("failed to invalidate");
            }
            res.send({ valid: isOk });
        });
    });
}