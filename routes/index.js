var express = require('express');
var router = express.Router();
var spotify_controller = require('../controllers/spotifyController');
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/api/rooms');
});

router.get('/callback', passport.authenticate('spotify', {session: false}), spotify_controller.spotify_callback);

module.exports = router;
