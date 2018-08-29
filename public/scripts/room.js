// match the namespace defined on server
var socket = io.connect('http://localhost:3000/api/rooms');

socket.on('connect', function(data) {
  socket.emit('room', roomId);
});
// function to delay ms before execute
// ref: https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

// Shorthand for $( document ).ready()
$(function() {
  $("#song_search").keyup(function() {
    delay(function() {
      var query = $("#song_search").val().trim();
      // ajax function to search song from spotify
      if (query != '') {
        $("#candidates").hide();
        $.getJSON(
          "/api/search", {
            query: query,
          }, function(resp) {
            // $(".modal-title").text("Search for " + $("#song_search").val());
            $("#searchResult").empty();
            // $("#close").show();
            $("#searchResult").show();
            // var newElement = $('<a></a>');
            resp.forEach(function(ea) {
              // var newElement = $('<li></li>').addClass("list-group-item");
              $("#searchResult").append(`
                  <div id="song">
                      <div class="row no-gutters mx-auto user-list">
                          <div class="col flex-fill m-auto user-item">
                            <a class="user-link" id='${ea.id}song'>
                              <div class="user-container" id='${ea.id}search_song'>
                                <div class="user-avatar">
                                  <img class="rounded-circle img-fluid" src='${ea.image}' alt="Cover" width="48" height="48">
                                </div>
                                <p class="user-name">
                                  <strong>${ea.song}</strong>
                                  <span>${ea.artist}</span>
                                  <span>${ea.album}</span>
                                </p>
                              </div>
                            </a>
                          </div>
                      </div>
                  </div>
                `)
                // $("#searchResults").append(newElement);
                $(`#${ea.id}song`).click(function(event) {
                  event.stopImmediatePropagation();
                  $(`#${ea.id}search_song`).css('background-color', 'rgba(0,0,0,0.1)');
                  ea.vote = 1;
                  socket.emit('add_candidate', ea);
                })
              })
            }
          )
      }
    }, 300);
  });

  $(document).click(function () {
    if ($("#searchResult").contents().length) {
      $("#searchResult").hide();
      $("#song_search").val('');
      socket.emit('update_candidate_list', 'data');
    }
  })

  $('#song_search').on('focus', function(){
    // replace CSS font-size with 16px to disable auto zoom on iOS
    $(this).data('fontSize', $(this).css('font-size')).css('font-size', '16px');
  }).on('blur', function(){
    // put back the CSS font-size
    $(this).css('font-size', $(this).data('fontSize'));
  });

  // update number of people in the room
  socket.on('people_join', function(data) {
    $("#num_peope").text(data);
  });

  socket.on('people_left', function(data) {
    $("#num_peope").text(data);
  });

  // update list of candidates based on #votes
  socket.on('show_list', function(candidates) {
    // sort candidates list to put on top the highest vote song
    if (candidates) {
      candidates = Object.values(candidates);
      candidates.sort(function(a, b) {
        return b.vote - a.vote;
      })
      nextSong = candidates[0];
    }

    $('#candidates').empty();
    for (var key in candidates) {
      let ea = candidates[key];
      $("#candidates").append(`
        <div class="row no-gutters mx-auto user-list">
            <div class="col flex-fill m-auto user-item">
              <a class="user-link" id='${ea.id}candidate'>
                <div class="user-container" id='${ea.id}candidate-song'>
                    <div class="user-avatar">
                      <img class="rounded-circle img-fluid" src='${ea.image}' alt="Cover" width="48" height="48">
                    </div>
                    <p class="user-name">
                      <strong>${ea.song}</strong>
                      <span>${ea.artist}</span>
                      <span>${ea.album}</span>
                    </p>
                    <p class="bg-primary user-delete">
                      <span>${ea.vote}</span>
                    </p>
                </div>
              </a>
            </div>
        </div>
      `)
      $(`#${ea.id}candidate`).click(function() {
        socket.emit('add_vote', ea);
      });
      $('#candidates').show();
    }
  });

  socket.on('update current song', function(track) {
    if (track.uri) {
      $("#currentSong").empty();
      $("#currentSong").append(`
          <div id="song">
              <div class="row no-gutters mx-auto user-list">
                  <div class="col flex-fill m-auto user-item">
                    <p> You're listening </p>
                    <a class="user-link">
                      <div class="user-container">
                          <div class="user-avatar">
                            <img class="rounded-circle img-fluid" src='${track.image}' alt="Cover" width="48" height="48">
                          </div>
                          <p class="user-name">
                            <strong>${track.song}</strong>
                            <span>${track.artist}</span>
                            <span>${track.album}</span>
                          </p>
                      </div>
                    </a>
                  </div>
              </div>
          </div>
        `)
      }
  });

});
