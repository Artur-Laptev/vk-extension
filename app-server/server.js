function $(id) {
  return document.getElementById(id);
}

function log(text) {
  $('log').value += text + '\n';
}

var port = 9999;
var isServer = false;
if (http.Server && http.WebSocketServer) {
  // Listen for HTTP connections.
  var server = new http.Server();
  var wsServer = new http.WebSocketServer(server);
  server.listen(port);
  isServer = true;

  server.addEventListener('request', function(req) {
    var url = req.headers.url;
    if (url == '/')
      url = '/public/index.html';
    // Serve the pages of this chrome application.
    req.serveUrl(url);
    return true;
  });

  // function triggerKeepAwake() {
  //   //createNotification('WebServer') // creating a notification also works, but is annoying

  //   // HACK: make an XHR to cause onSuspendCanceled event
  //   console.log('triggerKeepAwake')
  //   var xhr = new XMLHttpRequest
  //   xhr.open("GET","http://127.0.0.1:" + (port || 9999) + '/dummyUrlPing')
  //   function onload(evt) {
  //       console.log('triggerKeepAwake XHR loaded',evt)
  //   }
  //   xhr.onerror = onload
  //   xhr.onload = onload
  //   xhr.send()
  // }

  // chrome.runtime.onSuspend.addListener( function(evt) {
  //     //createNotification("onSuspend")
  //     console.warn('onSuspend')
  //     return

  //   // using a persistent socket now...
  //     // if (localOptions.optBackground) {
  //         triggerKeepAwake()
  //     // } else {
  //     //     if (window.app) app.stop('onsuspend')
  //     // }
  // })
  chrome.runtime.onSuspendCanceled.addListener( function(evt) {
      //createNotification("suspendcanceled!")
      console.warn('onSuspendCanceled')
  })

  // A list of connected websockets.
  var connectedSockets = [];
  wsServer.addEventListener('request', function(req) {
    console.log('Client connected');
    var socket = req.accept();
    connectedSockets.push(socket);

    // chrome.runtime.onSuspend.addListener(function() {
    //   for (var i = 0; i < connectedSockets.length; i++)
    //     connectedSockets[i].send('onSuspend');
    // });
    // When a message is received on one socket, rebroadcast it on all
    // connected sockets.
    socket.addEventListener('message', function(e) {
      for (var i = 0; i < connectedSockets.length; i++)
        connectedSockets[i].send(e.data);
    });

    // When a socket is closed, remove it from the list of connected sockets.
    socket.addEventListener('close', function() {
      console.log('Client disconnected');
      for (var i = 0; i < connectedSockets.length; i++) {
        if (connectedSockets[i] == socket) {
          connectedSockets.splice(i, 1);
          break;
        }
      }
    });
    return true;
  });

//   setInterval(function () {
//     console.log(server);
//     if(server.readyState_ == 1)
//       return;
//     else {
//       console.log(server);
//     }
// }, 1000);
}

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
