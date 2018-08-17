var express = require('express');
var router = express.Router();

// Require controller modules.
var spotify_controller = require('../controllers/spotifyController');
var room_controller = require('../controllers/roomController');

// router.post('/api/search', spotify_controller.spotify_search);
router.get('/search', spotify_controller.spotify_search);

router.get('/auth/login', spotify_controller.spotify_login);

router.get('/auth/logout', spotify_controller.spotify_logout);

router.get('/rooms', room_controller.room_list);

router.get('/room/create', room_controller.room_create_get);

router.post('/room/create', room_controller.room_create_post);

router.get('/room/:id', room_controller.room_detail);

router.get('/play', spotify_controller.spotify_play);

module.exports = router;
