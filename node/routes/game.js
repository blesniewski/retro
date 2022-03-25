var express = require('express');
var router = express.Router();
var gameController = require('../controllers/game');

router.post('/hostNew', gameController.hostNew);

module.exports = router;