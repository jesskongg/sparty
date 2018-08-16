// match the namespace defined on server
var socket = io.connect('http://localhost:3000/api/rooms');

// Shorthand for $( document ).ready()
$(function() {
  // ajax function to search song from spotify
  $("#search").click(function() {
    if ($("#query").val() === '') {
      console.log('really');
      $("#search-list").empty();
    } else {
      console.log('you are doning something');
      $.getJSON(
        "/api/search", {
          query: $("#query").val(),
        }, function(resp) {
          $(".modal-title").text("Search for " + $("#query").val());
          $(".modal-body").empty();
          resp.forEach(function(ea) {
            // var newElement = $('<li></li>').addClass("list-group-item");
            var newElement = $('<p></p>');
            newElement.append(`<img id='album-image' src='${ea.image}' style='height: 50px'/>
            <span>${ea.song}</span>
            `)
            $(".modal-body").append(newElement);
          })
        }
      )
    }
  });

  $("#close").click(function() {
    $("#search-list").empty();
  });

  // socket.io
  socket.on('connect', function (data) {
    socket.emit('my other event', { my: 'data' });
  });

  socket.on('news', function(data) {
    console.log(data);
  });

});
