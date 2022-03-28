var express = require('express');
var router = express.Router();
var gameController = require('../controllers/game');

router.post('/new', gameController.hostNew);
router.post('/requestBuzzword', gameController.getNewBuzzword);
router.post('/join', gameController.joinWithBuzzword);
router.post('/newEntry', gameController.newEntry);
router.post('/getCategoryEntries', gameController.getEntriesForCategory);
router.post('/endGame', gameController.endGame);
router.post('/getIsGameValid', gameController.isGameValid);
router.post('/checkIfUserIsOwner', gameController.checkIfOwner);

module.exports = router;