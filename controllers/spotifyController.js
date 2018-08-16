// Import the Spotify API
var Spotify = require('node-spotify-api');

var passport = require('passport');

//Import our Keys File
var keys = require('../routes/key');

//Create a Spotify Client
// var spotify = new Spotify(keys.spotifyKeys);
var spotify = new Spotify(keys.spotifyKeys);

//Store the results of a request to spotify
// var results = [];

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
    showDialog: true,
});

exports.spotify_callback = passport.authenticate('spotify', {
      failureRedirect: '/',
      successReturnToOrRedirect: '/'
});

exports.spotify_logout = function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
};
