//Constants
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
	'July', 'August', 'September', 'October', 'November', 'December'];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 
	'Thursday', 'Friday', 'Saturday'];

//Variables
var splots = {};
var rplots = {};
var dplots = {};
var qlonplots = {};
var qlatplots = {};
var errplots = {};
var descentplots = {};

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
 * Initializes an empty world map
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

/**
 * Restarts the map and interval
 */
function resetMap(){
	$(".mapcontainer").trigger('update', [{deletePlotKeys:"all"}]);
	//~ initializeData();
}

/**
 * Calculates data about various points on Earth. Namely:
 * A function of error
 * The derivative of the error function with respect to longitude
 * The derivative of the error function with respect to latitude
 * The sunrise time
 * The sunset time
 * The duration of sunlight
 */
function initializeData(){
	var s = gtoj(new Date($("#usrSet")[0].value));
	var r = gtoj(new Date($("#usrRise")[0].value));
	
	var goalJ = (s+r)/2; //jTransit halfway between s and r
	var goalCos = Math.cos(Math.PI*(s-r)); //cos(w) so that goalJ - w/2pi = s
	console.log("inverse: " + jtog(goalJ) + " " + Math.acos(goalCos)/Math.PI*12);

	//guess n
	var n = Math.floor(s) - 2451544.9992;

	//get goalJ under the upper bound
	for(;;){
		var jStar = n + .5; //lon = -180
		var m = (357.5291+0.98560028*jStar)%360;
		var c = 1.9148*Math.sin(m*Math.PI/180) + 0.0200*Math.sin(2*m*Math.PI/180) + 0.0003*Math.sin(3*m*Math.PI/180);
		var l = (m+c+180+102.9372) % 360
		var upperJ = 2451545.5 + jStar + 0.0053*Math.sin(m*Math.PI/180) - 0.0069*Math.sin(2*l*Math.PI/180);
		if(goalJ < upperJ)
			break;
		n++;
	}

	//get goalJ over the lower bound	
	for(;;){
		var jStar = n - .5; //lon = 180
		var m = (357.5291+0.98560028*jStar)%360;
		var c = 1.9148*Math.sin(m*Math.PI/180) + 0.0200*Math.sin(2*m*Math.PI/180) + 0.0003*Math.sin(3*m*Math.PI/180);
		var l = (m+c+180+102.9372) % 360
		var lowerJ = 2451545.5 + jStar + 0.0053*Math.sin(m*Math.PI/180) - 0.0069*Math.sin(2*l*Math.PI/180);
		if(goalJ > lowerJ)
			break;
		n--;
	}

	var i = 0, lon = 0, lat = 0, step = 30;

	//gradient descent
	for(var lat = -90; lat <= 90; lat += 10){
		for(var lon = 180; lon > -180; lon -= 10){
			//error function
			var jStar = n - lon/360;
			var m = (357.5291+0.98560028*jStar)%360;
			var c = 1.9148*Math.sin(m*Math.PI/180) + 0.0003*Math.sin(3*m*Math.PI/180);
			var l = (m+c+180+102.9372) % 360
			var jTransit = 2451545.5 + jStar + 0.0053*Math.sin(m*Math.PI/180) + 0.0069*Math.sin(2*l*Math.PI/180);
			var sinDelta = Math.sin(l*Math.PI/180) * Math.sin(23.44*Math.PI/180);
			var cosOmega =(Math.sin(-0.83*Math.PI/180) - Math.sin(lat*Math.PI/180) * sinDelta) / (Math.cos(lat*Math.PI/180) * Math.cos(Math.asin(sinDelta)));
			var omega = Math.acos(cosOmega);


			//can we leave?
			var err = (Math.pow(goalJ-jTransit, 2)+1) * (Math.pow(goalCos-cosOmega, 2)+1);
			
			//longitude component of gradient
			var jStar_lon = -1/360.;
			var m_lon = 0.98560028*jStar_lon%360;
			var c_lon = 1.9148*Math.cos(m*Math.PI/180)*Math.PI/180*m_lon + 0.0003*Math.cos(3*m*Math.PI/180)*3*Math.PI/180*m_lon;
			var l_lon = (m_lon+c_lon) % 360;
			var jTransit_lon = jStar_lon + 0.0053*Math.cos(m*Math.PI/180)*m_lon*Math.PI/180 + 0.0069*Math.cos(2*l*Math.PI/180)*2*l_lon*Math.PI/180;
			var sinDelta_lon = Math.cos(l*Math.PI/180)*l_lon*Math.PI/180 * Math.sin(23.44*Math.PI/180);
			var cosOmega_lon = ((Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta))*(-sinDelta_lon*Math.sin(lat*Math.PI/180))) + (Math.sin(-0.83*Math.PI/180) - sinDelta*Math.sin(lat*Math.PI/180))*Math.cos(lat*Math.PI/180)*Math.sin(Math.asin(sinDelta))*sinDelta_lon/Math.sqrt(1-Math.pow(sinDelta, 2))) / Math.pow(Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)), 2)
			var qlon = Math.pow(jTransit-goalJ, 2) * 2 * cosOmega_lon * (cosOmega - goalCos)
			+  Math.pow(cosOmega-goalCos, 2) * 2 * jTransit_lon * (jTransit - goalJ)
			+  2 * cosOmega_lon * (cosOmega - goalCos)
			+  2 * jTransit_lon * (jTransit - goalJ);
			var dlon = qlon*step/Math.log(i+2);

			//latitude component of gradient
			var cosOmega_lat = ((Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta))*(-sinDelta*Math.cos(lat*Math.PI/180))) - (Math.sin(-0.83*Math.PI/180) - sinDelta*Math.sin(lat*Math.PI/180))*(-Math.sin(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)))) / Math.pow(Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)), 2)
			var qlat = Math.pow(jTransit-goalJ, 2) * 2 * cosOmega_lat * (cosOmega - goalCos)
			+  2 * cosOmega_lat * (cosOmega - goalCos);
			var dlat = qlat*step/Math.log(i+2)/100;

			
			if(!isNaN(qlon) && Math.abs(qlon)*10000 < 60){
				qlonplots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Q_lon: " + qlon + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(qlon)*10000
				};
			}
			
			if(!isNaN(qlat) && Math.abs(qlat)*10 < 60){
				qlatplots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Q_lat: " + qlat + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(qlat)*10
				};
			}

			if(!isNaN(err) && Math.abs(err-1)*100 < 60){
				errplots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Error: " + err + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(err-1)*100
				};
			}

			var sunrise = jTransit - omega/Math.PI/2;
			var sunset = jTransit + omega/Math.PI/2;
			var duration = omega/Math.PI;

			if(!isNaN(sunrise) && Math.abs(r-sunrise)*100 < 60){
				splots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Sunrise: " + jtog(sunrise) + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(r-sunrise)*100
				};
			}

			if(!isNaN(sunset) && Math.abs(s-sunset)*100 < 60){
				rplots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Sunset: " + jtog(sunset) + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(s-sunset)*100
				};
			}

			if(!isNaN(duration) && Math.abs(duration)*24 < 60){
				dplots[lat + '' + lon] = {
						longitude: lon,
						latitude: lat,
						tooltip: {content: "Duration: " + duration + "\nLongitude: " + lon + "\nLatitude: " + lat},
						size: Math.abs(duration)*24
				};
			}

		}
	}
}

function demoqlon(){
	resetMap();
	if(jQuery.isEmptyObject(qlonplots))
		initializeData();
	console.log(JSON.stringify(qlonplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: qlonplots, 
	}]);
}

function demoqlat(){
	resetMap();
	if(jQuery.isEmptyObject(qlatplots))
		initializeData();
	console.log(JSON.stringify(qlatplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: qlatplots, 
	}]);
}

function demoerr(){
	resetMap();
	if(jQuery.isEmptyObject(errplots))
		initializeData();
	console.log(JSON.stringify(errplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: errplots, 
	}]);
}

function demoS(){
	resetMap();
	if(jQuery.isEmptyObject(splots))
		initializeData();
	console.log(JSON.stringify(splots));
	$(".mapcontainer").trigger('update', [{
		newPlots: splots, 
	}]);
}

function demoR(){
	resetMap();
	if(jQuery.isEmptyObject(rplots))
		initializeData();
	console.log(JSON.stringify(rplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: rplots, 
	}]);
}

function demoD(){
	resetMap();
	if(jQuery.isEmptyObject(dplots))
		initializeData();
	console.log(JSON.stringify(dplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: dplots, 
	}]);
}

function demodescent(){
	resetMap();
	var s = gtoj(new Date($("#usrSet")[0].value));
	var r = gtoj(new Date($("#usrRise")[0].value));
	inverse_riseset(s, r, 1.0001, true);
	console.log(JSON.stringify(descentplots));
	$(".mapcontainer").trigger('update', [{
		newPlots: descentplots, 
	}]);
}
