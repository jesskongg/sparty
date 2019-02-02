// Import the Spotify API
var passport = require('passport');
var jwt = require('jsonwebtoken');
var SpotifyWebApi = require('spotify-web-api-node');
var authenticate = require('./authController');
var models = require('../models/');

//Create a Spotify Client
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// set access token for all later apis call
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Cannot get access token!', err);
  }
);

exports.spotify_search = function(req, res) {
  //Set the type of query: track
  var type = 'track';
  var query = req.query.query;
  //Clear out old results
  var results = [];

  spotifyApi.searchTracks(query)
  .then(function(spotRes) {
      spotRes.body.tracks.items.forEach(function(ea){
        var album_cover = (ea.album.images.length) ? ea.album.images[0].url : '';
        results.push({
                      artist: ea.artists[0].name,
                      name: ea.name,
                      id: ea.id,
                      album: ea.album.name,
                      image: album_cover,
                      uri: ea.uri,
          });
      });
      return res.status(200).json(results);
  }, function(err) {
      return res.status(500).json(err);
  })
};

exports.spotify_login = passport.authenticate('spotify', {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
    scope: ['streaming',
            'user-read-birthdate',
            'user-read-email',
            'user-read-private',
            'user-modify-playback-state',],
    showDialog: true
});

exports.spotify_callback = function(req, res) {
  res.render('authentication', {token: authenticate.generateToken(req.user)});
}

// API: get new access token
exports.spotify_get_access_token = function(req, res) {
  models.User.findById(req.user).then(user => {
    spotifyApi.setRefreshToken(user.refresh_token);
    spotifyApi.refreshAccessToken()
    .then(function(data) {
      return res.status(200).json({accessToken: data.body.access_token});
    }, function(err) {
      return res.status(400).json({error: 'Cannot refresh token'});
    })
  })
};
