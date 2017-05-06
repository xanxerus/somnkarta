//Constants
var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var QUERY = "/gvis/gid=0&headers=1&tq=" + encodeURIComponent('select A,B,C,E,D where (F = TRUE and E is not null)');
var DATA = null;

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];
var INTERVAL_DELAY = 100;
var MAX_DOTS = 10;

//Variables
var intervalID = -1;
var points = [];
//~ var data = null;
var ROW = -1;
var END = -1;

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
function initializeMap(){
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
}

function rangeMap(){
	ROW = $("#slider-range").slider("values", 0);
	END = $("#slider-range").slider("values", 1);
	intervalID = setInterval(updateMap, INTERVAL_DELAY);
}

/**
 * Restarts the map and interval
 */
function resetMap(){
	clearInterval(intervalID);
	ROW = -1;
	END = -1;
	$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
	document.getElementById("date-cell").innerHTML = "None";
	document.getElementById("sunset-cell").innerHTML = "None";
	document.getElementById("sunrise-cell").innerHTML = "None";
	
	

}

/**
 * Reads through the spreadsheet for the next viable row of data, calculates
 * the point on Earth with the given wake and sleep time and plots it on the map,
 * deleting older points as it goes.
 */
function updateMap(){
	ROW++;
	if(points.length > MAX_DOTS || ROW > END && points.length > 0)
		$(".mapcontainer").trigger('update', [{ 
			deletePlotKeys: [points.shift().toString()], 
			animDuration: INTERVAL_DELAY 
		}]);

	if(ROW > END){
		if(points.length == 0)
			clearInterval(intervalID);
		return;
	}

	var wake = new Date(DATA.getValue(ROW, 0).valueOf() + Math.round(DATA.getValue(ROW, 2)*MS_PER_DAY));
	var sleep = MS_PER_DAY + DATA.getValue(ROW, 0).valueOf();
	if(DATA.getValue(ROW, 1) < .5)
		sleep += MS_PER_DAY*DATA.getValue(ROW, 1);
	else
		sleep += MS_PER_DAY*(DATA.getValue(ROW, 1) - 1);
	sleep = new Date(sleep);

	var g = inverse_riseset(sleep, wake);
	if(g == null || isNaN(S(g.l, g.phi)) || isNaN(R(g.l, g.phi))){
		console.log("Inverse exception\nDate: " + DATA.getValue(ROW, 0) +
					+ "\nWake: " + wake
					+ "\nSleep: " + sleep
					+ "\nG: " + g + "\n\n");
		return;
	}

	var name = Number(ROW).toString();
	document.getElementById("date-cell").innerHTML = dateOnly(DATA.getValue(ROW, 0));
	document.getElementById("sunset-cell").innerHTML = timeOnly(sleep);
	document.getElementById("sunrise-cell").innerHTML = timeOnly(wake);
	
	
	//~ "</td></tr><tr><td>Sunrise:</td><td>" + timeOnly(wake) + "</td></tr></table>";

	var newPlots = {};
	newPlots[name] = {
			longitude: g.l,
			latitude: g.phi,
			tooltip: {content: "Sunset: " + sleep + "\nSunrise: " + wake + "\nLongitude: " + g.l + "\nLatitude" + g.phi},
			size : 5
	};
	
	points.push(ROW);

	$(".mapcontainer").trigger('update', [{
		newPlots: newPlots, 
		animDuration: INTERVAL_DELAY
	}]);
}

function gogogo(data){
	DATA = data;
	initializeMap();
	
	$( "#slider-range" ).slider({
		range: true,
		min: 0,
		max: data.getNumberOfRows()-1,
		values: [ 170, 591 ],
		slide: function( event, ui ) {
			$( "#amount" ).html( dateOnly(DATA.getValue(ui.values[0],0)) + " to " + dateOnly(DATA.getValue(ui.values[1],0)));
		}
	});
	
	$( "#amount" ).html(dateOnly(DATA.getValue($("#slider-range").slider("values", 0),0)) + " to " + dateOnly(DATA.getValue($( "#slider-range" ).slider( "values", 1 ),0)));
}
