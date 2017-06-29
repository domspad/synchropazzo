var myPort = browser.runtime.connect({name:"port-from-cs"});

function guid() {
      function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
            }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}

var myUUID = guid();

window.addEventListener("scroll", handle_scroll);

myPort.onMessage.addListener(function(m) {
      window.removeEventListener("scroll", handle_scroll);
      if(m.uuid !== myUUID){
          console.log("In content script, received message from background script: ");
          console.log(m);
          console.log("receiving scroll update, applying pageX " + m.pageX + " and pageY " + m.pageY);
          pageX = m.pageX;
          pageY = m.pageY;
          window.scrollTo(pageX, pageY);
          window.addEventListener("scroll", handle_scroll);
      }
});

function handle_scroll(scroll_event) {
//scroll { target: HTMLDocument → dashboard, isTrusted: true, view:
    //Window → dashboard, detail: 0, layerX: 0, layerY: 0, pageX: 0,
    //pageY: 542, which: 0, rangeOffset: 0, isChar: false }
    console.log("sending a scroll event " );
    console.log(scroll_event);
    //var msg = create_message('update_scroll');
    //msg.payload = scroll_event;
    //mysocket.send(JSON.stringify(msg));
    myPort.postMessage({"uuid": myUUID, "pageX": scroll_event.pageX, "pageY" : scroll_event.pageY});
}


