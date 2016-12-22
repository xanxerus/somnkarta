//Constants
var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];
var INTERVAL_DELAY = 100;
var MAX_DOTS = 10;

//Variables
var intervalID = -1;
var points = [];
var data = null;
var row = -1;

/**
 * Returns a string with only the year, month, and day of a given date object
 * @param {Date} date - Date object to format
 * @return {String} "Monthname dd yyyy (Dayname)"
 */
function dateOnly(date){
	return monthNames[date.getMonth()] + " " + date.getDate() + " " 
		+ date.getFullYear() + " (" + dayNames[date.getDay()] + ")";
}

/**
 * Returns a string with only the time of a given date object
 * @param {Date} date - Date object to format
 * @return {String} "hh:mm"
 */
function timeOnly(date){
	var h = String(date.getHours());
	if(h.length < 2)
		h = "0" + h;
	
	var m = String(date.getMinutes());
	if(m.length < 2)
		m = "0" + m;
	
	return h + ":" + m;
}

/**
 * Brings up a map, queries the google sheet for data, then starts plotitng.
 */
function mapThings(){
	$(".mapcontainer").mapael({
		map: {
			name: "world_countries",
			defaultArea: {
				attrs: {
					fill: "#f4f4e8"
					, stroke: "#ced8d0"
				}
			}
			, defaultLink: {
				factor: 0.4
				, attrsHover: {
					stroke: "#a4e100"
				}
			}
			, defaultPlot: {
				text: {
					attrs: {
						fill: "#000"
					},
					attrsHover: {
						fill: "#000"
					}
				}
			}
		},
	});
	
	//Load library and data file
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(function(){
		$(document).ready(function() { 
			new google.visualization.Query(URL + encodeURIComponent(''))
			.send(function(response) {  
				data = response.getDataTable(); 
				intervalID = setInterval(updateMap, INTERVAL_DELAY);
			} )
		});
	});
}

/**
 * Reads through the spreadsheet for the next viable row of data, calculates
 * the point on Earth with the given wake and sleep time and plots it on the map,
 * deleting older points as it goes.
 */
function updateMap(){
	row++;
	if(points.length > MAX_DOTS)
		$(".mapcontainer").trigger('update', [{ 
			deletePlotKeys: [points.shift().toString()], 
			animDuration: INTERVAL_DELAY 
		}]);

	while(row < data.getNumberOfRows() && !(data.getValue(row, 1) && data.getValue(row, 2) && data.getValue(row, 5)))
		row++;

	if(row >= data.getNumberOfRows()){
		if(points.length > 0)
			$(".mapcontainer").trigger('update', [{ 
				deletePlotKeys: [points.shift().toString()], 
				animDuration: INTERVAL_DELAY 
			}]);
		else
			clearInterval(intervalID);
		return;
	}

	var wake = new Date(data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 2)*MS_PER_DAY));
	var sleep = MS_PER_DAY + data.getValue(row, 0).valueOf();
	if(data.getValue(row, 1) < .5)
		sleep += MS_PER_DAY*data.getValue(row, 1);
	else
		sleep += MS_PER_DAY*(data.getValue(row, 1) - 1);
	sleep = new Date(sleep);

	var g = inverse_riseset(sleep, wake);
	if(g == null || isNaN(S(g.l, g.phi)) || isNaN(R(g.l, g.phi))){
		updateMap();
		return;
	}

	var name = Number(row).toString();
	document.getElementById("message-div").innerHTML = "<table><tr><td>Date:</td><td>"+dateOnly(data.getValue(row, 0))+"</td></tr>"+"<tr><td>Sunset:</td><td>" + timeOnly(sleep) + "</td></tr><tr><td>Sunrise:</td><td>" + timeOnly(wake) + "</td></tr></table>";

	var newPlots = {};
	newPlots[name] = {
			longitude: g.l,
			latitude: g.phi,
			tooltip: {content: "Sunset: " + sleep + "\nSunrise: " + wake + "\nLongitude: " + g.l + "\nLatitude" + g.phi},
			size : 5
	};
	
	points.push(row);

	$(".mapcontainer").trigger('update', [{
		newPlots: newPlots, 
		animDuration: INTERVAL_DELAY
	}]);
}
