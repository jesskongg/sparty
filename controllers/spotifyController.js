// Import the Spotify API
var Spotify = require('node-spotify-api');
var passport = require('passport');
var http = require('http');

//Import our Keys File
var keys = require('../routes/key');

//Create a Spotify Client
var spotify = new Spotify(keys.spotifyKeys);

exports.spotify_search = function(req, res, next) {
  //Set the type of query: track
  var type = 'track';
  var query = req.query.query;
  //Clear out old results
  var results = [];

  //Make a request to Spotify
  spotify.search({type: type, query: query})
      .then(function (spotRes) {
        //Store the artist, song, preview link, and album in the results array
        spotRes.tracks.items.forEach(function(ea){
          var album_cover = (ea.album.images.length) ? ea.album.images[0].url : '';
          results.push({
                        artist: ea.artists[0].name,
                        song: ea.name,
                        id: ea.id,
                        album: ea.album.name,
                        image: album_cover,
                        uri: ea.uri,
            });
        });
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
            'playlist-modify-private'],
    showDialog: true
});

exports.spotify_callback = passport.authenticate('spotify', {
  successRedirect: '/',
  failureRedirect: '/login',
});

exports.spotify_logout = function(req, res) {
  req.logout();
  res.redirect('/');
};
