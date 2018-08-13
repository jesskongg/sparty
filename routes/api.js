var express = require('express');
var router = express.Router();

// Require controller modules.
var spotify_controller = require('../controllers/spotifyController');

router.get('/api/search', spotify_controller.spotify_search);

module.exports = router;
