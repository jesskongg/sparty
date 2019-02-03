// function to delay ms before execute
// ref: https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

$(function() {
  // search room
  $("#room_search").keyup(function() {
    delay(function() {
      var query = $("#room_search").val().trim();
      if (query != '') {
        $.getJSON(
          "/api/room/search", {
            query: query,
          }, function(resp) {
                if (resp.length) {
                  $(".modal-body").empty();
                  $(".modal-header").text('Room with ' + query);
                  $("#searchModal").modal("show");
                  resp.forEach(function(ea) {
                    $(".modal-body").append(`
                      <div class="media-object clickable" id='search_room${ea.id}'>
                          <div class="media">
                            <img class="align-self-center mr-3 img-fluid" src='${ea.avatar}' alt="Song Cover" width="48" height="48">
                            <div class="media-body">
                              <h6 class="mt-0">${ea.name}</h6>
                            </div>
                          </div>
                      </div>
                      <br>
                    `)

                      // handle click
                      $(`#search_room${ea.id}`).click(function() {
                        if (ea.public) {
                          window.location.href = '/api/room/' + ea.id;
                        } else {
                          $("#searchModal").modal("hide");
                          let objectId = 'room' + ea.id;
                          let roomId = ea.id;
                          openRoom(roomId);
                          $([document.documentElement, document.body]).animate({
                              scrollTop: $(`#${objectId}`).offset().top
                          }, 2000);
                        }
                      })
                    })
                }
            }
          )
      }
    }, 300);
  });

})

function openRoom(roomId) {
  var formId = 'key_form' + roomId;
  $(`#${formId}`).toggleClass('display-none');
}
