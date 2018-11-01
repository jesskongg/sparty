// configure passport spotify
const SpotifyStrategy = require('passport-spotify').Strategy;
var models = require('../models');

module.exports = function(passport) {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session. Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.
  passport.serializeUser(function(user, done) {
    done(null, user.spotify_id);
  });

  passport.deserializeUser(function(id, done) {
    models.User.findById(id).then(user => {
        done(null, user);
    });
  });

  passport.use(
    new SpotifyStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'https://www.spartyfy.me/callback'
        // callbackURL: 'https://chardonnay.herokuapp.com/callback'
        // callbackURL: 'http://localhost:3000/callback'
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
