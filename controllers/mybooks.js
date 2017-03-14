$.get(window.location.origin + "/userinfo", function(data){
    var username = data.username;
    var requested = data.outreq;
    var borrowed = data.borrowed;
    $("#username").html(username);
    $("#outReqCount").html(requested.length);
    if (requested.length) {
        for (var j = 0; j < requested.length; j++) {
            $.get(window.location.origin + "/bookinfo/" + requested[j], function(data) {
                $("#sentRequests").append(
                    "<div value="+data._id+" class='bookdiv'><a href='#' class="+data.book.owner+" onclick='getOwner(this)'><p7>To: "+data.book.owner+"<p7></a><br><br><img src="+data.book.image+" alt='Cover Image'/><br><p3>"+data.book.title+"</p3><br><p2>"+data.book.author+"</p2><br><button value="+data._id+" onclick='removeRequest(this)'>Cancel request</button></div>"
                );
                
            });
        }
    } else {
        $("#sentRequests").append(
            "<div class='onlyTextDiv'><p1>You don't have any pending requests.</p1></div>"
        );
    }
    if (borrowed.length) {
        $("#borrowedBooksCount").html(borrowed.length);
        for (var b = 0; b < borrowed.length; b++) {
            $.get(window.location.origin + "/bookinfo/" + borrowed[b], function(data) {
                $("#borrowedBooks").append(
                    "<div value="+data._id+" class='bookdiv'><a href='#' class="+data.book.owner+" onclick='getOwner(this)'><p7>From: "+data.book.owner+"<p7></a><br><br><img src="+data.book.image+" alt='Cover Image'/><br><p3>"+data.book.title+"</p3><br><p2>"+data.book.author+"</p2><br><button value="+data._id+" onclick='returnBook(this)'>Return</button></div>"
                );
                
            });
        }
    } else {
        $("#borrowedBooks").append(
            "<div class='onlyTextDiv'><p1>You don't have any borrowed books.</p1></div>"
        );
    }
});

$.get(window.location.origin + "/getmybooks", function(data) {
    if (data.length) {
        var totalReq = 0;
        $("#allMyBooksCount").html(data.length);
        for (var i = 0; i < data.length; i++) {
            $("#allMyBooks").append(
                '<div class="bookdiv myBooksBookDiv" id='+data[i]._id+'><img src='+data[i].book.image+' alt="Cover Image"/><br><p3>'+data[i].book.title+'</p3><br><p2>'+data[i].book.author+'</p2></div>'
            );
            if (data[i].book.owner === data[i].book.now) {
                $("#"+data[i]._id).append(
                    "<br><button value="+data[i]._id+" onclick='removeThisBook(this)'>Remove this book</button>"
                );
            } else {
                $("#"+data[i]._id).append(
                    "<br><br class='br1'><a href='#' class="+data[i].book.now+" onclick='getOwner(this)'><p7>Loaned to: "+data[i].book.now+"<p7></a>"
                );
            }
            if (data[i].book.inreq.length) {
                var inreq = data[i].book.inreq;
                for (var j = 0; j < inreq.length; j++){
                    totalReq += 1;
                    $("#incomingRequests").append(
                        "<div value="+data[i]._id+inreq[j]+" class='bookdiv "+data[i]._id+"'><a href='#' class="+inreq[j]+" onclick='getOwner(this)'><p7>From: "+inreq[j]+"<p7></a><br><br><img src="+data[i].book.image+" alt='Cover Image'/><br><p3>"+data[i].book.title+"</p3><br><p2>"+data[i].book.author+"</p2><br><button value="+data[i]._id+" id="+inreq[j]+" onclick='acceptRequest(this)'>Accept request</button><button value="+data[i]._id+"  id="+inreq[j]+" onclick='rejectRequest(this)'>Reject request</button></div>"
                    );
                }
            }
        }
        $("#inReqCount").html(totalReq);
        if (totalReq === 0) {
            $("#incomingRequests").append(
                "<div class='onlyTextDiv'><p1>You don't have any received requests.</p1></div>"
            );
        }
    } else {
        $("#incomingRequests").append(
            "<div class='onlyTextDiv'><p1>You don't have any received requests.</p1></div>"
        );
    }
    $(".loader").hide();
    $("#myBooksOptions").show();
});

var speed = 500;

function removeThisBook(objBtn){
    var id = objBtn.value;
    $.get(window.location.origin + "/removebook/" + id, function(data) {
        if (data.status === "deleted") {
            $("#"+id).remove();
            var count = (Number($("#allMyBooksCount").html())) - 1;
            $("#allMyBooksCount").html(count);
            var inreqCount = $("."+id).length;
            var readyCount = (Number($("#inReqCount").html())) - inreqCount;
            $("."+id).remove();
            $("#inReqCount").html(readyCount);
        } else {
            alert(data.status);
        }
    });
}

$("#addBook").click(function() {
    $("#popup, #addBookForm").show();
});

$(".xbtn").click(function() {
    $("#popup, #addBookForm, #popupUserInfo").hide();
    $("#titleError, #authorError").html("");
    $("#userInfoFullName, #userInfoCity, #userInfoState, #userInfoContact").html("");
});

$("#submitBook").click(function() {
    $("#titleError").html("");
    $("#authorError").html("");
    var title = $("input[name=title]").val();
    var author = $("input[name=author]").val();
    if (!title.replace(/\s/g, '').length || !author.replace(/\s/g, '').length){
        if (!title.replace(/\s/g, '').length) {
            $("#titleError").html("Type in book title.");
        }
        if (!author.replace(/\s/g, '').length) {
            $("#authorError").html("Type in book author.");
        }
    } else {
        $.get(window.location.origin + "/addbook/" + title + "/" + author, function(data) {
            if (data.status === "saved") {
                var book = data.newBook;
                $("#allMyBooks").append(
                    '<div class="bookdiv myBooksBookDiv" id='+book._id+'><img src='+book.book.image+' alt="Cover Image"/><br><p3>'+book.book.title+'</p3><br><p2>'+book.book.author+'</p2><br><button value='+book._id+' onclick="removeThisBook(this)">Remove this book</button></div>'
                );
                $("#popup").hide();
                $("input").val("");
                var count = (Number($("#allMyBooksCount").html())) + 1;
                $("#allMyBooksCount").html(count);
            } else {
                alert("Something went wrong, coudn't save this book.");
            }
        });
    }
});

function removeRequest(objBtn) {
    var id = objBtn.value;
    $.get(window.location.origin + "/removerequest/" + id, function(data) {
        if (data.status === "removed") {
            $("div[value="+id+"]").remove();
            var count = (Number($("#outReqCount").html())) - 1;
            $("#outReqCount").html(count);
            if (count === 0) {
                $("#sentRequests").append(
                    "<div class='onlyTextDiv'><p1>You don't have any active requests.</p1></div>"
                );
            }
        }
    });
}

function rejectRequest(objBtn) {
    var id = objBtn.value;
    var user = objBtn.id;
    $.get(window.location.origin + "/rejectrequest/" + id + "/" + user, function(data) {
        if (data.status === "removed") {
            $("div[value="+id+user+"]").remove();
            var count = (Number($("#inReqCount").html())) - 1;
            $("#inReqCount").html(count);
            if (count === 0) {
                $("#incomingRequests").append(
                    "<div class='onlyTextDiv'><p1>You don't have any requests.</p1></div>"
                );
            }
        }
    });
}

function acceptRequest(objBtn) {
    var id = objBtn.value;
    var user = objBtn.id;
    $.get(window.location.origin + "/acceptrequest/" + id + "/" + user, function(data) {
        if (data.status === "accepted") {
            $("div[value="+id+user+"]").remove();
            var count = (Number($("#inReqCount").html())) - 1;
            $("#inReqCount").html(count);
            $("button[value="+id+"]:contains(Remove this book)").remove();
            $("#"+id).append(
                "<br class='br1'><a href='#' class="+user+" onclick='getOwner(this)'><p7>Loaned to: "+user+"<p7></a>"
            );
            if (count === 0) {
                $("#incomingRequests").append(
                    "<div class='onlyTextDiv'><p1>You don't have any requests.</p1></div>"
                );
            }
        } else {
            alert("This book is already loaned to " + data.now);
        }
    });
}

function returnBook(objBtn) {
    var id = objBtn.value;
    $.get(window.location.origin + "/returnbook/" + id, function(data) {
        if (data.status === "returned") {
            $("div[value="+id+"]").remove();
            var count = (Number($("#borrowedBooksCount").html())) - 1;
            $("#borrowedBooksCount").html(count);
            if (count === 0) {
                $("#borrowedBooks").append(
                    "<div class='onlyTextDiv'><p1>You don't have any borrowed books.</p1></div>"
                );
            }
        }
    });
}

$("#allMyBooksBtn").click(function(){
    var element = $("#allMyBooks");
    if (element.is(":visible")) {
        element.hide(speed);
    } else {
        element.show(speed);
    }
    $("#incomingRequests, #sentRequests, #borrowedBooks").hide(speed);
});

$("#incomingRequestsBtn").click(function(){
    var element = $("#incomingRequests");
    if (element.is(":visible")) {
        element.hide(speed);
    } else {
        element.show(speed);
    }
    $("#allMyBooks, #sentRequests, #borrowedBooks").hide(speed);
});

$("#sentRequestsBtn").click(function(){
    var element = $("#sentRequests");
    if (element.is(":visible")) {
        element.hide(speed);
    } else {
        element.show(speed);
    }
    $("#allMyBooks, #incomingRequests, #borrowedBooks").hide(speed);
});

$("#borrowedBooksBtn").click(function(){
    var element = $("#borrowedBooks");
    if (element.is(":visible")) {
        element.hide(speed);
    } else {
        element.show(speed);
    }
    $("#allMyBooks, #incomingRequests, #sentRequests").hide(speed);
});

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

$("input[name=title], input[name=author]").keypress(function(e) {
    if (e.which === 13) {
        $("#submitBook").click();
    }
})