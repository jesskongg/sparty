var socket = io.connect('https://chardonnay.herokuapp.com/api/rooms');

window.onSpotifyWebPlaybackSDKReady = () => {
  var isPartyOn = false;
  var access_token;
  const player = new Spotify.Player({
    name: 'Welcome to Party Room ' + roomId,
    getOAuthToken: callback => {
      // Run code to get a fresh access token
      $.get('/api/auth/access_token')
      .then(token => {
        access_token = token;
        callback(token);
      })
    }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => {
    if (state) {
      if (state['paused'] === true && state['position'] === 0
      && state['restrictions']['disallow_pausing_reasons']
      && state['restrictions']['disallow_pausing_reasons'][0] === 'already_paused') {
        if (isPartyOn) {
          socket.emit('get next song', roomId);
        }
      }
    }
  });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    // switch to current device
    var dataObj = {
      "device_ids": [device_id],
      "play": false,
    };
    $.ajax({
      url: ' 	https://api.spotify.com/v1/me/player',
      method: 'PUT',
      data: JSON.stringify(dataObj),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    }).done(function(data) {
        console.log('Transfer the device');
    }).fail(function(err) {
        console.log('cannot transfer to your device');
    })
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();

  $("#resume").click(function() {
    player.resume().then(() => {
      console.log('resume');
    });
  });
  $("#pause").click(function() {
    player.pause().then(() => {
      console.log('paused');
    });
  });
  $("#previous").click(function() {
    player.previousTrack().then(() => {
      console.log('Set to previous track.');
    });
  });
  $("#skip").click(function() {
    socket.emit('get next song', roomId);
  });

  $("#start").click(function() {
      $("#start").hide();
      $("#controller").show();
      isPartyOn = true;
      socket.emit('get next song', roomId);
  });

  socket.on('get top song', function(track) {
    if (track.uri) {
      var dataObj = {
        "uris": [track.uri]
      };
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play',
        method: 'PUT',
        data: JSON.stringify(dataObj),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      }).done(function() {
        // this ajax call returns nothing
        socket.emit('current song', roomId)
      }).fail(function(err) {
        console.log('cannot play song');
      })
    }
  })
  // $("#template").click(function() {
  //   // TODO: currently test with hardcoded uri (success), need to send uri of top voted song
  //   // var dataObj = {
  //   //   "context_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
  //   //   "offset": {
  //   //     "position": 5
  //   //   }
  //   // };
  //   $.ajax({
  //     url: 'https://api.spotify.com/v1/me/player/play?device_id=' + id,
  //     method: 'PUT',
  //     // data: JSON.stringify(dataObj),
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${access_token}`
  //     },
  //   }).done(function(data) {
  //     console.log('You start the party');
  //   }).fail(function(err) {
  //     console.log('not good');
  //   })
  // });
};

// playback
