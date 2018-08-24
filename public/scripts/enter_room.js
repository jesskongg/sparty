$(function() {
  list_room.forEach(function(room) {
    var roomId = Object.keys(room)[0];
    var objectId = 'room' + roomId;
    $(`#${objectId}`).click(function() {
      var url = '/api/room/' + roomId;
      if (room[roomId] === true) {
        window.location.href = url;
      } else {
        // TODO: popup is not recommended on touch devices
        // console.log('need to enter key');
        // var room_key = prompt("Please enter the room key");
        // if (room_key == null || room_key == "") {
        //     console.log('do nothing');
        // } else {
        //     $("#enter_key_form").attr("action", url);
        //     $("#room_key").val(room_key);
        //     $("#enter_room").click();
        // }

        // option 2: show the form
        var formId = 'key_form' + roomId;
        $(`#${formId}`).empty();
        $(`#${formId}`).append(`
          <form id="enter_key_form" method="GET" action="/api/room/${roomId}">
            <div class="form-group">
              <input class="form-control" id="room_key" placeholder="room key" name="room_key" require="true" value="" type="text">
            </div>
            <button class="btn btn-light" id="enter_room" type="submit">Enter Room</button>
          </form>
        `)
        $('body, html').animate({ scrollTop: $(`#${objectId}`).offset().top }, 1000);
        $(`#${formId}`).toggle();
      }
    })
  })
})
