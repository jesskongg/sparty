// match the namespace defined on server
// var socket = io.connect('http://localhost:3000/api/rooms');
var socket = io.connect('https://chardonnay.herokuapp.com/api/rooms');


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

  socket.on('connect', function(data) {
    socket.emit('room', roomId);
  });

  $("#song_search").keyup(function() {
    delay(function() {
      var query = $("#song_search").val().trim();
      // ajax function to search song from spotify
      if (query === '') {
        $("#searchResult").hide();
      } else {
        $("#candidates").hide();
        $.getJSON(
          "/api/search", {
            query: query,
          }, function(resp) {
            $("#searchResult").empty();
            $("#searchResult").show();
            resp.forEach(function(ea) {
              createSongDiv('#searchResult', ea, 'song', 'search_song', 'none');
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

  $("#getCandidates").click(function() {
    url = '/api/room/' + roomId + '/getCandidates'
    $.getJSON(url, function(topCandidates) {
      $(".modal-body").empty();
      topCandidates.forEach(function(ea) {
        createSongDiv('.modal-body', ea, 'suggestion', 'suggestion_song', 'none');
        $(`#${ea.id}suggestion`).click(function(event) {
          event.stopImmediatePropagation(); // to prevent closing modal
          $(`#${ea.id}suggestion_song`).css('background-color', 'rgba(0,0,0,0.1)');
          ea.vote = 1;
          socket.emit('add_candidate', ea);
        })
      })
    })
  })

  $(document).click(function () {
    if ($("#searchResult").contents().length) {
      $("#searchResult").hide();
      $("#song_search").val('');
      socket.emit('update_candidate_list', 'data');
    }
  })

  $('#topCandidates').on('hidden.bs.modal', function (e) {
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
      createSongDiv('#candidates', ea, 'candidate', 'candidate-song', '');
      $(`#${ea.id}candidate`).click(function() {
        socket.emit('add_vote', ea);
      });
      $('#candidates').show();
    }
  });

  socket.on('update current song', function(track) {
    if (track.uri) {
      $("#currentSong").empty();
      $("#currentSong").append('<p>You are listening</p>');
      createSongDiv('#currentSong', track, '', '', 'none');
      }
  });

});


/* convenient to create a song element
  element: jquery element to append song elements
  ea: song data
  id1: <a id=id1> for selection
  id2: <div id=id2> for css when id1 is on click
  style: 'none' or '' for showing #vote el
*/
function createSongDiv(element, ea, id1, id2, style) {
  $(element).append(`
      <div class="row no-gutters mx-auto user-list">
          <div class="col flex-fill m-auto user-item">
            <a class="user-link" id='${ea.id}${id1}'>
              <div class="user-container" id='${ea.id}${id2}'>
                <div class="user-avatar">
                  <img class="rounded-circle img-fluid" src='${ea.image}' alt="Cover" width="48" height="48">
                </div>
                <p class="user-name">
                  <strong>${ea.name}</strong>
                  <span>${ea.artist}</span>
                  <span>${ea.album}</span>
                </p>
                <p class="bg-primary user-delete" style="display: ${style}">
                  <span>${ea.vote}</span>
                </p>
              </div>
            </a>
          </div>
      </div>
  `)
}
