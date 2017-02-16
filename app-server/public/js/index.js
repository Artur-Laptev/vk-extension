// *****************************************
//
//
//
// *****************************************

var address = window.location.href.replace('http', 'ws'),
    ws = new WebSocket(address),
    wsID = false;

function wsSend(params) {
  $.extend(params, {
    id: wsID
  });
  ws.send(JSON.stringify(params));
}

$(document).ready(function () {

    // document.addEventListener('DOMContentLoaded', function() {
//   log('This is a test of an HTTP and WebSocket server. This application is ' +
//       'serving its own source code on port ' + port + '. Each client ' +
//       'connects to the server on a WebSocket and all messages received on ' +
//       'one WebSocket are echoed to all connected clients - i.e. a chat ' +
//       'server. Enjoy!');
// // FIXME: Wait for 1s so that HTTP Server socket is listening...
// setTimeout(function() {
//   var address = isServer ? 'ws://localhost:' + port + '/' :
//       window.location.href.replace('http', 'ws');
//   var ws = new WebSocket(address);
//   ws.addEventListener('open', function() {
//     log('Connected');
//   });
//   ws.addEventListener('close', function() {
//     log('Connection lost');
//     $('input').disabled = true;
//   });
//   ws.addEventListener('message', function(e) {
//     log(e.data);
//   });
//   $('input').addEventListener('keydown', function(e) {
//     if (ws && ws.readyState == 1 && e.keyCode == 13) {
//       ws.send(this.value);
//       this.value = '';
//     }
//   });
// }, 1e3);
// });
    // var socket = io(window.location.href, { reconnection: false });

    var content = document.getElementById('plwrap');
    content.addEventListener('touchstart', function(event) {
        this.allowUp = (this.scrollTop > 0);
        this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
        this.slideBeginY = event.pageY;
    });

    content.addEventListener('touchmove', function(event) {
        var up = (event.pageY > this.slideBeginY);
        var down = (event.pageY < this.slideBeginY);
        this.slideBeginY = event.pageY;
        if ((up && this.allowUp) || (down && this.allowDown)) {
            event.stopPropagation();
        }
        else {
            event.preventDefault();
        }
    });


    var positionChanging = false;

    var play = document.getElementById("play");
    var pause = document.getElementById("pause");
    var prev = document.getElementById("prev");
    var next = document.getElementById("next");
    var playerControls = document.getElementById("playerControls");

    var currentAudioTitle = document.getElementById("currentAudioTitle");
    var currentAudioArtist = document.getElementById("currentAudioArtist");

    var currentTime = document.getElementById("currentTime");
    var duration = document.getElementById("duration");

    play.onclick = onPlay;
    pause.onclick = onPause;
    next.onclick = onNext;
    prev.onclick = onPrev;

    var progressBar = $("#progressBar");
    progressBar.slider({
        range: "min",
        value: 0,
        max: 100,
        step: 0.1,
        slide: onSliderChanged
    });


    var volumeBar = $("#volumeBar");
    volumeBar.slider({
        range: "min",
        max: 100,
        slide: onVolumeSliderChanged
    });


    //***********************************
    // setInterval( function() {
    //     socket.emit('player:getCurrentTrack');
    // }, 1000);

    // socket.on('player:currentTrack', function (data) {
    //     console.log(data);

    //     setIsPlaying(data.isPlaying);

    //     if (data.isPlaying) {

    //         volumeBar.slider({ value: data.volume });

    //         currentAudioTitle.innerText = data.track.title;
    //         currentAudioArtist.innerText = data.track.artist;

    //         currentTime.innerText = data.time.toString();
    //         duration.innerText = data.duration.toString();

    //         progressBar.slider({ value: data.progress });
    //     }
    // });

    //***********************************

    // api("/isPlaying", null, null, function (isPlaying) {
    //     // setIsPlaying(isPlaying);
    //     console.log("returned:" + isPlaying);
    // });

    // api("/volume", null, null, function (volume) {
    //     volumeBar.slider({ value: volume });
    // });

    // setInterval(function () {
    //     api("/isPlaying", null, null, function (isPlaying) {
    //         setIsPlaying(isPlaying);
    //     });

    //     api("/currentTrack", null, null, function (trackInfo) {
    //         currentAudioTitle.innerText = trackInfo.track.title;
    //         currentAudioArtist.innerText = trackInfo.track.artist;

    //         currentTime.innerText = trackInfo.currentTime.toString().toShortTimeString();
    //         duration.innerText = trackInfo.duration.toString().toShortTimeString();

    //         if (!positionChanging)
    //             progressBar.slider({ value: trackInfo.currentTime, max: trackInfo.duration });
    //     });
    // }, 1000);


    function onPlay() {
        wsSend({ act: "vk_playPause" })
        setIsPlaying(true);
    }


    function onPause() {
        wsSend({ act: "vk_playPause" });
        setIsPlaying(false);
    }

    function onNext() {
        wsSend({ act: "vk_next" });
    }

    function onPrev() {
        wsSend({ act: "vk_prev" });
    }

    function onSliderChanged(event, ui) {
        // positionChanging = true;
        //
        // api("", "seek", ui.value, function (ok) {
        //     currentTime.innerText = ui.value.toString().toShortTimeString();
        // });
        //
        // positionChanging = false;
    }


    function onVolumeSliderChanged(event, ui) {
        // api("", "volume", ui.value, function (ok) {
        //
        // });
    }

    function setIsPlaying(isPlaying) {
      playerControls.className = isPlaying ? 'state-play' : 'state-pause';
    }

    ws.addEventListener('open', function() {
        console.log('Connected');
    });

    function initPlayer() {
      wsSend({
        id: wsID,
        act: "vk_get_playlist"
      });

      setInterval(function () {
        wsSend({ act: "vk_get_player" });
      }, 1000);
    }

    ws.addEventListener('message', function(e) {
      var data = JSON.parse(e.data);
      switch(data.act)
      {
        case 'get_wsID':
          wsID = data.wsID;
          if(wsID)
            initPlayer();
          break;
        case 'get_player':
          currentAudioTitle.innerText = data.title
          setIsPlaying(data.isPlaying);
          break;
        case 'get_playlist':
          for (var i = 0; i < 10; i++) {
            var el = $('<li><div class="plItem"><div class="plTitle">' + data.playlist[i][4] + " - " + data.playlist[i][3] + '</div><div class="plLength">' + "5:10" + '</div></div></li>')
                .attr('track_id', data.playlist[i][1] + "_" + data.playlist[i][0]);
            el.click( function() {
              wsSend({
                act: "vk_playTrack",
                trackId: $(this).attr('track_id')
              });
            });
            $('#plList').append(el);
          }
          break;
      }
    });
});
