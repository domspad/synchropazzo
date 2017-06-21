
mysocket = new WebSocket("ws://linus.casa:8000/");
mysocket.onopen = function(evt) { console.log('opened!');}


//browser.browserAction.onClicked.addListener(handle_click);

//function handle_click(tab) {
    //console.log('sending tab!');
    //mysocket.send(JSON.stringify(tab));
//}

mysocket.onmessage = function(evt) {
    console.log('creating tab!');
    console.log(evt.data);
    var tablist = [];
    browser.tabs.query({}).then((tabs)=>{
       tablist = tabs;
    });
    console.log(tablist);
    data = JSON.parse(evt.data);
    switch (data.kind) { 
    case 'create_tab':
        console.log('create!'); 
        //new_tab = {"url": tab_obj["url"]}
        //browser.tabs.create(new_tab);
        break;
    case 'activate_tab':
        console.log('activate!');
        break;
    case 'remove_tab':
        console.log('remove!');
        break;
    case 'update_tab':
        var url = data.payload.url;
        var id = data.payload.id;
        console.log('update!${id} and ${url}');
        browser.tabs.update
        break;
    case 'replace_tab':
        console.log('replace!');
        break;
    default:
        console.log('I dont know what to do with this data!');
    }

}

browser.tabs.onActivated.addListener(handle_activated);
browser.tabs.onCreated.addListener(handle_created);
browser.tabs.onRemoved.addListener(handle_removed);
browser.tabs.onReplaced.addListener(handle_replaced);
browser.tabs.onUpdated.addListener(handle_updated);

function create_message(kind){
    return {'kind': kind};
}

function handle_created(tab){
    var msg = create_message('create_tab');
    msg.payload = tab
    mysocket.send(JSON.stringify(msg));
}

function handle_activated(tab){
    var msg = create_message('activate_tab');
    msg.payload = tab
    mysocket.send(JSON.stringify(msg));
}

function handle_replaced(tab){
    var msg = create_message('replace_tab');
    msg.payload = tab
    mysocket.send(JSON.stringify(msg));
}

function handle_removed(tab){
    var msg = create_message('remove_tab');
    msg.payload = tab
    mysocket.send(JSON.stringify(msg));
}

function handle_updated(id, update_info){
    console.log("AAAH");
    console.log(id);
    var getting = browser.tabs.get(id);
    console.log(update_info);
    getting.then((tab) => {
        console.log(tab)
    //browser.tabs.query({}, console.log)
    //var tab_query = browser.tabs.query({'id':id}); 
    //tab_query.then(function(tab_q) { 
        //console.log(tab_q);
        if(update_info.url){
            var msg = create_message('update_tab');
            msg.payload = {'url': update_info.url, 'id' : id};
            mysocket.send(JSON.stringify(msg));
        }
    //});
    });
}


