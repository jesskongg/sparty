const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var models = require('../models/');

exports.room_list = function(req, res, next) {
  models.Room.findAll().then(rooms => {
    res.render('room_list', { title: 'Room List', rooms: rooms });
  })
};

exports.room_detail = function(req, res, next) {
  models.Room.findById(req.params.id).then(room => {
    if (room) {
      var abc = isOwner(room, req.user);
      res.locals.isOwner = isOwner(room, req.user);
      if (abc === true) {
        res.render('room_detail', { room: room, token: req.user.access_token })
      } else {
        res.render('room_detail', { room: room });
      }
    } else {
      res.redirect('/');
    }
  })
};

exports.room_create_get = function(req, res, next) {
  res.render('room_form', { title: 'Create Room' });
};

exports.room_create_post = [
  // Validate fields.
  body('room_name').isLength({ min: 1 }).trim().withMessage('Room name must be specified.'),
  body('room_key').trim().isAlphanumeric().withMessage('Room key has non-alphanumeric characters.'),

  // Sanitize fields.
  sanitizeBody('room_name').trim().escape(),
  sanitizeBody('room_key').trim().escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('room_form', { title: 'Create Room', room: req.body, errors: errors.array() });
        return;
    }
    else {
        // Data from form is valid.
        var room_type = true;
        if (req.body.room_type) {
          room_type = false;
        }
        var avatars = [ 'https://images.pexels.com/photos/342520/pexels-photo-342520.jpeg',
                        'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg',
                        'https://images.pexels.com/photos/1071882/pexels-photo-1071882.jpeg',
                        'https://images.pexels.com/photos/1251089/pexels-photo-1251089.jpeg',
                        ]
        // Create a Room object with escaped and trimmed data.
        var room_avatar = (req.body.room_avatar === '') ? avatars[Math.floor(Math.random(1, avatars.length)) + 0] : req.body.room_avatar;
        models.Room.build({
                    name: req.body.room_name,
                    key: req.body.room_key,
                    public: room_type,
                    avatar: room_avatar,
                    owner: req.user.spotify_id,
                  }).save().then(room => {
                      res.redirect(room.getUrl());
                  }).catch(err => {
                      return next(err);
                  })
    }
  }
];

exports.room_update_get = function(req, res, next) {
  res.send('TODO');
}
exports.room_update_post = [
  // sanitize input
  (req, res, next) => {

  }
]
exports.room_delete_get = function(req, res, next) {
  res.send('TODO');
}
exports.room_delete_post = function(req, res, next) {
  res.send('TODO');
};

function isOwner(room, user) {
  if (user) {
    return room.owner === user.spotify_id;
  }
  return false;
}
