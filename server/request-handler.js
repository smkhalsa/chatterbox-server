/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var urlModule = require('url');

var allMessages = [];
var rooms = {};

var requestHandler = function(request, response) {
var res = allMessages;
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.

  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  var statusCode = 404;

  var storeMessage = function(room) {
    if (!rooms[room]) {
      rooms[room] = [];
    }

    var currentData = '';

    request.on('data', function(piece) {
      currentData += piece;
    });

    //when the request is done sending data
    request.on('end', function() {
      allMessages.push(JSON.parse(currentData));
      rooms[room].push(JSON.parse(currentData));
    });
  };

  console.log("Serving request type " + request.method + " for url " + request.url);

  if (request.method === 'POST' && request.url === '/messages') {
    statusCode = 201;
    storeMessage('global');
    res = null;
  }

  else if (request.method === 'GET' && request.url === '/messages') {
    statusCode = 200;
  }

  if (request.method === 'GET' && request.url.substring(0,7) === '/rooms/' && request.url.substring(7) !== '') {
    res = rooms[request.url.substring(7)] || [];
    statusCode = 200;

  } else if (request.method === 'POST' && request.url.substring(0,7) === '/rooms/') {
    statusCode = 201;
    storeMessage(request.url.substring(7));
    res = null;
  }

  if (request.method === 'GET' && request.url.substring(0,6) === '/rooms' && request.url.substring(7) === '') {
    statusCode = 200;
    res = Object.keys(rooms);
  }

  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = "application/JSON";

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  response.writeHead(statusCode, headers);

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.
  response.end(JSON.stringify({"results" : res}));
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

exports.handleRequest = requestHandler;



//GET
//messages : return all messages
//rooms : return list of rooms
//rooms/roomname : return list of messages from roomname
//users : return list of users
//users/username : return a list of messagers from username
//
//
//POST
//messages : add a post to global room
//rooms/roomname : post to roomname
//

