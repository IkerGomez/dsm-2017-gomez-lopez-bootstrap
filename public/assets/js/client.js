/**
 * Created by cmartinezdemorentin on 25/03/17.
 */

var finished = false;

$(document).ready(function() {

    /* Hide error messages */
    $('#alreadyConnected').hide();
    $('#chatFull').hide();
    $('#fieldEmpty').hide();

    /* Hide notifications */
    $('.userNotifications').hide();

    /* Save window size */
    smallWindow = false;
    if($(window).width() < 768)
    {
        smallWindow = true;
        if(chat.$list.is(":visible"))
        {
            chat.$list.hide();
        }
    }

    $(window).resize(function() {
        if($(window).width() < 768 && !smallWindow)
        {
            smallWindow = true;
            if(chat.$list.is(":visible"))
            {
                chat.$list.hide();
            }
        } else if($(window).width() >= 768 && smallWindow)
        {
            smallWindow = false;
            if(!chat.$list.is(":visible"))
            {
                chat.$list.show();
            }
        }
    });

    /* Show welcome modal */
    $('#myModal').modal('show');

    /* Define socket functions */
    socket = io();

    /* Add new message to the chat */
    socket.on('chatResponse', function(datos){
        var response = JSON.parse(datos);

        /* Add received message to the timeline */
        chat.render(response);

        /* Update number of shown messages */
        updateMessagesNumber();
    });

    socket.on('chatPreviousMessage', function(datos){
        var response = JSON.parse(datos);

        /* Add received message to the timeline */
        chat.addPreviousMessage(response);

        /* Update number of shown messages */
        updateMessagesNumber();
    });

    /* Add new user to the list */
    socket.on('userAdded', function(username){
        $('#myModal').modal('hide');

        /* Add new user to the list */
        chat.addUser(username);

        /* Modify header username */
        $('.chat-with')[0].innerHTML = username;
    });

    /* Update connected users list */
    socket.on('updateUsers', function(users){
        /* Erase current list */
        chat.removeAllUsers();

        /* Add connected users to the list */
        for(i=0; i<users.length; i++)
        {
            chat.addUser(users[i]);
        }
    });

    /* Change user's "typing..." status */
    socket.on('typingChange', function(username, status){
        if(status)
        {
            chat.setUserTyping(username);
        } else
        {
            chat.unsetUserTyping(username);
        }
    });

    /* Show a notification */
    socket.on('logged', function(username, status){
        var myName = $('.chat-with')[0].innerHTML;

        if(myName !== '-')
        {
            if(status)
            {
                chat.notifyUserLoggedIn(username);
            } else
            {
                chat.notifyUserLoggedOut(username);
            }
        }
    });

    /* Notify the user that it is already connected */
    socket.on('alreadyConnected', function(){
        $('#alreadyConnected').show();
        $('#chatFull').hide();
        $('#fieldEmpty').hide();
    });

    /* Notify the user that the chat is full ad no more people are allowed */
    socket.on('chatFull', function(){
        $('#alreadyConnected').hide();
        $('#chatFull').show();
        $('#fieldEmpty').hide();
    });

    socket.on('loggingDone', function(){
        finished = true;
    });

    socket.on('scrollToTime', function(timeString){

        var messagesTime = $('.message-data-time');

        for(i=0; i<messagesTime.length; i++)
        {
            if(messagesTime[i].innerHTML === timeString)
            {
                $('.chat-history').animate({
                    scrollTop: $($($('.message-data-time')[i]).closest('.clearfix')[0]).offset().top
                }, 0);
            }
        }
    });

    /* Show the users list (active when the screen is small) */
    var collapsedMenu = $('.chat-header').find('.fa-users');
    collapsedMenu.on('click', function () {
        if(!chat.$list.is(":visible"))
        {
            chat.$list.slideDown(400);
        }
    });

    /* Hide the users list (active when the screen is small) */
    var listRemove = $('.search').find('img');
    listRemove.on('click', function () {
        if(chat.$list.is(":visible"))
        {
            chat.$list.slideUp(400);
        }
    });

});

/* Define emoji paths */
emojiPaths = {
    0: '/images/emoji1.png',
    1: '/images/emoji2.png',
    2: '/images/emoji3.png',
    3: '/images/emoji4.png',
    4: '/images/emoji5.png'
};

/* Append clicked emoji to the message box */
$(".emoji").click(function () {
    var num = $(this).attr('data-num');

    $("#message-to-send").append('<img src="' + emojiPaths[num] + '" data-num="' + num + '"/>');

    var elem = document.getElementById('message-to-send');
    setEndOfContenteditable(elem);

});

/* Ser cursor at end of message box */
function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)
    {
        range = document.createRange(); //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); //get the selection object (allows you to change selection)
        selection.removeAllRanges(); //remove any selections already made
        selection.addRange(range); //make the range you have just created the visible selection
    }
}

/* Modal box managment */
$('#modalButton').on('click', userLogin);
$('#inputname').on('keyup', catchEnter);
$('#refreshButton').on('click', requestMessages);

function userLogin()
{
    var username = $('#inputname')[0].value;

    if (username !== "") {
        $('#alreadyConnected').hide();
        $('#chatFull').hide();
        $('#fieldEmpty').hide();

        socket.emit('newUser', username);
        userLoggedNotification(username, true);
    } else {
        $('#alreadyConnected').hide();
        $('#chatFull').hide();
        $('#fieldEmpty').show();
    }
}

function requestMessages()
{
    var username = $('#inputname')[0].value;
    var lastDate = Date.parse($('.message-data-time')[0].innerHTML);

    socket.emit('moreMessages', username, lastDate);
}

/* Catch 'enter' in modal box */
function catchEnter(event) {
    if (event.keyCode === 13)
    {
        userLogin();
    }
}

/* Notify the server the user exists the chat when window is closed */
$(window).on('beforeunload', function () {
    var username = $('.chat-with')[0].innerHTML;

    if(username !== '-')
    {
        socket.emit('removeUser', username);
        userLoggedNotification(username, false);

        /* Wait server response for a maximum of two seconds */
        var start = new Date().getTime();
        while(!finished && ((new Date().getTime() - start) < 2000)){}
    }

    //socket.close();
});

function userTypingNotification(username, status)
{
    socket.emit("typing", username, status);
}

function userLoggedNotification(username, status)
{
    socket.emit("logged", username, status);
}

/* Detect whether the user is typing */
var timer;
$('#message-to-send').bind("DOMSubtreeModified",function(){
    var username = $('.chat-with')[0].innerHTML;

    if(this.innerHTML !== "")
    {
        userTypingNotification(username, true);

        clearTimeout(timer);
        timer = setTimeout(userTypingNotification, 1500, username, false);
    } else
    {
        userTypingNotification(username, false);
    }
});

function updateMessagesNumber()
{
    $('.num-messages')[0].innerHTML = $('.message').length;
}
