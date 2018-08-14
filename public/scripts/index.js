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
    })

    $("#close").click(function() {
      $("#search-list").empty();
    })
});
