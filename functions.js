// Redirect Functions
function goHome() {
	window.location.href="index.html";
}

function goVenue(id) {
	window.location.href="ticketsearch.html";
}

function goLogin(redirect, time) {
	window.location.href="login.html?page=" + redirect + "&time=" + time;
}

function goCheckout(time) {
	window.location.href="checkout.html?time=" + time;
}

function goPage(page) {
	window.location.href=page;
}

function goOrderFinished() {
	window.location.href="completed.html";
}

// Timing Functions
var updateObj;
function startTimer(seconds) {
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
		goHome();
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


		var segmentIds = parseSegmentIds(result);
		loadPrices(segmentIds);
		//loadSeatmap(result);
	});
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

	var formatted = "<option value=\"" + price + "\">US $" + price + ".00</option>";
	$("#eventPrices").children(":nth-child(" + index + ")").after(formatted);
}

function loadPrices(segmentIds) {
	for (var i = 0; i < segmentIds.length; i++) {
		$.ajax({
			url : urlhead + "get/price/",
			crossDomain : true,
			type : "POST",
			data : {"segment" : segmentIds[i]},
			data2 : {"segment" : segmentIds[i]},
			success : function(price, status, obj) {
        pprices[this.data2.segment] = parseFloat(price);
        if(jprices[parseFloat(price)] == undefined) {
        jprices[parseFloat(price)] = [];
        }
        jprices[parseFloat(price)].push(this.data2.segment);
				appendPrice(parseFloat(price));
			},
			error : function(error, status, obj) {
				setError("server price error");
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
				goPage(QueryString["page"]);
			}
			else if (data == "1") {
				setError("Invalid Password");
			}
			else if (data == "2") {
				setError("User doesn't exist");
			}
		},
		error : function (err, status, obj) {
			setError("Server Login Error");
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

function checkTimer() {
	var minutes = parseInt(QueryString["time"]);
	if (minutes) {
		startTimer(minutes * 60);
	}
}

function updateSummary() {
	var seats = getCart();
	for (var i = 0; i < seats.length; i++) {
		addRow(seats[i]);
	}
}

function addRow(seat) {
	var data = seat.split('-');

	$.ajax({
	url: urlhead + "get/price/",
	crossDomain: true,
	type: "POST",
	data: { "segment" : data[0] },
	success: function(price) {
		$("#ticketList tr:last").before(
			"<tr>" +
			"<td>" + data[1] + "</td>" +
			"<td>" + data[2] + "</td>" +
			"<td>" + data[3] + "</td>" +
			"<td>$" + parseFloat(price).toFixed(2) + "</td>" +
			"</tr>");
		var html = $("#totalamt").html();
		var amt = parseFloat(html.substring(1, html.length - 1));
		amt = amt + parseFloat(price);
		$("#totalamt").html("$" + amt.toFixed(2));
	}});
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

function updatePrice(amt) {
	var html = $("#amt").html();
	var price = parseFloat(html.substring(1, html.length - 1));
	price = price + amt;
	var toInsert = "$" + price.toFixed(2);
	$("#amt").html(toInsert);
}

function addToCart(id) {
	var cart = getCookie("cart");
	var newId = id.replace(';', '-').replace(';', '-').replace(';', '-');
	cart = cart + ":" + newId;
	setCookie("cart", cart, 30);

	var num = parseInt($("#ticknum").html());
	num++;
	$("#ticknum").html(num);
}

function removeFromCart(id) {
	var cart = getCookie("cart");
	var newId = id.replace(';', '-').replace(';', '-').replace(';', '-');
	var items = cart.split(':');
	var newcart = "";
	for (var i = 0; i < items.length; i++) {
		if (items[i] != newId && items[i]) {
			newcart = newcart + ':' + items[i];
		}
	}
	setCookie("cart", newcart, 30);

	var num = parseInt($("#ticknum").html());
	num--;
	$("#ticknum").html(num);
}

function resetCart() {
	setCookie("cart", "", -1);
}

function getCart() {
	var cart =  getCookie("cart").split(':');
	var uniqueCart = [];

	for (var i = 0; i < cart.length; i++) {
		if (cart[i] && $.inArray(uniqueCart, cart[i]) == -1) {
			uniqueCart[uniqueCart.length] = cart[i];
		}
	}
	return uniqueCart;
}

function reserveTickets() {
	var cart = getCart();
	if (cart != "") {
		if (getCookie("username")) {
			goCheckout("5");
		}
		else {
			goLogin("checkout.html", "8");
		}
	}
	else {
	}
}

function submitOrder() {
	var cart = getCart();

	for (var i = 0; i < cart.length; i++) {
		var seat = cart[i].replace('-', ';').replace('-', ';').replace('-', ';');
		$.ajax({
		url: urlhead + "reserveseats/",
		crossDomain: true,
		type: "POST",
		data: { "position" : seat },
		success: function(result) {
			if (result == "0") {
			}
			else if (result == "1") {
				setError("Cannot Reserve Seat!");
			}
		},
		error: function(jqHXR, status, err) {
			setError("Server Reserve Errror");
		}
		});
	}
	goOrderFinished();
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
    return query_string;
} ();
