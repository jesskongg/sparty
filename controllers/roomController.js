const Sequelize = require('sequelize');
// const sequelize = new Sequelize();
const Op = Sequelize.Op;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var models = require('../models/');

var date = require('date-and-time');

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
      if (room.public || req.query.room_key === room.key) {
        res.render('room_detail', { room: room })
      } else {
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  })
};

exports.room_create_get = function(req, res, next) {
  if (isLogin(req.user)) {
    res.render('room_form', { title: 'Create Room' });
  } else {
    res.redirect('/');
  }
};

exports.room_create_post = [
  // Validate fields.
  body('room_name').isLength({ min: 1 }).trim().withMessage('Room name must be specified.'),
  body('room_key').trim().isAlphanumeric().withMessage('Room key has non-alphanumeric characters.'),
  // TODO: consider allow user to select expired date
  // body('room_expired').optional({checkFalsy: true}).isISO8601().withMessage('Invalid date').toDate().custom(value => {
  //   var today = new Date();
  //   var msPerDay = 24 * 60 * 60 * 1000;
  //   period = Math.round((value.getTime() - today.getTime())/msPerDay);
  //   if (period > 7) {
  //     return Promise.reject('Expired date must be within 7 days');
  //   } else {
  //     return value;
  //   }
  // }),
  // Sanitize fields.
  // TODO: this will change all input to html escape symbols: need to fix it
  sanitizeBody('room_name').trim().escape(),
  sanitizeBody('room_key').trim().escape(),
  sanitizeBody('room_description').trim().escape(),
  // sanitizeBody('room_expired').toDate(),

  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // build a new room with req.body data
    var room_type = true;
    if (req.body.room_type) {
      room_type = false;
    }

    var expired = new Date();
    expired = date.addDays(expired, 7);

    var newRoom = models.Room.build({
      name: req.body.room_name,
      key: req.body.room_key,
      public: room_type,
      avatar: avatars[getRandomInt(0, avatars.length)],
      expired: expired,
      description: req.body.room_description,
      owner: req.user.spotify_id,
    })

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('room_form', { title: 'Create Room', room: newRoom, errors: errors.array() });
        return;
    }
    else {
        // Data from form is valid.

        // Create a Room object with escaped and trimmed data.
        newRoom.save().then(room => {
                      res.redirect(room.getUrl() + '?room_key=' + room.key);
                  }).catch(err => {
                      return next(err);
                  })
    }
  }
];

exports.room_update_get = function(req, res, next) {
  models.Room.findById(req.params.id).then(function(room) {
    if (room && isOwner(room, req.user)) {
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

        var newRoom = {
          name: req.body.room_name,
          key: req.body.room_key,
          public: room_type,
          description: req.body.room_description,
        }

        // Create a Room object with escaped and trimmed data.
        // TODO: implement upload photo feature for room's avatar
        models.Room.findById(req.params.id).then(function(room) {
          room.update(newRoom).then(() => {
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
    if (room && isOwner(room, req.user)) {
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

// add song to Room: when a top song is picked
exports.room_add_song = function(song, roomId) {
  if (song) {
    var songData = {
      id: song.id,
      name: song.name,
      album: song.album,
      artist: song.artist,
      image: song.image,
      uri: song.uri
    }
    var noOfVoteForSong = song.vote;
    models.Song.findOrCreate({
      where: { id: song.id },
      defaults: songData
    }).spread((newSong, created) => {
      // check if the room already has the song
      models.RoomSong.findOne({ where: { roomId: roomId, songId: newSong.get({ plain: true}).id } }).then(result => {
        if (result) {
          noOfVoteForSong = result.vote + noOfVoteForSong;
        }
        models.Room.findById(roomId).then(room => {
          room.addSong(newSong, { through: { vote: noOfVoteForSong }})
        })
      })
    })
  }
}

exports.room_cleanup = function() {
  var current = new Date();
  models.Room.findAll().then(rooms => {
    rooms.forEach(function(room) {
      if (room.expired.getTime() < current.getTime()) {
        room.destroy();
      }
    })
  })
}

exports.room_candidate_suggestion_get = function(req, res, next) {
    models.RoomSong.findAll({
      attributes: ['songId', [Sequelize.fn('sum', Sequelize.col('vote')), 'total_vote']
      ],
      group: ['songId'],
      order: [[Sequelize.fn('sum', Sequelize.col('vote')), 'DESC']],
      limit: 10, // top ten songs with highest #vote_count
      raw: true,
  }).then((candidates) => {
      var songIdArray = candidates.map(function(el) { return el.songId; })
      if (songIdArray.length === 0) {
        res.json();
      } else {
        models.Song.findAll({
          where: {
            id: {
              [Op.or]: [songIdArray]
            }
          }
        }).then((songs) => {
          res.json(songs);
        })
      }
  })
}


function isOwner(room, user) {
  if (user) {
    return room.owner === user.spotify_id;
  }
  return false;
}

function isLogin(user) {
  if (user) {
    return true;
  } else {
    return false;
  }
}

// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
