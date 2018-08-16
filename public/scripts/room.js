// match the namespace defined on server
var socket = io.connect('http://localhost:3000/api/rooms');

// Shorthand for $( document ).ready()
$(function() {
  // ajax function to search song from spotify
  $("#search").click(function() {
    if ($("#query").val() === '') {
      $("#query").val('hello');
    }
    $.getJSON(
      "/api/search", {
        query: $("#query").val(),
      }, function(resp) {
        $(".modal-title").text("Search for " + $("#query").val());
        $(".modal-body").empty();
        var newElement = $('<p></p>');
        newElement.append(`
          <div class='container'>
            <div class='row'>
              <div class='col-sm'>
                <strong>COVER</strong>
              </div>
              <div class='col-sm'>
                <strong>ALBUM</strong>
              </div>
              <div class='col-sm'>
                <strong>SONG</strong>
              </div>
              <div class='col-sm'>
              </div>
            </div>
          </div>
          <hr>
        `)
        $(".modal-body").append(newElement);

        resp.forEach(function(ea) {
          // var newElement = $('<li></li>').addClass("list-group-item");
          var newElement = $('<p></p>');
          newElement.append(`
            <div class='container'>
              <div class='row'>
                <div class='col-sm'>
                  <img id='album-image' src='${ea.image}' style='height: 40px'/>
                </div>
                <div class='col-sm'>
                  ${ea.album}
                </div>
                <div class='col-sm'>
                  ${ea.song}
                </div>
                <div class='col-sm'>
                  <button type="button" class="btn btn-outline-primary" id=${ea.id}>Add</button>
                </div>
              </div>
            </div>
            <hr>
          `)
          $(".modal-body").append(newElement);
          $(`#${ea.id}`).click(function() {
            ea.vote = 1;
            socket.emit('add_candidate', ea);
          })
        })
      }
    )
  });

  $("#searchModal").on('hidden.bs.modal', function() {
    $("#search-list").empty();
      socket.emit('update_candidate_list', 'show');
  });

  // socket.io
  socket.on('connect', function(data) {
    socket.emit('room', roomId);
  });

  // update number of people in the room
  socket.on('people_join', function(data) {
    $("#num_peope").text(data);
  });

  socket.on('people_left', function(data) {
    $("#num_peope").text(data);
  });

  socket.on('show_list', function(candidates) {
    // sort candidates list to put on top the highest vote song
    if (candidates) {
      candidates = Object.values(candidates);
      candidates.sort(function(a, b) {
        return b.vote - a.vote;
      })
    }

    $('#candidates').empty();
    for (var key in candidates) {
      let ea = candidates[key];
      var newElement = $('<p></p>');
      newElement.append(`
        <div class='container'>
          <div class='row'>
            <div class='col-sm'>
            <img id='album-image' src='${ea.image}' style='height: 40px'/>
            </div>
          <div class='col-sm'>
            ${ea.album}
          </div>
          <div class='col-sm'>
            ${ea.song}
          </div>
          <div class='col-sm'>
            <input type='text' value='${ea.vote}' id='${ea.id}NumVote' readOnly>
          </div>
            <div class='col-sm'>
              <button type="button" class="btn btn-outline-primary" id='${ea.id}AddVote'>+</button>
            </div>
          </div>
        </div>
        <hr>
      `)
      $("#candidates").append(newElement);
      $(`#${ea.id}AddVote`).click(function() {
        socket.emit('add_vote', ea);
      });
    }
  });

});
