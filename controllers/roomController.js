const Sequelize = require('sequelize');
// const sequelize = new Sequelize();
const Op = Sequelize.Op;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
var models = require('../models/');

const serverBaseUrl = process.env.NODE_ENV === 'production' ? 'https://chardonnay.herokuapp.com' : 'http://localhost:3000';

var date = require('date-and-time');

const avatars = [ '/images/pexels-photo-534031.jpeg',
                '/images/pexels-photo-605408.jpeg',
                '/images/pexels-photo-796606.jpeg',
                '/images/pexels-photo-1251089.jpeg',
              ];

// API: get list of rooms
exports.room_list = function(req, res) {
  models.Room.findAll({
    attributes: ['name', 'avatar', 'public', 'id', 'description']
  }).then(rooms => {
    // add server address to host photos
    for (var i = 0; i < rooms.length; i++)
      rooms[i].avatar = serverBaseUrl + rooms[i].avatar;
    return res.status(200).json(rooms);
  })
};

// API: get room's details
exports.room_detail = function(req, res) {
  models.Room.findById(req.params.id).then(room => {
    if (room && room.public) {
      return res.status(200).json(room);
    }
    if (!room) {
      return res.status(400).json({error: 'Not Found'});
    }
    if (!room.public && req.query.room_key === room.key) {
      console.log(req.params.room_key);
      return res.status(200).json(room);
    }
    return res.status(401).json({error: 'Unauthorized Access'})
  })
};

// API: create a new room
exports.room_create_post = [
  // Validate fields.
  body('room_name').isLength({ min: 1 }).trim().withMessage('Room name must be specified.'),
  body('room_key').trim().isAlphanumeric().withMessage('Room key has non-alphanumeric characters.'),
  body('room_type').isBoolean().withMessage('Room must be public or private'),
  sanitizeBody('room_name').trim().escape(),
  sanitizeBody('room_key').trim().escape(),
  sanitizeBody('room_description').trim().escape(),

  (req, res) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    var expired = new Date();
    expired = date.addDays(expired, 7);

    var newRoom = models.Room.build({
      name: req.body.room_name,
      key: req.body.room_key,
      public: req.body.room_type,
      avatar: avatars[getRandomInt(0, avatars.length)],
      expired: expired,
      description: req.body.room_description,
      owner: req.user,
    })

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    else {
      // Create a Room object with escaped and trimmed data.
      newRoom.save().then(room => {
                      return res.status(200);
                  }).catch(err => {
                      return res.status(500);
                  })
    }
  }
];

// API: update a room
// owner authorization is required
exports.room_update_post = [
  // sanitize input
  body('room_name').isLength({ min: 1 }).trim().withMessage('Room name must be specified.'),
  body('room_key').trim().isAlphanumeric().withMessage('Room key has non-alphanumeric characters.'),
  body('room_type').isBoolean().withMessage('Room must be public or private'),

  // Sanitize fields.
  sanitizeBody('*').trim().escape(),

  (req, res) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        return res.status(400);
    }
    else {
        // Data from form is valid.
        var newRoom = {
          name: req.body.room_name,
          key: req.body.room_key,
          public: req.body.room_type,
          description: req.body.room_description,
        }

        // Create a Room object with escaped and trimmed data.
        // TODO: implement upload photo feature for room's avatar
        models.Room.findById(req.params.id).then(function(room) {
          room.update(newRoom).then(() => {
            return res.status(200);
          }).catch(function(err) {
            return res.status(400);
          })
        })
    }
  }
]

// API: delete room
exports.room_delete_post = function(req, res, next) {
  models.Room.findById(req.params.id).then(function(room) {
    if (room && isOwner(room, req.user)) {
      room.destroy();
      return res.status(200);
    }
    if (!room) return res.status(404);
    else return res.status(401);
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
    return room.owner === user;
  }
  return false;
}

// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
