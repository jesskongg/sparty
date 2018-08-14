// Shorthand for $( document ).ready()
$(function() {

    $("#search").click(function() {
      if ($("#query").val() === '') {
        $("#search-list").empty();
      } else {
        $.getJSON(
          "/api/search", {
            query: $("#query").val(),
          }, function(resp) {
            $("#search-list").empty();
            resp.forEach(function(ea) {
              var newElement = $('<li></li>').addClass("list-group-item");
              newElement.append(`<img id='album-image' src='${ea.image}' style='height: 50px'/>
              <span>${ea.song}</span>
              `)
              $("#search-list").append(newElement);
            })
          }
        )
      }
    })


});
