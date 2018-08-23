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
            $("#searchResults").empty();
            $("#close").show();
            // var newElement = $('<a></a>');
            resp.forEach(function(ea) {
              // var newElement = $('<li></li>').addClass("list-group-item");
              $("#searchResults").append(`
                <div class="row mx-auto user-list" >
                  <div class="col-12 col-sm-6 col-md-4 col-lg-5 flex-fill m-auto user-item">
                    <div class="user-container" id='${ea.id}search_song'>
                      <a class="text-truncate user-avatar">
                        <img class="rounded-circle img-fluid" src='${ea.image}' width="48" height="48">
                      </a>
                      <p class="user-name">
                        <a>${ea.song}</a>
                        <span>${ea.artist} </span>
                        <span>${ea.album} </span>
                      </p>
                      <a id='${ea.id}' class="bg-primary user-delete">
                        <span>+</span>
                      </a>
                    </div>
                  </div>
                </div>
                `)
                // $("#searchResults").append(newElement);
                $(`#${ea.id}`).click(function() {
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

  $("#close").click(function() {
    $("#song_search").val('');
    $("#searchResults").empty();
    $("#close").hide();
    socket.emit('update_candidate_list', 'data');
  })

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
      var newElement = $(`<a id='${ea.id}AddVote'></a>`);
      newElement.append(`
        <div class="row mx-auto user-list">
            <div class="col-12 col-sm-6 col-md-4 col-lg-5 flex-fill m-auto user-item">
                <div class="user-container">
                  <a href="#" class="user-avatar">
                    <img class="rounded-circle img-fluid" src='${ea.image}' width="48" height="48">
                  </a>
                    <p class="user-name">
                      <a href="#">${ea.song}</a>
                      <span>${ea.artist} </span>
                      <span>${ea.album} </span>
                    </p>
                    <a class="bg-primary user-delete" href="#"> <span>${ea.vote}</span>
                    </a>
                  </div>
            </div>
        </div>
      `)
      $("#candidates").append(newElement);
      $(`#${ea.id}AddVote`).click(function() {
        socket.emit('add_vote', ea);
      });
      $('#candidates').show();
    }
  });

  $("#start").click(function() {
      $("#start").hide();
      socket.emit('get next song', roomId);
  });

  socket.on('update current song', function(track) {
    if (track.uri) {
      $("#currentSong").empty();
      $("#currentSong").append(`
        <div class="row mx-auto user-list">
          <div class="col-12 col-sm-6 col-md-4 col-lg-5 flex-fill m-auto user-item">
          <p>You are listening</p>
            <div class="user-container">
              <a class="text-truncate user-avatar">
                <img class="rounded-circle img-fluid" src='${track.image}' width="48" height="48">
              </a>
              <p class="user-name">
                <a>${track.song}</a>
                <span>${track.artist} </span>
                <span>${track.album} </span>
              </p>
            </div>
          </div>
        </div>
        `)
      }
  });

});
