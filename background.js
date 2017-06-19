
mysocket = new WebSocket("ws://localhost:8000/");
mysocket.onopen = function(evt) { constole.log('opened!');}

function report_state() {
    var querying = browser.tabs.query({});
    querying.then(report_tabs, onError);
}

function report_tabs(tabs) {
    var myurls = new Array
    for (let tab of tabs) { 
        myurls.push(tab.url);
    }
    console.log('sending tabs');
    mysocket.send(myurls.join(','));
}

function onError(error) {
  console.log(`Error: ${error}`);
}

setInterval(report_state, 5000);



//function onCreated(tab) {
  //console.log(`Created new tab: ${tab.id}`)
//}

//tab_obj = {
    //active: false,
    //index: 0, // tab order in window
    //pinned: false, //whether this tab should be pinned (def. false)
    //url: "http://controlfd.com",
    ////windowId: 3, //defaults to current window
//}

//creating = browser.tabs.create(tab_obj);
//creating.then(onCreated, onError);

