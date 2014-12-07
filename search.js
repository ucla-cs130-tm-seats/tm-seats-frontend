$(document).ready(function() {
	
});

function searchVenue() {
	var text = document.getElementById("searchText").value;
	$.get("searchVenue", {
		text: text
	}, function(resp) {
		// redirect to venue list page
		window.location.href="/venuesearch.html?ids";
	});
}

function goHome() {
	window.location.href="index.html";	
}

function goVenue(id) {
	window.location.href="ticketsearch.html";
}

function goLogin() {
	window.location.href="login.html";
}

function goCheckout() {
	window.location.href="checkout.html";
}

function goOrderFinished() {
	window.location.href="completed.html";
}

function findTickets() {
	var sectionArea = document.getElementById("eventSectionAreas").value;
	var numTickets = document.getElementById("eventMaxTicketNum").value;
	var eventPrice = document.getElementById("eventPrices").value;

	$.get("findtickets", {
		area: sectionArea,
		num: numTickets,
		price: eventPrice
	}, function(resp) {
		// redirect to ticket listing page
		window.location.href="/ticketlist.html?ids";
	});
}

var updateObj;
function StartTimer(seconds) {
	var time = new Date();
	var startTime = time.getTime();	
	
	if (updateObj) {
		window.clearInterval(updateObj);
	}
	updateObj = window.setInterval(function () {updateTime(startTime, seconds * 1000)}, 500);
	
	$(".timer").show();
}

function updateTime(startTime, waitTime) {
	var date = new Date();
	var currTime = date.getTime();
	if (currTime >= startTime + waitTime) {
		window.clearInterval(updateObj);
	}
	else {
		var timer = document.getElementById("time");
		if (timer) {
			var timeLeft = new Date(startTime + waitTime - currTime);
			timer.innerHTML = convertDate(timeLeft);
		}
	}
}

function convertDate(date) {
	var timeString;
	
	timeString = date.getMinutes() + ":";
	
	var seconds = date.getSeconds();
	if (seconds < 10) {
		timeString += "0" + seconds;
	}
	else {
		timeString += seconds;
	}
	return timeString;
}

function toggleInfo(ticket) {
	$("#tick" + ticket).toggle();
}

function submitOrder() {
	goOrderFinished();
}

var urlhead = "http://tm-dev.glentaka.com:8000/ticketmaster";
function getData() {
	$.getJSON(urlhead + "/0F004CFCCA844D21/geometry/",
	function(result) {
		alert("finished");
	});
}

function setLogin() {

	var username = document.getElementById("usernameInput").value;
	var password = document.getElementById("passwordInput").value;

	username = "username";
	password = "password";

	var info = {};

	info["username"] = username;
	info["password"] = password;

	$.ajax({
		url : urlhead + "/login/", 
		crossDomain : true,
		type : "POST",
		data : info,
		success : function (data, status, obj) {
			alert(data);
			if (data == "0") {
				setCookie("username", username);
				setCookie("password", password);
			}
			else if (data == "1") {
				// password invalid
			}
			else if (data == "2") {
				// user doesnt exist
			}
		},
		error : function (err, status, obj) {
			alert("login error");
			alert(status);
		}
	});

	setCookie("username", username, 10);
	alert(document.cookie);
}

function isLoggedIn() {
	var status = getCookie("status");
	if (status == "loggedin") {
		return true;
	}
	return false;
}

function getUsername() {
	var username = getCookie("username");
	return username;
}

function setCookie(cname, cvalue, exmin) {
    var d = new Date();
    d.setTime(d.getTime() + (exmin*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
 }

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
    }
     return "";
}

function checkCookie() {
    var user = getCookie("username");
     if (user != "") {
        alert("Welcome again " + user);
     } else {
         user = prompt("Please enter your name:", "");
         if (user != "" && user != null) {
             setCookie("username", user, 365);
         }
    }
}
