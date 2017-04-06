/**
 * Created by cmartinezdemorentin on 02/03/17.
 */

/* Import required modules */
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var parseUrlencoded = bodyParser.urlencoded({ extended: false });
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');

/* Configure server paths */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/assets/css')));
app.use('/images', express.static(path.join(__dirname, 'public/assets/images')));
app.use('/js', express.static(path.join(__dirname, 'public/assets/js')));

/* Configure database */
var Schema = mongoose.Schema;
var Mensaje = new Schema({
    autor: String,
    texto: String,
    fecha: Date
});
var Mensaje = mongoose.model('Mensaje', Mensaje);

function connecToMongoDB()
{
    mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://dsm:marko_dsm_2017@ds139370.mlab.com:39370/chat-dsm', { server: { auto_reconnect: true } }, function (err) {
        if(!err)
        {
            console.log("Conectado a la base de datos");
        } else
        {
            console.log("Error al conectar a la base de datos");
            throw err;
        }
    });
}

connecToMongoDB();

/* Render 'index.html' when the user access the chat */
app.get("/", function(request, response)
{
    response.render('index');
});

/* This list is used to track number of users in the chat */
connectedUsers = [];
usersLimit = 10;

/* Define socket functions */
io.on('connection', function(client)
{
    /* When the server receives a new message, it sends it to the database and to the connected users */
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


        var response = {
           'username' : datos.user,
           'message' : datos.message,
           'time' : date.toLocaleString(),
           'ownership' : true
        };

        /* Send message back to the user */
        client.emit('chatResponse', JSON.stringify(response));

        /* Send message to all the other users */
        response.ownership = false;
        client.broadcast.emit('chatResponse', JSON.stringify(response));
    });

    /* Add a new user to the chat */
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

                /* Load only yesterday and today messages */
                var currentDate = new Date;
                var limitDate = currentDate.setHours(0, 0, 0, 0);
                limitDate -= 1;

                Mensaje.find({fecha: {$gte: limitDate}}, function(err, matches){

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

    /* Send 10 previous messages to the client */
    client.on('moreMessages', function(username, lastDate){

        if(mongoose.connection.readyState != 1)
        {
            console.log("Conexión con la base de datos perdida");
            socket.emit('userAdded', 'test');
            connecToMongoDB();
        }

        Mensaje.find({fecha: {$lt: lastDate}}, function(err, matches){

            for(i=0; i<matches.length && i<10; i++)
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
                client.emit('chatPreviousMessage', JSON.stringify(response));
            }

            if(matches.length > 0)
            {
                client.emit('scrollToTime', matches[0].fecha.toLocaleString());
            }

        }).sort({fecha: -1});
    });

    /* Remove user */
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

    /* Notify all the users when somebody is typing */
    client.on('typing', function(username, status) {
        client.emit('typingChange', username, status);
        client.broadcast.emit('typingChange', username, status);
    });

    /* Notify all the users when somebody has logged in/out */
    client.on('logged', function(username, status) {
        client.emit('loggingDone');

        client.broadcast.emit('logged', username, status);
    });

});

server.listen(process.env.PORT||8080);
