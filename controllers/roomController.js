const Sequelize = require('sequelize');
// const sequelize = new Sequelize();

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var models = require('../models/');

const avatars = [ '/images/pexels-photo-534031.jpeg',
                '/images/pexels-photo-605408.jpeg',
                '/images/pexels-photo-796606.jpeg',
                '/images/pexels-photo-1251089.jpeg',
              ];

exports.room_list = function(req, res, next) {
  models.Room.findAll({
    attribute: ['id', 'name', 'public']
  }).then(rooms => {
    res.render('room_list', { title: 'Room List', rooms: rooms });
  })
};

exports.room_detail = function(req, res, next) {
  models.Room.findById(req.params.id).then(room => {
    if (room) {
      res.locals.isOwner = isOwner(room, req.user);
      if (room.public || (!room.public && req.query.room_key === room.key)) {
        if (isOwner(room, req.user) === true) {
          // TODO: should not send the access key to client
          res.render('room_detail', { room: room, token: req.user.access_token })
        } else {
          res.render('room_detail', { room: room });
        }
      } else {
        res.redirect('/');
      }
    } else {
      // everything wrong will lead to homepage
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
  // TODO: this will change all input to html escape symbols: need to fix it
  sanitizeBody('*').trim().escape(),

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
        console.log(req.body);
        if (req.body.room_type) {
          room_type = false;
        }
        // Create a Room object with escaped and trimmed data.
        models.Room.build({
                    name: req.body.room_name,
                    key: req.body.room_key,
                    public: room_type,
                    avatar: avatars[getRandomInt(0, avatars.length)],
                    description: req.body.room_description,
                    owner: req.user.spotify_id,
                  }).save().then(room => {
                      res.redirect(room.getUrl() + '?room_key=' + room.key);
                  }).catch(err => {
                      return next(err);
                  })
    }
  }
];

exports.room_update_get = function(req, res, next) {
  models.Room.findById(req.params.id).then(function(room) {
    if (room) {
      res.render('room_form', { title: 'Update Room', room: room });
    } else {
      res.redirect('/');
    }
  })
}
exports.room_update_post = [
  // sanitize input
  body('room_name').isLength({ min: 1 }).trim().withMessage('Room name must be specified.'),
  body('room_key').trim().isAlphanumeric().withMessage('Room key has non-alphanumeric characters.'),

  // Sanitize fields.
  sanitizeBody('*').trim().escape(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('room_form', { title: 'Update Room', room: req.body, errors: errors.array() });
        return;
    }
    else {
        // Data from form is valid.
        var room_type = true;
        if (req.body.room_type) {
          room_type = false;
        }

        // Create a Room object with escaped and trimmed data.
        // TODO: implement upload photo feature for room's avatar
        models.Room.findById(req.params.id).then(function(room) {
          room.update({
            name: req.body.room_name,
            key: req.body.room_key,
            public: room_type,
            description: req.body.room_description,
          }).then(() => {
            console.log('successfully updated');
            res.redirect(room.getUrl());
          }).catch(function(err) {
            res.render('room_form', { title: 'Update Room', room: req.body, error: err })
          })
        })
    }
  }
]

exports.room_delete_get = function(req, res, next) {
  models.Room.findById(req.params.id).then(function(room) {
    if (room) {
      res.render('room_delete', { title: 'Delete Room', room: room });
    } else {
      res.redirect('/');
    }
  })
}
exports.room_delete_post = function(req, res, next) {
  models.Room.findById(req.params.id).then(function(room) {
    return room.destroy();
  }).then(() => {
    res.redirect('/api/rooms');
  })
};

// TODO: consider to send rooms just once to the client for efficient search
// ref: https://stackoverflow.com/questions/42352090/sequelize-find-all-that-match-contains-case-insensitive
exports.room_search = function(req, res, next) {
  let lookupValue = req.query.query.toLowerCase();
  models.Room.findAll({
    attribute: ['id', 'name', 'public'],
    limit: 10,
    where: {
        name: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), 'LIKE', '%' + lookupValue + '%')
    }
  }).then(function(rooms){
      res.json(rooms);
  }).catch(function(error){
      console.log(error);
  });
};

function isOwner(room, user) {
  if (user) {
    return room.owner === user.spotify_id;
  }
  return false;
}

// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
