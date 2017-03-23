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
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Mensaje = new Schema({
    autor: String,
    texto: String,
    fecha: Date
});
var Mensaje = mongoose.model('Mensaje', Mensaje);

messageCont = 0;

mongoose.connect('mongodb://dsm:marko_dsm_2017@ds139370.mlab.com:39370/chat-dsm', function (err) {
    if(!err)
    {
        console.log("Conectado a la base de datos");
    } else
    {
        throw err;
    }
});





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

connectedUsers = [];
usersLimit = 10;

io.on('connection', function(client)
{
    Mensaje.find({}, function(err, matches){
        messageCont = matches.length;
    });


    client.on('chatMessage', function(datos){

        var date = new Date;

        var responseDB = new Mensaje (
            {
            'autor' : datos.user,
            'texto' : datos.message,
            'fecha' : date
            }
        );

        responseDB.save();

        messageCont++;


        var response = {
           'username' : datos.user,
           'message' : datos.message,
           'time' : date.toLocaleString(),
           'ownership' : true
        };

        /* Send message back to the user */
        client.emit('chatResponse', JSON.stringify(response));
        client.emit('numberUpdate', messageCont);

        /* Send message to all the other users */
        response.ownership = false;
        client.broadcast.emit('chatResponse', JSON.stringify(response));
        client.broadcast.emit('numberUpdate', messageCont);
    });

    client.on('newUser', function(username){
        /* Add new user to database */
        if(connectedUsers.length < usersLimit)
        {
            /* Check whether the user is already connected */
            var alreadyConnected = false;
            for(i=0; i<connectedUsers.length; i++)
            {
                if(connectedUsers[i] == username)
                {
                    alreadyConnected = true;
                }
            }

            if(!alreadyConnected)
            {
                /* Update list of users */
                client.emit('updateUsers', connectedUsers);
                /* Send number of messages to the client */
                client.emit('numberUpdate', messageCont);

                /* Load previous messages */
                Mensaje.find({}, function(err, matches){
                    for(i=0; i<matches.length; i++)
                    {
                        var ownership = false;
                        if(matches[i].autor === username)
                        {
                            ownership = true;
                        }

                        var response = {
                            'username' : matches[i].autor,
                            'message' : matches[i].texto,
                            'time' : matches[i].fecha.toLocaleString(),
                            'ownership' : ownership
                        };

                        /* Send message back to the user */
                        client.emit('chatResponse', JSON.stringify(response));
                    }
                });

                connectedUsers.push(username);

                /* Notify the user */
                client.emit('userAdded', username);

                /* Notify all the other users */
                client.broadcast.emit('updateUsers', connectedUsers);
            } else
            {
                client.emit('alreadyConnected');
            }
        } else
        {
            client.emit('chatFull');
        }
    });

    client.on('removeUser', function(username){
        /* Check whether the user is on the list */
        var found = false;
        for(i=0; i<connectedUsers.length; i++)
        {
            if(connectedUsers[i] == username)
            {
                found = true;
            }
        }

        if(found)
        {
            /* Remove user */
            connectedUsers.splice(connectedUsers.indexOf(username), 1);

            /* Notify all the other users */
            client.broadcast.emit('updateUsers', connectedUsers);
        }

    });

    client.on('typing', function(username, status) {
        client.emit('typingChange', username, status);
        client.broadcast.emit('typingChange', username, status);
    });

});

server.listen(process.env.PORT||8080);
