var express = require('express');
var router = express.Router();
var gameController = require('../controllers/game');

router.post('/new', gameController.hostNew);
router.post('/requestBuzzword', gameController.getNewBuzzword);
router.post('/join', gameController.joinWithBuzzword);

module.exports = router;