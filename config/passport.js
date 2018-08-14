// configure passport spotify
const SpotifyStrategy = require('passport-spotify').Strategy;

module.exports = function(passport) {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session. Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing. However, since this example does not
  //   have a database of user records, the complete spotify profile is serialized
  //   and deserialized.
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new SpotifyStrategy(
      {
        clientID: '64e65c3badf846158593504b9b5ce162',
        clientSecret: 'e3426eb15a3b434ba3dd5176a152e62d',
        callbackURL: 'http://localhost:3000/callback'
      },
      function(accessToken, refreshToken, expires_in, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function() {
          // To keep the example simple, the user's spotify profile is returned to
          // represent the logged-in user. In a typical application, you would want
          // to associate the spotify account with a user record in your database,
          // and return that user instead.
          // return done(null, profile);
          return done(null, profile);
        })
      })
    );
}
