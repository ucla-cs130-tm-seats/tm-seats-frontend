// Redirect Functions
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

// Timing Functions
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

// Order Summary Functions
function toggleInfo(ticket) {
	$("#tick" + ticket).toggle();
}

// Error Functions
function setError(error) {
	$("#errorSection").empty().append(error).show();
}

// Ticket Search Functions 
function loadTicketSearch(eventId) {
	$.getJSON(urlhead + eventId + "/geometry/",
	function(result) {
		
		loadSeatmap(result);
		
		var segmentIds = parseSegmentIds(result);
		loadPrices(segmentIds);
	});
}

function loadSeatmap(data) {

}

function parseSegmentIds(data) {
	var shapes = data["shapes"];
	var segmentIds = new Array(shapes.length);
	for (var i = 0; i < shapes.length; i++) {
		segmentIds[i] = shapes[i]["segmentId"];
	}
	return segmentIds;
}

var prices = [];
function appendPrice(price) {
	if (price <= 0 || $.inArray(price, prices) != -1) {
		return;
	}

	var index = 1;
	
	for (var i = 0; i < prices.length; i++) {
		if (price > prices[i]) {
			index++;
		}
	}

	prices[prices.length] = price;

	var formatted = "<option>US $" + price + ".00</option>";
	$("#eventPrices").children(":nth-child(" + index + ")").after(formatted);
}

function loadPrices(segmentIds) {
	for (var i = 0; i < segmentIds.length; i++) {
		$.ajax({
			url : urlhead + "get/price/",
			crossDomain : true,
			type : "POST",
			data : {"segment" : segmentIds[i]},
			success : function(price, status, obj) {
				appendPrice(price);
			},
			error : function(error, status, obj) {
				alert("error");
			}
		});
	}
}

// Server Request Functions
var urlhead = "http://tm-dev.glentaka.com:8000/ticketmaster/";

function setLogin() {

	var username = document.getElementById("usernameInput").value;
	var password = document.getElementById("passwordInput").value;

	if (!username) {
		setError("Invalid Input");
		return;
	}
	
	var info = {};
	info["username"] = username;
	info["password"] = password;

	$.ajax({
		url : urlhead + "login/", 
		crossDomain : true,
		type : "POST",
		data : info,
		success : function (data, status, obj) {
			if (data == "0") {
				setCookie("username", username, 60);
				setCookie("password", password, 60);
				alert("Login Successful");
				goHome();
			}
			else if (data == "1") {
				setError("Invalid Password");
			}
			else if (data == "2") {
				setError("User doesn't exist");
			}
		},
		error : function (err, status, obj) {
			alert("login error");
			alert(status);
		}
	});
}

// Login Functions
function checkLogin() {
	var user = getCookie("username");
	if (user) {
		var innerHTML = user + "<br><a href='logout.html' style='color: gray'>Logout</a>";
		$("#user").empty().append(innerHTML).toggle();
		$("#loginbutton").toggle();
	}
}

// Cookie Functions
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
