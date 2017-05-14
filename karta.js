//Constants
var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var QUERY = "/gvis/gid=0&headers=1&tq=" + encodeURIComponent('select A,B,C,E,D where (F = TRUE and E is not null)');
var DATA = null;

var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];

//Variables
var intervalID = -1;
var ROW = -1;
var END = -1;
var points = [];

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
	document.getElementById("message").innerHTML = "Select a date range and press play";
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

	$( "#date-range" ).slider({
		range: true,
		min: 0,
		max: DATA.getNumberOfRows()-1,
		values: [ 170, 591 ],
		slide: function( event, ui ) {
			$( "#date-range-msg" ).html( dateOnly(DATA.getValue(ui.values[0],0)) + " to " + dateOnly(DATA.getValue(ui.values[1],0)));
		}
	});

	$( "#speed-range" ).slider({
		range: 'min',
		min: 0,
		max: 1000,
		value: 100,
		slide: function( event, ui ) {
			$( "#speed-range-msg" ).html( ui.value + " ms" );
		}
	});

	$( "#streak-range" ).slider({
		range: 'min',
		min: 0,
		max: 20,
		value: 10,
		slide: function( event, ui ) {
			$( "#streak-range-msg" ).html( ui.value + " dots" );
		}
	});

	$( "#date-range-msg" ).html(dateOnly(DATA.getValue($("#date-range").slider("values", 0),0)) + " to " + dateOnly(DATA.getValue($( "#date-range" ).slider( "values", 1 ),0)));
	$( "#speed-range-msg" ).html($("#speed-range").slider("value") + " ms");
	$( "#streak-range-msg" ).html($("#streak-range").slider("value") + " dots");

}

function buttonPlay(){
	if(intervalID < 0){ //play button
		document.getElementById('playbutton').className = 'pause';
		if(ROW < 0)
			ROW = $("#date-range").slider("values", 0);
		END = $("#date-range").slider("values", 1);
		intervalID = setInterval(updateMap, $("#speed-range").slider("value"));
	}
	else{ //pause button
		document.getElementById('playbutton').className = 'play';
		clearInterval(intervalID);
		intervalID = -1;
	}
}

function buttonAgain(){
	$('#message')[0].innerHTML = 'Again!';
	$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
	ROW = -1;
	END = -1;
	if(intervalID >= 0)
		buttonPlay();
}

function buttonBack(){
	$('#message')[0].innerHTML = 'Back! Back I say!';
	if(intervalID >= 0)
		buttonPlay();
}

function buttonForward(){
	$('#message')[0].innerHTML = 'Furthermore!';
	if(intervalID >= 0)
		buttonPlay();
	updateMap();
}

function buttonMenu(){
	$('#menu').toggle( 'blind', {}, 500);
}

/**
 * Iterates through a range in the spreadsheet specified by ROW and END.
 * For each data point, plots the point on the Earth with a corresponding
 * sleep and wake time.
 */
function updateMap(){
	ROW++;
	
	//remove a point if there are too many or we are winding down.
	if(points.length > $("#streak-range").slider("value") || ROW > END && points.length > 0)
		$(".mapcontainer").trigger('update', [{ 
			deletePlotKeys: [points.shift().toString()], 
			animDuration: $("#speed-range").slider("value") 
		}]);

	//stop if we are done and all points are gone
	if(ROW > END){
		if(points.length == 0)
			buttonAgain();
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

	document.getElementById("message").innerHTML = dateOnly(DATA.getValue(ROW, 0));
	/**
	//update the UI
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
	*/

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
		animDuration: $("#speed-range").slider("value")
	}]);
}
