$.get(window.location.origin + "/userinfo", function(data){
    var username = data.username;
    $("#username").html(username);

$.get(window.location.origin + "/getallbooks", function(data) {
    if (data.length) {
        for (var i = 0; i < data.length; i++) {
            $("#allBooks").append(
                    '<div class="bookdiv" id='+data[i]._id+'><img src='+data[i].book.image+' alt="Cover Image"/><br><p3>'+data[i].book.title+'</p3><br><p2>'+data[i].book.author+'</p2><br><a href="#" class='+data[i].book.owner+' onclick="getOwner(this)"><p7>Owner: '+data[i].book.owner+'<p7></a></div>'
                );
            
            if (data[i].book.owner !== username && data[i].book.now !== username) {
                var requested = false;
                var inreq = data[i].book.inreq;
                for (var j = 0; j < inreq.length; j++) {
                    if (inreq[j] === username) {
                        requested = true;
                        break;
                    }
                }
                if (requested === true) {
                    $("#"+data[i]._id).append(
                    "<br><br class='br1'><p6>Requested</p6>"
                    );
                } else {
                    $("#"+data[i]._id).append(
                    "<br><button value="+data[i]._id+" onclick='requestThisBook(this)'>Request this book</button>"
                    );
                }
            }
        }
    }
    $(".loader").hide();
    $("#allBooksDiv, #allBooks").show();
});
});

function requestThisBook(objBtn) {
    var id = objBtn.value;
    $.get(window.location.origin + "/requestbook/" + id, function(data) {
        if (data.status === "requested") {
            $("button[value="+id+"]").remove();
            $("#"+id).append(
                    "<br class='br1'><p6>Requested</p6>"
                    );
        }
    });
}

function getOwner(e) {
    var user = e.className;
    $("#popup").show();
    $.get(window.location.origin + "/user/" + user, function(data) {
        $("#userInfoUsername").html(user);
        if (data.name && data.name !== "none") {
            $("#userInfoFullName").html(data.name);
        }
        if (data.city && data.city !== "none") {
            $("#userInfoCity").html(data.city);
        }
        if (data.state && data.state !== "none") {
            $("#userInfoState").html(data.state);
        }
        if (data.contact && data.contact !== "none") {
            $("#userInfoContact").html(data.contact);
        }
        $("#popupUserInfo").show();
    });
}

$(".xbtn").click(function(){
    $("#popup").hide();
})