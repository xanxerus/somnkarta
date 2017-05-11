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
 * Initializes an empty world map and a range slider
 */
function initializeUI(){
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

	$( "#slider-range" ).slider({
		range: true,
		min: 0,
		max: DATA.getNumberOfRows()-1,
		values: [ 170, 591 ],
		slide: function( event, ui ) {
			$( "#amount" ).html( dateOnly(DATA.getValue(ui.values[0],0)) + " to " + dateOnly(DATA.getValue(ui.values[1],0)));
		}
	});
	
	$( "#amount" ).html(dateOnly(DATA.getValue($("#slider-range").slider("values", 0),0)) + " to " + dateOnly(DATA.getValue($( "#slider-range" ).slider( "values", 1 ),0)));
}

/**
 * Starts the iteration through the map using the dates given by the UI
 */
function rangeMap(){
	ROW = $("#slider-range").slider("values", 0);
	END = $("#slider-range").slider("values", 1);
	intervalID = setInterval(updateMap, INTERVAL_DELAY);
}

/**
 * Resets the map and stops the iteration of points
 */
function resetMap(){
	clearInterval(intervalID);
	ROW = -1;
	END = -1;
	$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
	document.getElementById("date-cell").innerHTML = "None";
	document.getElementById("sunset-cell").innerHTML = "None";
	document.getElementById("sunrise-cell").innerHTML = "None";
	document.getElementById("latitude-cell").innerHTML = "None";
	document.getElementById("longitude-cell").innerHTML = "None";
}

/**
 * Iterates through a range in the spreadsheet specified by ROW and END.
 * For each data point, plots the point on the Earth with a corresponding
 * sleep and wake time.
 */
function updateMap(){
	ROW++;
	
	//remove a point if there are too many or we are winding down.
	if(points.length > MAX_DOTS || ROW > END && points.length > 0)
		$(".mapcontainer").trigger('update', [{ 
			deletePlotKeys: [points.shift().toString()], 
			animDuration: INTERVAL_DELAY 
		}]);

	//stop if we are done and all points are gone
	if(ROW > END){
		if(points.length == 0)
			clearInterval(intervalID);
		return;
	}

	//read the wake and sleep time from the spreadsheet
	var wake = new Date(DATA.getValue(ROW, 0).valueOf() + Math.round(DATA.getValue(ROW, 2)*MS_PER_DAY));
	var sleep = DATA.getValue(ROW, 0).valueOf();
	if(DATA.getValue(ROW, 1) < .5)
		sleep += MS_PER_DAY*DATA.getValue(ROW, 1);
	else
		sleep += MS_PER_DAY*(DATA.getValue(ROW, 1) - 1);
	sleep = new Date(sleep+MS_PER_DAY);

	//calculate the point on Earth with the corresponding times
	var g = inverse_riseset(sleep, wake);

	//update the UI
	document.getElementById("date-cell").innerHTML = dateOnly(DATA.getValue(ROW, 0));
	document.getElementById("sunset-cell").innerHTML = sleep;
	document.getElementById("sunrise-cell").innerHTML = wake;
	
	//if no point was found, plot nothing and move on
	if(g == null || Math.abs(g.lon) > 180 || Math.abs(g.lat) > 90 ){
		document.getElementById("latitude-cell").innerHTML = 'Error';
		document.getElementById("longitude-cell").innerHTML = 'Error';
		console.log("Inverse Exception", dateOnly(wake));
		return;
	}

	document.getElementById("latitude-cell").innerHTML = g.lat;
	document.getElementById("longitude-cell").innerHTML = g.lon;

	//add the point to th em
	var name = Number(ROW).toString();
	var newPlots = {};
	newPlots[name] = {
			longitude: g.lon,
			latitude: g.lat,
			tooltip: {content: "Sunset: " + sleep + "\nSunrise: " + wake + "\nLongitude: " + g.lon + "\nLatitude: " + g.lat},
			size : 5
	};
	
	points.push(ROW);

	$(".mapcontainer").trigger('update', [{
		newPlots: newPlots, 
		animDuration: INTERVAL_DELAY
	}]);
}
