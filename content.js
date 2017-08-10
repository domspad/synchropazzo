// content.js

var myPort = browser.runtime.connect({name:"port-from-cs"});

document.addEventListener('DOMContentLoaded', function(event) {
	var youtube_player = document.getElementByID('movie-player')

    if(youtube_player){
        console.log('theres a video! I will handle it....');

		youtube_player.addEventListener('onStateChange', send_state_change);

        // define send_state_change(data);
        function send_state_change(state){
            myport.postMessage({"current_time": youtube_player.getCurrentTime(), "current_state": state});
        }

        // received an update video msg
        myPort.onMessage.addListener(function(m) {
          // {'current_time' : 324234, 'current_state': 3}
          console.log("In content script, received message from background script: ");
          console.log(m);

          // seek to time...
          youtube_player.seekTo(m.current_time);
          
            // Pause handler
          if(m.current_state == 2){
              youtube_player.pauseVideo();
          }
            //Play handler
          if(m.current_state == 1){
              youtube_player.playVideo();
          }
            //stop handler
          if(m.current_state == 0){
              youtube_player.stopVideo();
          }
        });
    }
});
