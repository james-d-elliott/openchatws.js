var ws = null;
var user = {name: undefined, display: undefined, session: undefined};
$(document).ready(function() {
    $("#send").attr('disabled', 'disabled');
    $("#message").attr('disabled', 'disabled');
    $("#disconnect").hide();
    $("#logout").hide();
    $("#message-box").hide();
    $("#login-box").hide();

    $("#send").click(function() {
        var text = $("#message").val();
        if (!$("#message").is(":disabled") && text !== "") {
            $("#message").attr('disabled', 'disabled');
            $("#send").attr('disabled', 'disabled');
            ws.send(JSON.stringify(["message", {text: text}]));
        }
        else {
            $("#error").html("Error: No Message");
            $("#message").focus();
        }
    });

    $(document).keypress(function(e) {
        if (e.which == 13) {
            if ($("#message").is(":focus")) {
                $("#send").trigger("click");
            }
            else if($("#user").is(":focus") || $("#password").is(":focus")) {
                $("#login").trigger("click");
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
    
    $("#login").click(function() {
        ws.send('["login",{"name":"' + $("#name").val() + '","password":"' + $("#password").val() + '"}]');
    });

    $("#logout").click(function() {
        ws.send('["logout",{}]');
    });

    $("#chat").on('auth', function(event, auth) {
        user.name = auth.name.toLowerCase();
        user.display = auth.name;
        $("#message").removeAttr('disabled');
        $("#send").removeAttr('disabled');
        $("#message-box").show();
        $("#logout").show();
        $("#login-box").hide();
        $("#online").html("Connected (logged in as '" + user.display + "')");
        $("#online").css({"color": "green"});
        $("#message").focus();

    });

    $("#chat").on('unauth', function(event, unauth) {
        user.name = undefined;
        user.display = undefined;
        $("#message").attr('disabled', 'disabled');
        $("#send").attr('disabled', 'disabled');
        $("#login-box").show();
        $("#message-box").hide();
        $("#logout").hide();
        $("#messages").html("");
    });
    
    $("#chat").on('deny', function(event, deny) {
        if (deny.code === 1) {
            $("#error").html("Error: Invalid Name or Password");
        }
        else if(deny.code === 2) {
            $("#error").html("Error: Invalid Name (does not exist)");
        }
    });

    $("#chat").on('online', function(event, online) {
        $("#online-users").html(online.count);
    });
    
    $("#chat").on('message', function(event, message) {
        if (!message) {
            return;
        }
        var date = new Date(message.date);
        $("#messages").append("<tr><td class=\"message date\">" + formatTime(date) + "</td><td class=\"message name\">" + (message.display ? message.display : message.name)  + "</td><td class=\"message text\">" + message.text + "</td></tr>");
        if (message.name = user.name) {
            $("#message").removeAttr('disabled');
            $("#send").removeAttr('disabled');
            $("#message").val("");
            $("#message").focus();
        }
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
            $("#online").html("Connected (not logged in)");
            $("#online").css({"color": "orange"});
            $("#connect").hide();
            $("#disconnect").show();
            $("#login-box").show();
        };
        
        ws.onclose = function(close) {
            ws = null;
            $("#online").html("Disconnected");
            $("#online").css({"color": "red"});
            $("#message").attr('disabled', 'disabled');
            $("#send").attr('disabled', 'disabled');
            $("#messages").html("");
            $("#disconnect").hide();
            $("#connect").show();
            $("#message-box").hide();
            $("#login-box").hide();
            $("#logout").hide();
        };
        
        ws.onerror = function(error) {
            alert("error", error);
        };
        
        ws.onmessage = function(message) {
            var msg = JSON.parse(message.data);
            $("#chat").trigger(msg[0], [msg[1]]);
        };
    }
    connect();
});
