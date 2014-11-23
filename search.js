$(document).ready(function() {
/*
$.get("eventdata", {
	eventId: ####
}, function(resp) {
	$("#eventImage").append(resp[0]);
	$("#eventVenue").append(resp[1]);
	$("#eventLocTime").append(resp[2]);
	$("#eventSectionAreas").append(resp[3]);
	$("#eventMaxTicketNum").append(resp[4]);
	$("#eventPrices").append(resp[5]);
});
*/
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