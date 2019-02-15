// match the namespace defined on server
// var socket = io.connect('https://www.spartyfy.me/api/rooms');
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
  var selectSongs = [];

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
              createSongDiv('#searchResult', ea, 'song', 'invisible');
              $('#searchResult').append(`<br>`);
              $(`#${ea.id}song`).click(function(event) {
                selectSong(ea, `${ea.id}song`, selectSongs, event, true);
              });
            })
          }
        )
      }
    }, 300);
  });

  var topSongs = {};

  $("#getCandidates").click(function() {
    let url = '/api/room/' + roomId + '/getCandidates';
    $.getJSON(url, function(topCandidates) {
      topSongs = topCandidates;
      $(".modal-body").empty();
      topCandidates.forEach(function(ea) {
        createSongDiv('.modal-body', ea, 'suggestion', 'invisible');
        $(".modal-body").append(`<br>`);
        $(`#${ea.id}suggestion`).click(function(event) {
          selectSong(ea, `${ea.id}suggestion`, selectSongs, event, false);
        });
      })
    })
  })

  $("#addAll").click(function() {
    topSongs.forEach(function(ea) {
      ea.vote = 1;
      socket.emit('add_candidate', ea);
    })
  })

  // click outside to close the search box
  $(document).click(function() {
    if ($("#searchResult").contents().length) {
      $("#searchResult").hide();
      $("#song_search").val('');
      socket.emit('update_candidate_list', selectSongs);
      selectSongs = [];
    }
  })

  // close top 10 songs modal
  $('#topCandidates').on('hidden.bs.modal', function() {
    socket.emit('update_candidate_list', selectSongs);
    selectSongs = [];
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
      // nextSong = candidates[0];
    }
    $('#candidates').empty();
    for (var key in candidates) {
      let ea = candidates[key];
      createSongDiv('#candidates', ea, 'candidate', '');
      $("#candidates").append(`<br>`);
      $(`#${ea.id}candidate`).click(function() {
        $(`#${ea.id}remove`).removeClass('invisible');
        socket.emit('add_vote', ea);
      });
    }
    $('#candidates').show();
  });

  socket.on('update current song', function(track) {
    if (track.uri) {
      $("#currentSong").empty();
      $("#currentSong").append('<p>Playing</p>');
      createSongDiv('#currentSong', track, '', 'invisible');
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
function createSongDiv(element, ea, id, style) {
  $(element).append(`
    <div class="media-object clickable rounded" id='${ea.id}${id}'>
      <div class="media">
        <img class="rounded-circle align-self-center mr-3 img-fluid" src='${ea.image}' alt="Song Cover" width="48" height="48">
        <div class="media-body">
          <h6 class="mt-0 detail">${ea.name}</h6>
          <p class="detail small">${ea.artist}</p>
          <p class="detail small">${ea.album}</p>
        </div>
      </div>
      <div class="bg-success count-icon ${style}">
        ${ea.vote}
      </div>
    </div>
  `)
}

function selectSong(ea, id, array, event, stopPropagation) {
    if (stopPropagation === true) {
      event.stopImmediatePropagation();
    }
    $(`#${id}`).toggleClass('selected');
    if ($(`#${id}`).hasClass('selected')) {
      ea.vote = 1;
      array.push(ea);
    } else {
      let eaIndex = array.indexOf(ea);
      array.splice(eaIndex, 1);
    }
}
