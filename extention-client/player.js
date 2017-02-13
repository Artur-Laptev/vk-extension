var audioPlayer = getAudioPlayer();

function executeCommand(command, trackId = false) {
	if(!audioPlayer)
		return;

    switch (command) {
    	// case 'next':
    	// 	audioPlayer.playNext();
    	// 	break;
     //    case 'prev':
     //   		audioPlayer.playPrev();
     //   		break;
     //    case 'playPause':
     //    	audioPlayer.isPlaying() ? audioPlayer.pause() : audioPlayer.play();
     //    	break;
        case 'vk_playTrack':
        	if(trackId)
        		audioPlayer.play(trackId, audioPlayer._currentPlaylist);
          	break;
    }
}