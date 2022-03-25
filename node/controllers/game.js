exports.hostNew=function(req, res){
    console.log('hosting new game')
    var path = require('path')

    const gameHTML = req.body.game + '.html'
    console.log(gameHTML)
    res.sendFile(gameHTML, {root: path.join(__dirname, '../views/')})
}
//TODO: make the sendFile a callback, call also the db ctrl to get a new buzzword
//TODO: make it possible to join with a buzzword