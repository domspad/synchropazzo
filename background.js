var tab_id_dict = new Map();

mysocket = new WebSocket("ws://linus.casa:8000/");
mysocket.onopen = function(evt) { console.log('opened!');}


//browser.browserAction.onClicked.addListener(handle_click);

//function handle_click(tab) {
    //console.log('sending tab!');
    //mysocket.send(JSON.stringify(tab));
//}

mysocket.onmessage = function(evt) {
    console.log(evt.data);
    //var tablist = [];
    //browser.tabs.query({}).then((tabs)=>{
       //tablist = tabs;
    //});
    //console.log(tablist);
    data = JSON.parse(evt.data);
    switch (data.kind) {
    //case 'create_tab':
        //console.log('create!');
        //browser.tabs.onCreated.removeListener(handle_created);
        //var tabPromise = browser.tabs.create({});
        //tabPromise.then(function(tab) {
            //tab_id_dict.set(data.payload.id, tab.id);
            //updateMappingMessage(tab.id, data.payload.id);
            //browser.tabs.onCreated.addListener(handle_created);
        //});
        //break;
    case 'activate_tab':
        console.log('receiving activate! ' + data.payload.id);
        other_tab = data.payload;
        other_tab['active'] = true;
        if(!tab_id_dict.get(other_tab.id)){
            console.log('on receving activate, didn\'t find id ' + other_tab.id);
            handle_invalid_tab(other_tab);
        } else {
            console.log("on receiving activate a valid tab found your id " + other_tab.id);
            browser.tabs.onActivated.removeListener(handle_activated);
            browser.tabs.onUpdated.removeListener(handle_updated);
            updatePromise = browser.tabs.update(tab_id_dict.get(data.payload.id), {"active": true});
            updatePromise.then(function(tab) {
                browser.tabs.onActivated.addListener(handle_activated);
                browser.tabs.onUpdated.addListener(handle_updated);
            });
        }
        break;
    case 'remove_tab':
        console.log('receiving remove!' + data.payload.id);
        var soonToBeDeadTab = tab_id_dict.get(data.payload.id);
        if(soonToBeDeadTab){
            browser.tabs.onRemoved.removeListener(handle_removed);
            browser.tabs.remove(soonToBeDeadTab);
            tab_id_dict.delete(data.payload.id);
            browser.tabs.onRemoved.addListener(handle_removed);
        }
        break;
    case 'update_tab':
        var url = data.payload.url;
        var id = data.payload.id;
        var active = data.payload.active;
        if(!active){
            active = false;
        }
        console.log('receiving update tab! with ' + id + ' and ' + url + 'and active ' + active);
        // TODO : factor out update map case with activate_tab case
        if(!tab_id_dict.get(id)){
            console.log('on received update, didn\'t find id in map, handling...');
            handle_invalid_tab(data.payload);
        }
        else{
            var mytab = browser.tabs.get(tab_id_dict.get(id));
            mytab.then((tab) => {
                console.log('on received update, comparing my url '+ tab.url + ' with your url ' + url);
                if(tab.url != url){
                    console.log('urls are different! we are updating and active is ' + active);
                    //browser.tabs.onCreated.removeListener(handle_created);
                    browser.tabs.onUpdated.removeListener(handle_updated);
                    var tabPromise = browser.tabs.update(tab_id_dict.get(id), {"url": url, "active": active});
                    tabPromise.then((tab) => {
                        browser.tabs.onUpdated.addListener(handle_updated);
                        //browser.tabs.onCreated.addListener(handle_created);
                    });
                }
            });

        }
        break;
    case 'replace_tab':
        console.log('replace!');
        break;
    case 'update_mapping':
        console.log('receiving updating map!');
        myid = data.payload['yourid'];
        yourid = data.payload['myid'];
        tab_id_dict.set(yourid, myid);
        console.log(tab_id_dict);
        break;
    case 'update_scroll':
        console.log('receiving update scroll');
        console.log('the event: pageX ' + data.payload.pageX + ' pageY ' + data.payload.pageY);
        window.scrollTo(data.payload.pageX, data.payload.pageY);
        break;
    default:
        console.log('I dont know what to do with this data!');
    }

}

function setTabId(keyId, valId){
}

function handle_invalid_tab(tab){
            //      create tab, update map, send updtade map messgae
            var url = tab.url;
            var active = tab.active;
            var id = tab.id;
            console.log("Sending invalid tab ID update message");
            browser.tabs.onUpdated.removeListener(handle_updated);
            //browser.tabs.onCreated.removeListener(handle_created);
            if(url === 'about:newtab'){
                var tabPromise = browser.tabs.create({'active':active});
            }else {
                var tabPromise = browser.tabs.create({"url": url, "active": active});
            }
            tabPromise.then((tabObj) => {
                tab_id_dict.set(id, tabObj.id);
                updateMappingMessage(tabObj.id, id);
                browser.tabs.onUpdated.addListener(handle_updated);
                //browser.tabs.onCreated.addListener(handle_created);
            });
}

function updateMappingMessage(myid, yourid){
    var msg = create_message('update_mapping');
    msg.payload = {'myid' : myid, 'yourid' : yourid};
    mysocket.send(JSON.stringify(msg));
}


function handle_scroll(scroll_event) {
//scroll { target: HTMLDocument → dashboard, isTrusted: true, view:
    //Window → dashboard, detail: 0, layerX: 0, layerY: 0, pageX: 0,
    //pageY: 542, which: 0, rangeOffset: 0, isChar: false }
    var msg = create_message('update_scroll');
    msg.payload = scroll_event;
    mysocket.send(JSON.stringify(msg));
}

window.addListener("scroll", handle_scroll);
browser.tabs.onActivated.addListener(handle_activated);
//browser.tabs.onCreated.addListener(handle_created);
browser.tabs.onRemoved.addListener(handle_removed);
browser.tabs.onReplaced.addListener(handle_replaced);
browser.tabs.onUpdated.addListener(handle_updated);

function create_message(kind){
    return {'kind': kind};
}

//function handle_created(tab){
    //var msg = create_message('create_tab');
    //console.log('sending a create!');
    //msg.payload = tab;
    //mysocket.send(JSON.stringify(msg));
//}

function handle_activated(active_info){
    // active_info = { tabId: <num>, windowId, <num>}
    tab_promise = browser.tabs.get(active_info.tabId);
    tab_promise.then(function(tab) {
        var msg = create_message('activate_tab');
        msg.payload = tab;
        console.log('sending an activate! with id ' + tab.id + ' and active ' + tab.active);
        console.log(msg);
        mysocket.send(JSON.stringify(msg));
    });
}

function handle_replaced(tab){
    var msg = create_message('replace_tab');
    msg.payload = tab;
    //mysocket.send(JSON.stringify(msg));
}

function handle_removed(id){
    console.log('sending a removed!');
    var msg = create_message('remove_tab');
    msg.payload = {'id': id};
    //var dieTabId;
    for (var kid in tab_id_dict){
        if(tab_id_dict.get(kid) == id){
            //dieTabId = kid;
            tab_id_dict.delete(kid);
            break;
        }
    }
    //tab_id_dict.delete(dieTabId);
    console.log(msg);
    mysocket.send(JSON.stringify(msg));
}

function handle_updated(id, update_info){
    if(update_info.url){
        console.log(id);
        var msg = create_message('update_tab');
        console.log('sending a updated for a new url! ' + id + ' and url ' + update_info.url);
        console.log(update_info);
        active = update_info.active;
        if(!active){
            active = false;
        }
        msg.payload = {'url': update_info.url, 'id' : id, 'active' : active};
        mysocket.send(JSON.stringify(msg));
    } else if(update_info.active) {
        console.log('sending an updated for active tab! (not sure why we get this...) with id ' + id);
        console.log(update_info);
        var msg = create_message('update_tab');
        msg.payload = {'id' : id , 'active' : update_info.active };
        mysocket.send(JSON.stringify(msg));
    }
}
