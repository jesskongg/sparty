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
  list_room.forEach(function(room) {
    var roomId = Object.keys(room)[0];
    var objectId = 'room' + roomId;
    $(`#${objectId}`).click(function() {
      var url = '/api/room/' + roomId;
      if (room[roomId] === true) {
        window.location.href = url;
      } else {
        // option 2: show the form
        var formId = 'key_form' + roomId;
        enterRoom(objectId, formId, roomId);
      }
    })
  });

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
                  // var newElement = $('<a></a>');
                  resp.forEach(function(ea) {
                    $(".modal-body").append(`
                        <div class="row mx-auto user-list">
                            <div class="col-12 col-sm-12 col-md-12 col-lg-12 flex-fill m-auto user-item">
                                <a class="user-link" id='search_room${ea.id}'>
                                    <div class="user-container">
                                        <div class="user-avatar">
                                          <img class="img-fluid" src='${ea.avatar}' alt="Song Cover" width="48" height="48">
                                        </div>
                                        <p class="user-name">
                                          <strong>${ea.name}</strong>
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>
                      `)

                      // handle click
                      $(`#search_room${ea.id}`).click(function() {
                        if (ea.public) {
                          window.location.href = '/api/room/' + ea.id;
                        } else {
                          $("#searchModal").modal("hide");
                          let objectId = 'room' + ea.id;
                          let formId = 'key_form' + ea.id;
                          let roomId = ea.id;
                          enterRoom(objectId, formId, roomId);
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

/* function to handle enter private room with key
    objectId: div element contains roomId
    formId: form element to ask for key
*/
function enterRoom(objectId, formId, roomId) {
  // var formId = 'key_form' + roomId;
  $(`#${formId}`).empty();
  $(`#${formId}`).append(`
    <form id="enter_key_form" method="GET" action="/api/room/${roomId}">
      <div class="form-group">
        <input class="form-control" placeholder="room key" name="room_key" require="true" value="" type="password">
      </div>
      <button class="btn btn-light" type="submit">Enter Room</button>
    </form>
  `)
  $(`#${formId}`).toggle();
  $('body, html').animate({ scrollTop: $(`#${objectId}`).offset().top }, 10);
  if ($(`#${formId}`)) {
    $(`#${formId}`).find("input").focus();
  }
}
