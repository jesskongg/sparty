// Import the Spotify API
var Spotify = require('node-spotify-api');

//Import our Keys File
var keys = require('../routes/key');

//Create a Spotify Client
var spotify = new Spotify(keys.spotifyKeys);

//Store the results of a request to spotify
// var results = [];

exports.spotify_search = function(req, res, next) {
    //Set the type of query: track
    var type = 'track';

    //Get the query from the user
    var query = req.body.param_query;

    //Clear out old results
    results = [];

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
                              image: obj.album.images[0].url,
                              uri: ea.uri,
                              preview: ea.preview,
                });
            });
            //Render the homepage and return results to the view
            res.render('index', {title: 'Spotify', results: results});
        })
        .catch(function (err) {
            console.log(err);
            throw err;
        });
});

module.exports = router;
