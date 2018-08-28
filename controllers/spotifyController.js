// Import the Spotify API
var models = require('../models/');
var Spotify = require('node-spotify-api');
var SpotifyWebApi = require('spotify-web-api-node');

var passport = require('passport');

var credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/playback'
};

var http = require('http');

var spotifyApi = new SpotifyWebApi(credentials);

// exports.spotifyKeys = {
//     id: '64e65c3badf846158593504b9b5ce162',
//     secret: 'e3426eb15a3b434ba3dd5176a152e62d'
// };

//Import our Keys File
var keys = require('../routes/key');

//Create a Spotify Client
// var spotify = new Spotify(keys.spotifyKeys);
var spotify = new Spotify(keys.spotifyKeys);

// setup for playback

exports.spotify_search = function(req, res, next) {
    //Set the type of query: track
    var type = 'track';

    //Get the query from the user
    var query = req.query.query;

    //Clear out old results
    var results = [];

    //Make a request to Spotify
    spotify.search({type: type, query: query})
        .then(function (spotRes) {

            //Store the artist, song, preview link, and album in the results array
            spotRes.tracks.items.forEach(function(ea){
                results.push({
                              artist: ea.artists[0].name,
                              song: ea.name,
                              // url: ea.external_urls.spotify,
                              id: ea.id,
                              album: ea.album.name,
                              image: ea.album.images[0].url,
                              uri: ea.uri,
                              preview: ea.preview,
                });
            });
            //Render the homepage and return results to the view
            // res.render('index', {title: 'Spotify', results: results});
            res.json(results);
        })
        .catch(function (err) {
            console.log(err);
            throw err;
        });
};

exports.spotify_login = passport.authenticate('spotify', {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
    scope: ['streaming',
            'user-read-birthdate',
            'user-read-email',
            'user-read-private',
            'user-read-recently-played',
            'user-modify-playback-state',
            'playlist-modify-public',
            'playlist-modify-private '],
    showDialog: true
});

exports.spotify_callback = function(req, res, next) {
  passport.authenticate('spotify', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      spotifyApi.setAccessToken(user.access_token);
      spotifyApi.setRefreshToken(user.refresh_token);
      return res.redirect('/');
    })
  }) (req, res, next);
};

exports.spotify_logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

// spotify web api node
exports.spotify_playlist_create = function(req, res, next) {
  // Create a private playlist
  var user_id = req.user.spotify_id;
  var playlist_name = req.body.name;

  spotifyApi.createPlaylist(user_id, playlist_name, { 'public' : false })
    .then(function(data) {
      console.log('Created playlist!');
      // console.log(data);
      res.json(data);
    }, function(err) {
      console.log('Create List: Something went wrong!', err);
    });
}

exports.spotify_playlist_track_add = function(req, res, next) {
  var playlist_id = req.params.id;
  var uris = [req.body.track];
  models.Room.findById(req.body.roomId).then(room => {
    var user_id = room.owner;
    spotifyApi.addTracksToPlaylist(user_id, playlist_id, uris)
    .then(function(data) {
      console.log('Added tracks to playlist!');
      res.json(data);
    }, function(err) {
      console.log('Add Track: Something went wrong!', err);
    });
  })
  // Add tracks to a playlist
}
