new function() {
	var connected = false;

	var serverUrl;
	var connectionStatus;	
	var connectButton;
	var disconnectButton; 

	var open = function() {
		chrome.runtime.sendMessage({
	      action: connected ? "reConnect" : "connect",
				wsUrl: serverUrl.val()
	    },
	    function(response) {
				connectionStatus.text('OPENING ...');
				serverUrl.attr('disabled', 'disabled');
				connectButton.hide();
				disconnectButton.show();
	    });
	}
	
	var close = function() {
		if (ws) {
			console.log('CLOSING ...');
			ws.close();
		}
		connected = false;
		connectionStatus.text('CLOSED');

		serverUrl.removeAttr('disabled');
		connectButton.show();
		disconnectButton.hide();
	}
	// 
	// var onOpen = function() {
	// 	console.log('OPENED: ' + serverUrl.val());
	// 	connected = true;
	// 	connectionStatus.text('OPENED');
	// };
	// 
	// var onClose = function() {
	// 	console.log('CLOSED: ' + serverUrl.val());
	// 	ws = null;
	// };
	// 
	// var onMessage = function(event) {
	// 	var data = event.data;
	// 	console.log(data);
	// };
	// 
	// var onError = function(event) {
	// 	console.log(event.data);
	// }

	WebSocketClient = {
		init: function() {
			serverUrl = $('#serverUrl');
			connectionStatus = $('#connectionStatus');
			connectButton = $('#connectButton');
			disconnectButton = $('#disconnectButton'); 
			
			connectButton.click(function(e) {
				open();
			});
		
			disconnectButton.click(function(e) {
				close();
			});
		}
	};
}

$(function() {
	WebSocketClient.init();
});
