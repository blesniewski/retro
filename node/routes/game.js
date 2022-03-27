var express = require('express');
var router = express.Router();
var gameController = require('../controllers/game');

router.post('/hostNew', gameController.hostNew);
router.post('/requestBuzzword', gameController.getNewBuzzword);

module.exports = router;