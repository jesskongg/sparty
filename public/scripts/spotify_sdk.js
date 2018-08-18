window.onSpotifyWebPlaybackSDKReady = () => {
  var id;
  const token = access_token;
  const player = new Spotify.Player({
    name: 'Web Playback SDK Quick Start Player',
    getOAuthToken: cb => { cb(token); }
  });

  // Error handling
  player.addListener('initialization_error', ({ message }) => { console.error(message); });
  player.addListener('authentication_error', ({ message }) => { console.error(message); });
  player.addListener('account_error', ({ message }) => { console.error(message); });
  player.addListener('playback_error', ({ message }) => { console.error(message); });

  // Playback status updates
  player.addListener('player_state_changed', state => { console.log(state); });

  // Ready
  player.addListener('ready', ({ device_id }) => {
    console.log('Ready with Device ID', device_id);
    id = device_id;
  });

  // Not Ready
  player.addListener('not_ready', ({ device_id }) => {
    console.log('Device ID has gone offline', device_id);
  });

  // Connect to the player!
  player.connect();

  $("#play").click(function() {
    // TODO: make ajax call to https://api.spotify.com/v1/me/player/play
    $.ajax({
      method: 'PUT',
      url: 'https://api.spotify.com/v1/me/player/play?device_id=' + id,
      body: {
        "context_uri": "spotify:album:5ht7ItJgpBH7W6vJ5BqpPr",
        "offset": {
          "position": 5
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
    }).done(function(data) {
      console.log('you are playing song');
    }).fail(function(err) {
      console.log('not good');
    })
  });

  $("#pause").click(function() {
    // TODO: make ajax call to https://api.spotify.com/v1/me/player/play
    $.ajax({
      method: 'PUT',
      url: 'https://api.spotify.com/v1/me/player/pause?device_id=' + id,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
    }).done(function(data) {
      console.log('you are pausing song');
    }).fail(function(err) {
      console.log('not good');
    })
  });

  $("#transfer").click(function() {
    // TODO: make ajax call to https://api.spotify.com/v1/me/player/play
    $.ajax({
      method: 'PUT',
      url: 'https://api.spotify.com/v1/me/player',
      body: {
        device_ids: ["50612aeccc477a03aae16ea28e3c2fa7e24d6091"], "play": true
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
    }).done(function(data) {
      console.log('you are swiching device');
    }).fail(function(err) {
      console.log('not good');
    })
  });

};

// playback
