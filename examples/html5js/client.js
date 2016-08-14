var ws = null;
var user = {name: undefined, display: undefined, session: undefined};

$(document).ready(function() {
    $("#message").attr('disabled', 'disabled');
    $("#disconnect").hide();
    $("#logout").hide();
    $("#login-box").hide();

    $("#message").keypress(function(event) {
        if (event.which === 13 && !event.shiftKey) {
            event.preventDefault();
            if ($("#message").is(":focus")) {
                $("#chat").trigger("dosend");
            }
        }
    });

    $(".login").keypress(function(event) {
        if (event.which === 13) {
            if ($("#name").val() !== "" && $("#password").val() !== "") {
                $("#error").html("");
                $("#chat").trigger("dologin");
            }
            else {
                $("#error").html("<b>Error:</b> Please enter a Username and Password.");
            }
        }
    });

    $(window).on("beforeunload", function() {
        ws.onclose = function() {};
        ws.close();
    });
    
    $("#connect").click(function() {
        connect();
    });
    
    $("#disconnect").click(function() {
        ws.close();
    });

    $("#logout").click(function() {
        ws.send('["logout",{}]');
    });

    $("#chat").on('auth', function(event, auth) {
        user.name = auth.name.toLowerCase();
        user.display = auth.name;
        $("#status").html("Connected (as '" + user.display + "')");
        $("#status").css({"color": "green"});
        $("#message").removeAttr('disabled');
        $("#login-box").hide();
        $("#logout").show();
        $("#message").focus();

    });

    $("#chat").on('unauth', function(event, unauth) {
        user.name = undefined;
        user.display = undefined;
        $("#log").html("");
        $("#status").html("Connected (not logged in)");
        $("#status").css({"color": "orange"});
        $("#message").attr('disabled', 'disabled');
        $("#logout").hide();
        $("#login-box").show();
    });
    
    $("#chat").on('dologin', function(event) {
        ws.send('["login",{"name":"' + $("#name").val() + '","password":"' + $("#password").val() + '"}]');
    });
    
    $("#chat").on('dosend', function(event) {
        var text = $("#message").val();
        if (!$("#message").is(":disabled") && text !== "") {
            $("#message").val("");
            ws.send(JSON.stringify(["message", {text: text}]));
        }
        else {
            $("#error").html("<b>Error:</b> No Message.");
            $("#message").focus();
        }
    });
    
    $("#chat").on('deny', function(event, deny) {
        if (deny.code === 1) {
            $("#error").html("<b>Error:</b> Invalid Name or Password.");
        }
        else if(deny.code === 2) {
            $("#error").html("<b>Error:</b> Invalid Name (does not exist).");
        }
    });

    $("#chat").on('online', function(event, online) {
        $("#online").html(online.count);
    });
    
    $("#chat").on('message', function(event, message) {
        if (!message || !message.text) {
            return;
        }
        var date = new Date(message.date);
        $("#log").append('<div class="message messagediv" id="' + message._id + '"><span class="message time">' + formatTime(date) + '</span> - <span class="message name">' + (message.display ? message.display : message.name)  + '</span>: <span class="message text">' + message.text.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</span></div>');
        $("#log")[0].scrollTop = $("#log")[0].scrollHeight;
        ws.send(JSON.stringify(['hide', {ids: [message._id]}]));
    });

    function formatTime(date) {
        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();
        var seconds = date.getSeconds().toString();
        hours = (hours.length === 1) ? '0' + hours : hours;
        minutes = (minutes.length === 1) ? '0' + minutes : minutes;
        seconds = (seconds.length === 1) ? '0' + seconds : seconds;
        return [hours, minutes, seconds].join(":");
    }

    function connect() {
        ws = new WebSocket('ws://public.project-umbrella.com:8081');
        
        ws.onopen = function(open) {
            $("#status").html("Connected (not logged in)");
            $("#status").css({"color": "orange"});
            $("#connect").hide();
            $("#disconnect").show();
            $("#login-box").show();
            $("#name").show();
            $("#name").focus();
        };
        
        ws.onclose = function(close) {
            ws = null;
            $("#online").html("N/A");
            $("#status").html("Disconnected");
            $("#status").css({"color": "red"});
            $("#message").attr('disabled', 'disabled');
            $("#log").html("");
            $("#login-box").hide();
            $("#disconnect").hide();
            $("#logout").hide();
            $("#connect").show();
        };
        
        ws.onerror = function(error) {
            $("#error").html("<b>Error:</b> Connection Failed (" + error + ").");
        };
        
        ws.onmessage = function(message) {
            try {
                var msg = JSON.parse(message.data);
                $("#chat").trigger(msg[0], [msg[1]]);
            }
            catch(e) {
                alert(e);
            }
        };
    }
    connect();
});
