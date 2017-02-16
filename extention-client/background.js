// var extension_url = 'chrome-extension://'+location.host+'/index.html';
// function isOptionsUrl(url) {
//   if(url == extension_url) {
//     return true;
//   }
//   return false;
// }
// // Find options page in all opened tabs
// function goToOptions() {
//   chrome.tabs.getAllInWindow(undefined, function(tabs) {
//     for (var i = 0, tab; tab = tabs[i]; i++) {
//       if (tab.url && isOptionsUrl(tab.url)) {
//         chrome.tabs.update(tab.id, {selected: true});
//         return;
//       }
//     }
//     chrome.tabs.create({url: extension_url});
//   });
// }
// // Called when the user clicks on the browser action.
// chrome.browserAction.onClicked.addListener(function(tab) {
//   goToOptions();
// });

// chrome.browserAction.onClicked.addListener(function() {
//    chrome.windows.create({'url': location.host + '/index.html', 'type': 'popup'}, function(window) {
//    });
// });
var serverAppId = "maaonalfbndajkhbomgdepcniffohoob"; // localId

chrome.management.getAll(function(data) {
	for (var i = 0; i < data.length; i++) {
		if(data[i].id == serverAppId) {
      // chrome.management.launchApp(data[i].id);
      console.log(data[i]);
    } 
    // else {
    //   chrome.webstore.install("https://chrome.google.com/webstore/detail/" + serverAppId, function(data) {
    //     console.log(data);
    //   });
    // }
	}
})

var ws = null;
var vkTabId = null;
var urlRegex = /^https?:\/\/(?:[^./?#]+\.)?vk\.com/;

chrome.tabs.getAllInWindow(null, function(tabs){
  for (var i = 0; i < tabs.length; i++) {
    if (urlRegex.test(tabs[i].url)) {
      vkTabId = tabs[i].id;
      chrome.tabs.executeScript(vkTabId, {
        code: code_inj
      });
    return;
    }
    // else {
    // 	chrome.tabs.onCreated.addListener(function(data) {
    // 		console.log(data);
    // 	});
    // }
  };
  // for (var i = 0; i < tabs.length; i++) {
  // chrome.tabs.sendRequest(tabs[i].id, { action: "xxx" });
});

// chrome.runtime.onMessage.addListener(
//   function(req, sender, sendResponse) {
//     switch (req.action) {
//       case 'connect':
//         connect(req.wsUrl);
//         sendResponse({
//           msg: "ok"
//         });
//         break;
//       default:
//         false;
//     }
//   }
// );

function connect(url) {
  ws = new WebSocket(url);
  console.log(ws);

  ws.addEventListener('message', function(e) {
  	var data = JSON.parse(e.data) || false;
  	// console.log(data);

  	manageVkPlayer(data);
  });

	chrome.commands.onCommand.addListener(function(command) {
		manageVkPlayer(command);
	});
}

connect('ws://localhost:9999');

function wsSend(id = false, params) {
	$.extend(params, {
		id: id,
		fromExt: true
	});
	ws.send(JSON.stringify(params));
}
//  chrome.commands.getAll(function(command) {
// 	console.log('Command:', command);
// });

var code_inj = "var el = document.createElement('script');" +
    "el.src = chrome.extension.getURL('player.js');" +
    "document.body.appendChild(el);";

function getCode(code) {
    return "var el = document.createElement('script');" +
      "el.textContent = '"+code.replace(/'/g, "\\'")+"';" +
      "document.body.appendChild(el);" +
      "asd;";
}

function manageVkPlayer(data) {
	switch(data.act || data)
	{
		case 'vk_get_player':
			chrome.tabs.executeScript(vkTabId, {
    		code: "var title = document.getElementsByClassName('top_audio_player_title')[0].innerText; var isPlaying = document.getElementById('top_audio_player').classList.contains('top_audio_player_playing'); [title,isPlaying] "
    	},
    		function(result) {
					wsSend(data.id, {
						act: "get_player",
						title: result[0][0],
						isPlaying: result[0][1]
					});
        }
      );
			break;

		case 'vk_get_playlist':
			chrome.tabs.executeScript(vkTabId, {
    		code: "JSON.parse(JSON.parse(localStorage.getItem('audio_v20_pl')));"
    	},
    		function(result) {
    			var res = result[0];
    			wsSend(data.id, {
			    	act: "get_playlist",
			    	playlist: res.list
			  	});
      	}
      );
      break;

    case 'vk_playTrack':
    	chrome.tabs.executeScript(vkTabId, {
    		code: getCode("executeCommand('"+data.act+"', '"+data.trackId+"')")
  		});
    	break;

		case 'vk_prev':
			chrome.tabs.executeScript(vkTabId, {
    		code: "document.getElementsByClassName('top_audio_player_btn top_audio_player_prev')[0].click();"
    	});
    	break;

		case 'vk_playPause':
			chrome.tabs.executeScript(vkTabId, {
    		code: "document.getElementsByClassName('top_audio_player_btn top_audio_player_play')[0].click();"
    	});
    	break;

    	case 'vk_next':
			chrome.tabs.executeScript(vkTabId, {
    		code: "document.getElementsByClassName('top_audio_player_btn top_audio_player_next')[0].click();"
    	});
    	break;
	}
}
