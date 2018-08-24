$(function() {
  list_room.forEach(function(room) {
    var roomId = Object.keys(room)[0];
    var objectId = 'room' + roomId;
    $(`#${objectId}`).click(function() {
      var url = '/api/room/' + roomId;
      if (room[roomId] === true) {
        window.location.href = url;
      } else {
        console.log('need to enter key');
        var room_key = prompt("Please enter the room key");
        if (room_key == null || room_key == "") {
            console.log('do nothing');
        } else {
            $("#enter_key_form").attr("action", url);
            $("#room_key").val(room_key);
            $("#enter_room").click();
        }
      }
    })
  })
})
