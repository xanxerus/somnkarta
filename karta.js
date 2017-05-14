//Constants
var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var QUERY = "/gvis/gid=0&headers=1&tq=" + encodeURIComponent('select A,B,C,E,D where (F = TRUE and E is not null)');
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];

//Variables
var intervalID = -1;
var ROW = -1;
var dataPoints = [];

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
 * Processes a Google Visualization data table, calculates the inverse
 * sunrise for each date, and stores in the dataPoints array.
 * Must run before using any function below this one.
 */
function processData(data){
	for(var row = 0; row < data.getNumberOfRows(); row++){
		var wake = new Date(data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 2)*MS_PER_DAY));
		var sleep = data.getValue(row, 0).valueOf();
		if(data.getValue(row, 1) < .5)
			sleep += MS_PER_DAY*data.getValue(row, 1);
		else
			sleep += MS_PER_DAY*(data.getValue(row, 1) - 1);
		
		var g = inverse_riseset(new Date(sleep + MS_PER_DAY), wake);
		
		if(g == null || Math.abs(g.lon) > 180 || Math.abs(g.lat) > 90){
			//~ console.log("Inverse Exception", dateOnly(wake));
			continue;
		}
		
		dataPoints.push({'rise':wake, 'set':new Date(sleep), 'lon':g.lon, 'lat':g.lat});
	}
}

/**
 * Initializes an empty world map and a range slider
 */
function initializeUI(){
	//initializes map
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

	//initialize date range slider
	$( "#date-range" ).slider({
		range: true,
		min: 0,
		max: dataPoints.length-1,
		values: [ 170, 591 ],
		slide: function( event, ui ) {
			$( "#date-range-msg" ).html( dateOnly(dataPoints[ui.values[0]].rise) + " to " + dateOnly(dataPoints[ui.values[1]].rise) );
			if(intervalID >= 0){
				END = ui.values[1];
			}
		}
	});

	//initialize speed range slider
	$( "#speed-range" ).slider({
		range: 'min',
		min: 0,
		max: 1000,
		value: 100,
		slide: function( event, ui ) {
			$( "#speed-range-msg" ).html( ui.value + " ms" );
			if(intervalID >= 0){
				clearInterval(intervalID);
				intervalID = setInterval(stepForward, ui.value);
			}
		}
	});

	//initialize streak range slider
	$( "#streak-range" ).slider({
		range: 'min',
		min: 0,
		max: 20,
		value: 10,
		slide: function( event, ui ) {
			$( "#streak-range-msg" ).html( ui.value + " dots" );
			if(intervalID >= 0)
				$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
		}
	});

	$( "#date-range-msg" ).html(dateOnly(dataPoints[$("#date-range").slider("values", 0)].rise) + " to " + dateOnly(dataPoints[$("#date-range").slider("values", 1)].rise));
	$( "#speed-range-msg" ).html($("#speed-range").slider("value") + " ms");
	$( "#streak-range-msg" ).html($("#streak-range").slider("value") + " dots");
}

/**
 * If playing, pauses. If paused, resumes.
 */
function buttonPlay(){
	if(intervalID < 0){ //play button
		document.getElementById('playbutton').className = 'pause';
		if(ROW < 0)
			ROW = $("#date-range").slider("values", 0);
		intervalID = setInterval(stepForward, $("#speed-range").slider("value"));
	}
	else{ //pause button
		document.getElementById('playbutton').className = 'play';
		clearInterval(intervalID);
		intervalID = -1;
	}
}

/**
 * Resets the map and pauses.
 */
function buttonAgain(){
	$('#message')[0].innerHTML = 'Again!';
	$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
	ROW = -1;
	if(intervalID >= 0)
		buttonPlay();
}

/**
 * Steps back one frame and pauses.
 */
function buttonBack(){
	$('#message')[0].innerHTML = 'Back! Back I say!';
	if(intervalID >= 0)
		buttonPlay();
	if(ROW >= 0)
		stepBack();
}

/**
 * Steps forward one frame and pauses.
 */
function buttonForward(){
	$('#message')[0].innerHTML = 'Furthermore!';

	if(intervalID < 0){ //play button
		if(ROW < 0)
			ROW = $("#date-range").slider("values", 0);
	}
	else{ //pause button
		buttonPlay();
	}

	stepForward();
}

/**
 * Toggles menu visibility.
 */
function buttonMenu(){
	$('#menu').toggle( 'blind', {}, 500);
}

/**
 * Steps forward one frame. Deletes dots beyond the streak limit.
 * Pauses if no dots are left.
 */
function stepForward(){
	if(ROW > $( "#date-range" ).slider( "values", 1 ) + $("#streak-range").slider("value")){ //no points to remove
		buttonAgain();
		return;
	}
	
	if(ROW >= $("#streak-range").slider("value")){ //remove points
		$(".mapcontainer").trigger('update', [{ 
			deletePlotKeys: [ROW - $("#streak-range").slider("value")], 
			animDuration: $("#speed-range").slider("value")
		}]);
	}
	
	if(ROW > $( "#date-range" ).slider( "values", 1 )){ //do not plot a point
		ROW++;
		return;
	}
	
	document.getElementById("message").innerHTML = dateOnly(dataPoints[ROW].rise);
	
	var newPlots = {}
	newPlots[ROW] = {
		longitude: dataPoints[ROW].lon,
		latitude: dataPoints[ROW].lat,
		tooltip: {content: "Sunset: " + dataPoints[ROW].set + "\nSunrise: " + dataPoints[ROW].rise + "\nLongitude: " + dataPoints[ROW].lon + "\nLatitude: " + dataPoints[ROW].lat},
		size : 5
	};
	
	$(".mapcontainer").trigger('update', [{
		newPlots: newPlots,
		animDuration: $("#speed-range").slider("value")
	}]);
	
	ROW++;
}

/**
 * Steps back one frame. Deletes dots beyond the streak limit.
 */
function stepBack(){
	ROW--;
	
	if(ROW < 0){ //no points to remove
		return;
	}
	
	//remove points
	$(".mapcontainer").trigger('update', [{ 
		deletePlotKeys: [ROW], 
		animDuration: $("#speed-range").slider("value")
	}]);
	
	var row = ROW - $("#streak-range").slider("value");
	if(row < 0){ //do not plot a point
		return;
	}
	
	document.getElementById("message").innerHTML = "Re-added " + dateOnly(dataPoints[row].rise);

	var newPlots = {}
	newPlots[row] = {
		longitude: dataPoints[row].lon,
		latitude: dataPoints[row].lat,
		tooltip: {content: "Sunset: " + dataPoints[row].set + " Sunrise: " + dataPoints[row].rise + " Longitude: " + dataPoints[row].lon + " Latitude: " + dataPoints[row].lat},
		size : 5
	};
	
	$(".mapcontainer").trigger('update', [{
		newPlots: newPlots,
		animDuration: $("#speed-range").slider("value")
	}]);
}
