// Import the Spotify API
var Spotify = require('node-spotify-api');
var SpotifyWebApi = require('spotify-web-api-node');

var passport = require('passport');

var credentials = {
  clientId: '64e65c3badf846158593504b9b5ce162',
  clientSecret: 'e3426eb15a3b434ba3dd5176a152e62d',
  redirectUri: 'http://localhost:3000/api/play'
};

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

var authorizationCode;

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
    // scope: ['user-read-email', 'user-read-private'],
    showDialog: true
});

exports.spotify_callback = function(req, res, next) {
  passport.authenticate('spotify', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }
    authorizationCode = req.query.code;
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/');
    })
  }) (req, res, next);
};

exports.spotify_logout = function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
};

// spotify web api node
exports.spotify_play = function(req, res, next) {
  // TODO: make ajax call to https://api.spotify.com/v1/me/player/play
  // $.ajax({
  //   url: "https://api.spotify.com/v1/me/player/play",
  //
  //   data: {
  //     context_uri: "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
  //   },
  //   headers: {
  //     'Authorization': 'Bearer' + 'accessToken',
  //     'Content-type': 'application/json'
  //   }
  // }).done(function(data) {calendar
  //   console.log('you are playing song');
  // }).fail(function(err) {
  //   console.log('not good');
  // })
  console.log('here is your code: ' + authorizationCode);
  getTokens(authorizationCode);
  res.redirect('/');
}

// this function didn't work: webapi bad request
function getTokens(code) {
  spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
    },
    function(err) {
      console.log('Something went wrong!', err);
    }
  );
}
