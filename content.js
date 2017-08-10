// content.js


var myPort = browser.runtime.connect({name:"port-from-cs"});
var youtube_player;
console.log('content script loaded! myPort is:');
console.log(myPort);

//document.addEventListener('DOMContentLoaded', function(event) {

$( document ).ready(function() {

   //if(document.readyState === 'complete'){

        youtube_player = document.getElementById('movie_player');
        console.log('document is loaded...');
        
        if(youtube_player){
            console.log('theres a video! I will handle it....');
            console.log(youtube_player);
            youtube_player.addEventListener('onStateChange', send_state_change);

            // define send_state_change(data);
            function send_state_change(state){
                console.log("state is changed..." + state);
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
    //}
});

