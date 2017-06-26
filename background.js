var tab_id_dict = new Map();
var already_synced = false;
mysocket = new WebSocket("ws://linus.casa:8000/");
mysocket.onopen = function(evt) {
    console.log('opened!');
    handle_sync();
}


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
    case 'window_sync':
        console.log('syncing window!');
        console.log(data.payload);
        // send my open tabs before I add other users'
        if(!already_synced){
            handle_sync();
        }
        tabs = data.payload;
        num_tabs = tabs.length;
        // disable handlers
        browser.tabs.onCreated.removeListener(handle_created);
        browser.tabs.onUpdated.removeListener(handle_updated);
        for (var i=0; i < num_tabs; i++) {
            tab = tabs[i];
            // open tab
            create_promise = browser.tabs.create({'url': tab.url});
            create_promise.then(function(tab_obj) {
                    console.log("Created " + i + "th tab with id " + tab_obj.id + "for your " + tab.id);
                    tab_id_dict.set(tab.id, tab_obj.id);
                    updateMappingMessage(tab_obj.id, tab.id);
                    if(i == num_tabs-1){
                        // enable handlers
                        browser.tabs.onCreated.addListener(handle_created);
                        browser.tabs.onUpdated.addListener(handle_updated);
                    }
            });
        }
        break;
    case 'create_tab':
        console.log('create!');
        browser.tabs.onCreated.removeListener(handle_created);
        var tabPromise = browser.tabs.create({});
        tabPromise.then(function(tab) {
            tab_id_dict.set(data.payload.id, tab.id);
            console.log("For the create ");
            for (var [key, value] of tab_id_dict.entries()) {
                console.log(key + ' = ' + value);
            }
            updateMappingMessage(tab.id, data.payload.id);
            browser.tabs.onCreated.addListener(handle_created);
        });
        break;
    case 'activate_tab':
        console.log('activate!');
        browser.tabs.onActivated.removeListener(handle_activated);
        browser.tabs.onUpdated.removeListener(handle_updated);
        updatePromise = browser.tabs.update(tab_id_dict.get(data.payload.tabId), {"active": true});
        updatePromise.then(function(tab) {
            browser.tabs.onActivated.addListener(handle_activated);
            browser.tabs.onUpdated.addListener(handle_updated);
        });
        break;
    case 'remove_tab':
        console.log('remove!');
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
        console.log('update!${id} and ${url}');

        if(!tab_id_dict.get(id)){
            browser.tabs.onUpdated.removeListener(handle_updated);
            browser.tabs.onCreated.removeListener(handle_created);
            var tabPromise = browser.tabs.create({"url": url});
            tabPromise.then((tab) => {
                tab_id_dict.set(id, tab.id);
                updateMappingMessage(tab.id, id);
                console.log("For the update ");
                for (var [key, value] of tab_id_dict.entries()) {
                    console.log(key + ' = ' + value);
                }
                browser.tabs.onUpdated.addListener(handle_updated);
                browser.tabs.onCreated.addListener(handle_created);
            });
        }
        else{
            var mytab = browser.tabs.get(tab_id_dict.get(id));
            mytab.then((tab) => {
                if(tab.url != url){
                    browser.tabs.onCreated.removeListener(handle_created);
                    browser.tabs.onUpdated.removeListener(handle_updated);
                    var tabPromise = browser.tabs.update(tab_id_dict.get(id), {"url": url});
                    tabPromise.then((tab) => {
                        browser.tabs.onUpdated.addListener(handle_updated);
                        browser.tabs.onCreated.addListener(handle_created);
                    });
                }
            });

        }
        break;
    case 'replace_tab':
        console.log('replace!');
        break;
    case 'update_mapping':
        console.log('updating map!');
        myid = data.payload['yourid'];
        yourid = data.payload['myid'];
        tab_id_dict.set(yourid, myid);
        console.log(tab_id_dict);
        break;
    default:
        console.log('I dont know what to do with this data!');
    }

}

function setTabId(keyId, valId){
}

function updateMappingMessage(myid, yourid){
    var msg = create_message('update_mapping');
    msg.payload = {'myid' : myid, 'yourid' : yourid};
    mysocket.send(JSON.stringify(msg));
}


browser.tabs.onActivated.addListener(handle_activated);
browser.tabs.onCreated.addListener(handle_created);
browser.tabs.onRemoved.addListener(handle_removed);
browser.tabs.onReplaced.addListener(handle_replaced);
browser.tabs.onUpdated.addListener(handle_updated);

function handle_sync() {
    already_synced = true;
    var msg = create_message('window_sync');
    var openTabs = browser.tabs.query({});
    openTabs.then(function(tabs) {
    console.log('sending everything I\'ve got!');
    msg.payload = tabs;
    mysocket.send(JSON.stringify(msg));

    });
}

function create_message(kind){
    return {'kind': kind};
}

function handle_created(tab){
    var msg = create_message('create_tab');
    console.log('sending a create!');
    msg.payload = tab;
    mysocket.send(JSON.stringify(msg));
}

function handle_activated(tab){
    var msg = create_message('activate_tab');
    msg.payload = tab;
    console.log('sending an activate!');
    console.log(msg);
    mysocket.send(JSON.stringify(msg));
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
        console.log('sending a updated!');
        console.log(update_info);
        msg.payload = {'url': update_info.url, 'id' : id};
        mysocket.send(JSON.stringify(msg));
    }
}
