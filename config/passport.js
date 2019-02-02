// configure passport spotify
const SpotifyStrategy = require('passport-spotify').Strategy;
var models = require('../models');

module.exports = function(passport) {
  var callbackURL = process.env.NODE_ENV === 'production' ? 'https://chardonnay.herokuapp.com/callback' : 'http://localhost:3000/callback';

  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: callbackURL
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
        models.User.findOrCreate({
          where: { spotify_id: profile.id },
          defaults: { access_token: accessToken, refresh_token: refreshToken }}).spread((user, created) => {
            if (created === false) {
              user.update({ access_token: accessToken, refresh_token: refreshToken });
            }
            return done(null, user);
        });
      }
    )
  );
}
