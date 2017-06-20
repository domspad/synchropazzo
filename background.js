
mysocket = new WebSocket("ws://linus.casa:8000/");
mysocket.onopen = function(evt) { console.log('opened!');}

mysocket.onmessage = sync_me_up;

function sync_me_up(evt){
    console.log(evt);
    console.log("I'm doing the syncing!");
    tab_obj = JSON.parse(evt.data);
    my_tabs = browser.tabs.query({});
    function compare_and_sync(my_tabs){
        for (let tab of tab_obj) { 
            new_url = tab.url;
            found = false;
            for (let mytab of my_tabs){
                if(new_url == mytab.url){
                    found = true;
                    if(tab.active){
                        browser.tabs.update(mytab.id, {'active': true});
                    }
                    break;
                }
            }
            if(found == false){
                tab_to_crea = {url : tab.url, active : tab.active};
                browser.tabs.create(tab_to_crea);
            }
        }

        for (let mytab of my_tabs){
            mytab_url = mytab.url;
            found = false;
            for(let tab of tab_obj){
                if(mytab_url == tab.url){
                    found = true;
                    break;
                }
            }
            if(found == false){
                browser.tabs.remove(mytab.id);
            }
        }
    }   
    my_tabs.then(compare_and_sync);
}

function heres_my_state(){
    var querying = browser.tabs.query({});
    querying.then( (tabs) => {
        mysocket.send(JSON.stringify(tabs));
    });
}

browser.browserAction.onClicked.addListener(heres_my_state);

setInterval(heres_my_state, 5000);

//browser.browserAction.onClicked.addListener(handle_click);

//function handle_click(tab) {
    //console.log('sending tab!');
    //mysocket.send(JSON.stringify(tab));
//}

//mysocket.onmessage = function(evt) {
    //console.log('creating tab!');
    //console.log(evt.data);
    //tab_obj = JSON.parse(evt.data);
    //new_tab = {"url": tab_obj["url"]}
    //browser.tabs.create(new_tab);
//}

/* This is for constant heartbeat status*/
//function report_state() {
    //var querying = browser.tabs.query({});
    //querying.then(report_tabs, onError);
//}

//function report_tabs(tabs) {
    //console.log('sending tabs');
    //mysocket.send(JSON.stringify(tabs));
//}

//function onError(error) {
  //console.log(`Error: ${error}`);
//}

//setInterval(report_state, 5000);



//var currentTab;
//var currentBookmark;

/*
 * Updates the browserAction icon to reflect whether the current page
 * is already bookmarked.
 */
//function updateIcon() {
  //browser.browserAction.setIcon({
    //path: currentBookmark ? {
      //19: "icons/star-filled-19.png",
      //38: "icons/star-filled-38.png"
    //} : {
      //19: "icons/star-empty-19.png",
      //38: "icons/star-empty-38.png"
    //},
    //tabId: currentTab.id
  //});
//}

/*
 * Add or remove the bookmark on the current page.
 */
//function toggleBookmark() {
  //if (currentBookmark) {
    //browser.bookmarks.remove(currentBookmark.id);
  //} else {
    //browser.bookmarks.create({title: currentTab.title, url: currentTab.url});
  //}
//}

//browser.browserAction.onClicked.addListener(toggleBookmark);

/*
 * Switches currentTab and currentBookmark to reflect the currently active tab
 */
//function updateActiveTab(tabs) {

  //function isSupportedProtocol(urlString) {
    //var supportedProtocols = ["https:", "http:", "ftp:", "file:"];
    //var url = document.createElement('a');
    //url.href = urlString;
    //return supportedProtocols.indexOf(url.protocol) != -1;
  //}

  //function updateTab(tabs) {
    //if (tabs[0]) {
      //currentTab = tabs[0];
      //if (isSupportedProtocol(currentTab.url)) {
        //var searching = browser.bookmarks.search({url: currentTab.url});
        //searching.then((bookmarks) => {
          //currentBookmark = bookmarks[0];
          //updateIcon();
        //});
      //} else {
        //console.log(`Bookmark it! does not support the '${currentTab.url}' URL.`)
      //}
    //}
  //}

  //var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  //gettingActiveTab.then(updateTab);
//}

//// listen for bookmarks being created
//browser.bookmarks.onCreated.addListener(updateActiveTab);

//// listen for bookmarks being removed
//browser.bookmarks.onRemoved.addListener(updateActiveTab);

//// listen to tab URL changes
//browser.tabs.onUpdated.addListener(updateActiveTab);

//// listen to tab switching
//browser.tabs.onActivated.addListener(updateActiveTab);

//// listen for window switching
//browser.windows.onFocusChanged.addListener(updateActiveTab);

//// update when the extension loads initially
//updateActiveTab();
