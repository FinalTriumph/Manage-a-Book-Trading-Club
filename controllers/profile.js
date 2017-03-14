$.get(window.location.origin + "/userinfo", function(data){
    var username = data.username;
    $("#activeHeadBtn").html(username);
    $("#userInfoUsername").html(username);
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
    $(".loader").hide();
    $("#userInfo").show();
});

$("#editBtn").click(function(){
    $("#popup, #popupEditProfile").show();
    $("input[name=fullName]").val($("#userInfoFullName").html());
    $("input[name=city]").val($("#userInfoCity").html());
    $("input[name=state]").val($("#userInfoState").html());
    $("input[name=contact]").val($("#userInfoContact").html());
});

$(".xbtn").click(function(){
    $("#popup, #popupEditProfile").hide();
});

$("#saveProfile").click(function() {
    var name = $("input[name=fullName]").val();
    if (!name.replace(/\s/g, '').length) {
        name = "none";
    }
    var city = $("input[name=city]").val();
    if (!city.replace(/\s/g, '').length) {
        city = "none";
    }
    var state = $("input[name=state]").val();
    if (!state.replace(/\s/g, '').length) {
        state = "none";
    }
    var contact = $("input[name=contact]").val();
    if (!contact.replace(/\s/g, '').length) {
        contact = "none";
    }
    
    $.get(window.location.origin + "/updateuserinfo/"+name +"/"+city+"/"+state +"/"+contact, function(data){
        if (data.status === "saved") {
            window.location.reload();
        }
    });
});

$("input[name=fullName], input[name=city], input[name=state], input[name=contact]").keypress(function(e) {
    if (e.which === 13) {
        $("#saveProfile").click();
    }
});