/**
 * Created by cmartinezdemorentin on 02/03/17.
 */

var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/assets/css')));
app.use('/images', express.static(path.join(__dirname, 'public/assets/images')));
app.use('/js', express.static(path.join(__dirname, 'public/assets/js')));

app.get("/", function(request, response)
{
    response.render('index');
});

io.on('connection', function(client)
{
   client.on('chatMessage', function(datos){
       var response = {
           'username' : datos.user,
           'message' : datos.message,
           'time' : datos.time,
           'ownership' : true
       };

       /* Send message back to the user */
       client.emit('chatResponse', JSON.stringify(response));

       /* Send message to all the other users */
       response.ownership = false;
       client.broadcast.emit('chatResponse', JSON.stringify(response));
   });

});

server.listen(process.env.PORT||8080);

//app.listen(process.env.PORT||8080);
