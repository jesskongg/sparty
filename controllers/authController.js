var jwt = require('jsonwebtoken');

exports.generateToken = function(user) {
  return jwt.sign({user: user.spotify_id}, process.env.JWT_TOKEN);
}

exports.authenticate = function(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).json({error: 'Forbidden'});
  }
  token = req.headers.authorization.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_TOKEN, function(err, decoded) {
    if (err) return res.status(403).json({error: err});
    req.user = decoded.user;
    next();
  })
}
