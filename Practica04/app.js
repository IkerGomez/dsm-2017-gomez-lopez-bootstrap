/**
 * Created by cmartinezdemorentin on 02/03/17.
 */

/*var http = require('http');

var server = http.createServer(function(request, response)
{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hola mundo\n");
})

server.listen(8080);

console.log("Server running");*/

var express = require('express');
var app = express();
var path = require('path');

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

app.get("/", function(request, response)
{
    response.render('index',
        {
            titulo: 'Práctica 4 - Cristian e Iker'
        });
});

app.listen(8080);