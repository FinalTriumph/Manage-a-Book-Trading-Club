
$(".SignUpBtn").click(function(){
    $("#popupFormLogIn").hide();
    $("#popup, #popupFormSignUp").show();
    $("#SUusernameError, #SUpasswordError, #LIusernameError, #LIpasswordError").html("");
});

$(".LogInBtn").click(function(){
    $("#popupFormSignUp").hide();
    $("#popup, #popupFormLogIn").show();
    $("#SUusernameError, #SUpasswordError, #LIusernameError, #LIpasswordError").html("");
});

$(".cancelbtn").click(function(){
    $("#popup, #popupFormSignUp, #popupFormLogIn").hide();
    $("#SUusernameError, #SUpasswordError, #LIusernameError, #LIpasswordError").html("");
});

$("#SUregister").click(function() {
    var username = $("input[name=SUname]").val();
    var password = $("input[name=SUpassword]").val();
    if (/\s/.test(username) || /\s/.test(password) || !username.length || !password.length) {
        $("#SUusernameError").html("");
        $("#SUpasswordError").html("");
        if (!username.length) {
            $("#SUusernameError").html("Type in username.")
        } else {
            if (/\s/.test(username)) {
                $("#SUusernameError").html("Username can't contain spaces.")
            }
        }
        if (!password.length) {
            $("#SUpasswordError").html("Type in password.")
        } else {
            if (/\s/.test(password)) {
                $("#SUpasswordError").html("Password can't contain spaces.")
            }
        }
    } else {
        $("#SUusernameError").html("");
        $("#SUpasswordError").html("");
        $.get(window.location.origin + "/signuprequest/" + username + "/" + password, function(data) {
            if (data.status === "redirect") {
                window.location.reload();
            } else {
                $("#SUusernameError").html(data.status);
            }
        });
    }
});

$("#LIlogin").click(function() {
    var username = $("input[name=LIname]").val();
    var password = $("input[name=LIpassword]").val();
    if (/\s/.test(username) || /\s/.test(password) || !username.length || !password.length) {
        $("#LIusernameError").html("");
        $("#LIpasswordError").html("");
        if (!username.length) {
            $("#LIusernameError").html("Type in username.")
        } else {
            if (/\s/.test(username)) {
                $("#LIusernameError").html("Username can't contain spaces.")
            }
        }
        if (!password.length) {
            $("#LIpasswordError").html("Type in password.")
        } else {
            if (/\s/.test(password)) {
                $("#LIpasswordError").html("Password can't contain spaces.")
            }
        }
    } else {
        $("#LIusernameError").html("");
        $("#LIpasswordError").html("");
        $.get(window.location.origin + "/loginrequest/" + username + "/" + password, function(data) {
            if (data.status === "redirect") {
                window.location.reload();
            }
            if (data.status === "Username not found.") {
                $("#LIusernameError").html(data.status);
            }
            if (data.status === "Incorrect password.") {
                $("#LIpasswordError").html(data.status);
            }
        });
    }
});

$("input[name=SUname], input[name=SUpassword]").keypress(function(e) {
    if (e.which === 13) {
        $("#SUregister").click();
    }
});

$("input[name=LIname], input[name=LIpassword]").keypress(function(e) {
    if (e.which === 13) {
        $("#LIlogin").click();
    }
});