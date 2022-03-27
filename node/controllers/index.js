exports.serveIndex = function (req, res) {
    var path = require('path')
    const indexHTML = 'index.html'
    res.sendFile(indexHTML, { root: path.join(__dirname, '../views/') })
}