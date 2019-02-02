var express = require('express');
var router = express.Router();
var spotify_controller = require('../controllers/spotifyController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/api/rooms');
});

router.get('/callback', spotify_controller.spotify_callback);

router.get('/login', function(req, res) {
  res.render('login');
});

module.exports = router;
