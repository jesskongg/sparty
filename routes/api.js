var express = require('express');
var router = express.Router();

// Require controller modules.
var spotify_controller = require('../controllers/spotifyController');

// router.post('/api/search', spotify_controller.spotify_search);
router.get('/search', spotify_controller.spotify_search);

module.exports = router;
