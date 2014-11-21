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

function gotoSeatMap() {
	window.location.href="/seatmap.html?" + eventId;	
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
	}
}