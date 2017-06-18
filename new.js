
// our end of the socket connection
var socket = io('http://' + document.domain + ':' + location.port);
var so_socket = new WebSocket("ws://qa.sockets.stackexchange.com/");

so_socket.onopen = function()
{
so_socket.send("155-questions-active");
console.log("just opened socket!");
};

so_socket.onmessage = function(raw_data)
{
    console.log("got some data!");
    console.log(raw_data);
};
