var passport = require('passport');
var SpotifyWebApi = require('spotify-web-api-node');

var callbackURL = process.env.NODE_ENV === 'production' ? 'https://chardonnay.herokuapp.com/callback' : 'http://localhost:3000/callback';

var credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: callbackURL
}
//Create a Spotify Client
var clientSpotify = new SpotifyWebApi(credentials);

var tokenExpired = 0;

exports.spotify_search = function(req, res) {
  if (Date.now()/1000 - tokenExpired > 0) {
    clientSpotify.clientCredentialsGrant().then(
      function(data) {
        clientSpotify.setAccessToken(data.body['access_token']);
        tokenExpired = Date.now()/1000 + data.body['expires_in'];
        searchSong(req.query.query).then((songs) => {
          res.json(songs);
        })
      }
    );
  } else {
    searchSong(req.query.query).then((songs) => {
      res.json(songs);
    })
  }
};

function searchSong(query) {
  return new Promise((resolve, reject) => {
    //Clear out old results
    var results = [];
    //Make a request to Spotify
    clientSpotify.searchTracks(query)
        .then(function (spotRes) {
          //Store the artist, song, preview link, and album in the results array
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
          resolve(results);
      })
    .catch(function (err) {
        reject(err);
    });
  })

}

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

exports.spotify_callback = function(req, res, next) {
  passport.authenticate('spotify', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/login');
    })
  }) (req, res, next);
};

exports.spotify_get_access_token = function(req, res, next) {
  var userSpotifyApi = new SpotifyWebApi(credentials);
  userSpotifyApi.setRefreshToken(req.user.refresh_token);
  userSpotifyApi.refreshAccessToken()
  .then(function(data) {
        console.log('The access token has been refreshed!');
        // Save the access token so that it's used in future calls
        userSpotifyApi.setAccessToken(data.body['access_token']);
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

exports.isAuthenticate = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
