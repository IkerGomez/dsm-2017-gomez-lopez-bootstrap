/**
 * Created by cmartinezdemorentin on 25/03/17.
 */

(function(){

    var timer;

    chat = {
        messageToSend: '',

        init: function() {
            this.cacheDOM();
            this.bindEvents();
        },
        cacheDOM: function() {
            this.$chatHistory = $('.chat-history');
            this.$button = $('button');
            this.$textarea = $('#message-to-send');
            this.$chatHistoryList =  this.$chatHistory.find('ul');
            this.$usersList =  $('.people-list').find('ul');
            this.$list = $('.people-list');
        },
        bindEvents: function() {
            this.$button.on('click', this.addMessage.bind(this));
            this.$textarea.on('keyup', this.addMessageEnter.bind(this));
        },

        //Añade un usuario a la lista
        addUser: function(username) {
            var allUsers = this.$usersList.find($('.name'));

            var alreadyAdded = false;

            for(var i = 0; i < allUsers.length; i++)
            {
                if (allUsers[i].innerText.search(username) !== -1) {
                    alreadyAdded = true;
                }
            }

            if(!alreadyAdded)
            {
                var template;
                var context;

                template = Handlebars.compile( $("#user-template").html());
                context = {
                    username: username
                };
                this.$usersList.append(template(context));

                /* Update the search filer, so new user is indexed */
                searchFilter.init();
            }
        },

        //Elimina un usuario de la lista
        removeUser: function(username) {
            var allUsers = this.$usersList.find($('.name'));

            for(var i = 0; i < allUsers.length; i++)
            {
                if (allUsers[i].innerText.search(username) !== -1) {
                    /* Remove user from the list */
                    $(allUsers[i]).closest("li").remove();
                }
            }

            /* Update the search filer */
            searchFilter.init();
        },

        //Elimina todos los usuarios de la lista
        removeAllUsers: function() {
            var allUsers = this.$usersList.find($('.name'));

            for(var i = 0; i < allUsers.length; i++)
            {
                $(allUsers[i]).closest("li").remove();
            }

            /* Update the search filer */
            searchFilter.init();
        },

        //Añade el nuevo mensaje recibido del servidor a la lista de mensajes, aplicando el formato correspondiente
        render: function(data) {
            if (data.message.trim() !== "") {
                var template;
                var context;

                var receivedMessage = data.message;

                /* Look for emojis and replace them */
                var endOfMessage = false;
                var bIndex, eIndex;
                while(!endOfMessage)
                {
                    bIndex = receivedMessage.indexOf('<emoji');
                    if(bIndex !== -1)
                    {
                        eIndex = receivedMessage.indexOf('>', bIndex);

                        var emojiString = receivedMessage.substr(bIndex, eIndex-bIndex+1);

                        /* Detect emoji number */
                        var emojiNum = $(emojiString).attr('num');

                        receivedMessage = receivedMessage.replace(emojiString, '<img src="' + emojiPaths[emojiNum] + '" width="20px"/>');
                    } else
                    {
                        endOfMessage = true;
                    }
                }

                if(data.ownership)
                {
                    template = Handlebars.compile( $("#message-template").html());
                } else
                {
                    if(this.isOnTheList(data.username))
                    {
                        template = Handlebars.compile( $("#message-response-template").html());
                    } else
                    {
                        template = Handlebars.compile( $("#message-response-template-offline").html());
                    }
                }

                context = {
                    username: data.username,
                    response: receivedMessage,
                    time: new Date(new Date(data.time).getTime() - new Date().getTimezoneOffset()).toString().substring(4,24)
                };

                this.$chatHistoryList.append(template(context));
                this.scrollToBottom();

            }
        },

        //Añade el mensaje antiguo recibido del servidor a la lista de mensajes, aplicando el formato correspondiente
        addPreviousMessage: function(data) {
            if (data.message.trim() !== "") {
                var template;
                var context;

                var receivedMessage = data.message;

                /* Look for emojis and replace them */
                var endOfMessage = false;
                var bIndex, eIndex;
                while(!endOfMessage)
                {
                    bIndex = receivedMessage.indexOf('<emoji');
                    if(bIndex !== -1)
                    {
                        eIndex = receivedMessage.indexOf('>', bIndex);

                        var emojiString = receivedMessage.substr(bIndex, eIndex-bIndex+1);

                        /* Detect emoji number */
                        var emojiNum = $(emojiString).attr('num');

                        receivedMessage = receivedMessage.replace(emojiString, '<img src="' + emojiPaths[emojiNum] + '" width="20px"/>');
                    } else
                    {
                        endOfMessage = true;
                    }
                }

                if(data.ownership)
                {
                    template = Handlebars.compile( $("#message-template").html());
                } else
                {
                    if(this.isOnTheList(data.username))
                    {
                        template = Handlebars.compile( $("#message-response-template").html());
                    } else
                    {
                        template = Handlebars.compile( $("#message-response-template-offline").html());
                    }
                }

                context = {
                    username: data.username,
                    response: receivedMessage,
                    time: data.time
                };

                $(this.$chatHistoryList).prepend(template(context));

            }
        },

        //Envía el mensaje escrito por el usuario al servidor
        addMessage: function() {
            /* This function gets called when the user sends a message */
            this.messageToSend = this.$textarea.html();

            /* Remove html tags */
            this.messageToSend = this.messageToSend.replace(new RegExp('<div>', 'g'), '');
            this.messageToSend = this.messageToSend.replace(new RegExp('</div>', 'g'), '');
            this.messageToSend = this.messageToSend.replace(new RegExp('<br>', 'g'), '');
            this.messageToSend = this.messageToSend.replace(new RegExp('&nbsp;', 'g'), ' ');

            /* Look for emojis and replace its content with a special alphanumeric code */
            var endOfMessage = false;
            var bIndex, eIndex;
            while(!endOfMessage)
            {
                bIndex = this.messageToSend.indexOf('<img');
                if(bIndex !== -1)
                {
                    eIndex = this.messageToSend.indexOf('>', bIndex);

                    var imgString = this.messageToSend.substr(bIndex, eIndex-bIndex+1);

                    /* Detect emoji number */
                    var emojiNum = $(imgString).attr('data-num');

                    this.messageToSend = this.messageToSend.replace(imgString, '<emoji num="' + emojiNum +'">');
                } else
                {
                    endOfMessage = true;
                }
            }

            console.log(this.messageToSend);

            /* Reset textarea */
            this.$textarea.html("");

            if(this.messageToSend !== "")
            {
                /* Send message to the server */
                var userData = {
                    'user' :$('#inputname')[0].value,
                    'message' : this.messageToSend
                };
                socket.emit('chatMessage', userData);
            }
        },

        //Añade el "typing..." al estado del usuario
        setUserTyping: function(username) {
            var allUsers = this.$usersList.find($('.name'));

            for(var i = 0; i < allUsers.length; i++)
            {
                if (allUsers[i].innerText.search(username) !== -1) {

                    var statusNode = $(allUsers[i]).parent().find($('.status'));

                    var spanNode = statusNode.find('span');

                    if(spanNode.length == 0)
                    {
                        var typingNode = document.createElement("SPAN");
                        typingNode.innerHTML = "| typing...";

                        statusNode.append($(typingNode));
                    }
                }
            }
        },

        //Quita el "typing..." del estado del usuario
        unsetUserTyping: function(username) {
            var allUsers = this.$usersList.find($('.name'));

            for(var i = 0; i < allUsers.length; i++)
            {
                if (allUsers[i].innerText.search(username) !== -1) {

                    var statusNode = $(allUsers[i]).parent().find($('.status'));

                    var spanNode = statusNode.find('span');

                    if(spanNode.length == 1)
                    {
                        $(spanNode).remove();
                    }
                }
            }
        },

        //Comprueba si un usuario está en la lista, es decir, comprueba si está online
        isOnTheList: function(username) {
            var found = false;
            var allUsers = this.$usersList.find($('.name'));

            for(var i = 0; i < allUsers.length; i++)
            {
                if (allUsers[i].innerText === username) {
                    found = true;
                }
            }

            return found;
        },

        // Función para enviar cuando se pulse la tecla de Intro:
        addMessageEnter: function(event) {
            if (event.keyCode === 13) {
                this.addMessage();
            }
        },

        // Scroll hasta abajo del chat:
        scrollToBottom: function() {
            this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
        },

        //Notify connected users when somebody logs in/out
        notifyUserLoggedIn: function(username) {
            $('#notificationUsername')[0].innerHTML = username;
            $('#notificationStatusIcon').removeClass("offline").addClass("online");
            $('#notificationStatus')[0].innerHTML = "online";

            $('.userNotifications').slideDown(400);
            clearTimeout(timer);
            timer = setTimeout(function(){$('.userNotifications').slideUp(400);}, 5000);
        },

        notifyUserLoggedOut: function(username) {
            $('#notificationUsername')[0].innerHTML = username;
            $('#notificationStatusIcon').removeClass("online").addClass("offline");
            $('#notificationStatus')[0].innerHTML = "offline";

            $('.userNotifications').slideDown(400);
            clearTimeout(timer);
            timer = setTimeout(function(){$('.userNotifications').slideUp(400);}, 5000);
        }
    };

    chat.init();

    //Esta función realiza las búsquedas en la lista de usuarios
    var searchFilter = {
        options: { valueNames: ['name'] },
        init: function() {
            var userList = new List('people-list', this.options);
            var noItems = $('<li id="no-items-found">No items found</li>');

            userList.on('updated', function(list) {
                if (list.matchingItems.length === 0) {
                    $(list.list).append(noItems);
                } else {
                    noItems.detach();
                }
            });
        }
    };

    searchFilter.init();

})();
