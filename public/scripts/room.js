// Shorthand for $( document ).ready()
$(function() {

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
    })

    $("#close").click(function() {
      $("#search-list").empty();
    })
});
