// Import the Spotify API
var passport = require('passport');
var jwt = require('jsonwebtoken');
var SpotifyWebApi = require('spotify-web-api-node');

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

exports.spotify_search = function(req, res, next) {
  //Set the type of query: track
  var type = 'track';
  var query = req.query.query;
  //Clear out old results
  var results = [];

  spotifyApi.searchTracks(query)
  .then(function(spotRes) {
    console.log(spotRes);
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
      res.json(results);
  }, function(err) {
    console.error(err);
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
  res.render('authentication', {token: generateJwt(req.user)});
}

exports.spotify_get_access_token = function(req, res, next) {
  spotifyApi.refreshAccessToken()
  .then(function(data) {
        console.log('The access token has been refreshed!');
        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
        res.send(data.body['access_token']);
      }, function(err) {
        console.log('Could not refresh access token', err);
    }
  )
};

exports.spotify_logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

function generateJwt(user) {
  return jwt.sign({user: user.spotify_id}, process.env.JWT_TOKEN);
}
