var express = require('express');
var router = express.Router();
var passport = require('passport');

// Require controller modules.
var spotify_controller = require('../controllers/spotifyController');
var room_controller = require('../controllers/roomController');

router.get('/about', function (req, res) {
  res.render('about');
});

router.get('/contact', function (req, res) {
  res.render('contact');
});

router.get('/guide', function (req, res) {
  res.render('guide');
});

router.get('/credit', function (req, res) {
  res.render('credit');
});

router.get('/search', spotify_controller.spotify_search);

router.get('/auth/login', spotify_controller.spotify_login);

router.get('/auth/logout', spotify_controller.spotify_logout);

router.get('/auth/access_token', spotify_controller.isAuthenticate, spotify_controller.spotify_get_access_token);

router.get('/room/create', room_controller.room_create_get);

router.post('/room/create', room_controller.room_create_post);

router.get('/room/search', room_controller.room_search);

router.get('/rooms', room_controller.room_list);

router.get('/room/:id', room_controller.room_detail);

router.post('/room/:id', room_controller.room_detail_post);

router.get('/room/:id/update', room_controller.room_update_get);

router.post('/room/:id/update', room_controller.room_update_post);

router.get('/room/:id/delete', room_controller.room_delete_get);

router.post('/room/:id/delete', room_controller.room_delete_post);

router.get('/room/:id/getCandidates', room_controller.room_candidate_suggestion_get);

module.exports = router;
