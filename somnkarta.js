var MS_PER_MINUTE = 60000;
var DESIRED_EPSILON = MS_PER_MINUTE/2;
var J_UNIX_EPOCH = 2440587.5;
var MS_PER_DAY = 86400000;

var divname = "test-div"
var date = new Date(); //Date.UTC(2016, 11, 14));
var duration = 8*60*MS_PER_MINUTE;
var latitude = 32.989924;
var longitude = -96.751620;

//https://en.wikipedia.org/wiki/Sunrise_equation
function riseset(latitude, longitude, date){
	date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	var n = Math.floor(date/MS_PER_DAY) + J_UNIX_EPOCH - 2451545.0008;
	var J_star = n - longitude/360;
	var M = (357.5291 + 0.98560028*J_star) % 360;
	var M_radians = M / 180 * Math.PI;
	var C = 1.9148*Math.sin(M_radians) + 0.0200*Math.sin(2*M_radians) + 0.0003*Math.sin(3*M_radians);
	var L = (M+C+180+102.9372)%360;
	var J_transit = 2451545.5 + J_star + 0.0053*Math.sin(M_radians) - 0.0069*Math.sin(2*L);
	var sind = Math.sin(L/180*Math.PI)*Math.sin(23.44/180*Math.PI);
	var cosw = ( Math.sin(-0.83/180*Math.PI) - Math.sin(latitude/180*Math.PI)*sind ) / (Math.cos(latitude/180*Math.PI)*Math.cos(Math.asin(sind)));
	var w = Math.acos(cosw)*180/Math.PI;
	
	var J_set = J_transit + w/360;
	var J_rise = J_transit - w/360;
	
	var date_set = new Date(MS_PER_DAY*(J_set - J_UNIX_EPOCH));
	var date_rise = new Date(MS_PER_DAY*(J_rise - J_UNIX_EPOCH));
	
	return {'set':date_set, 'rise':date_rise};
}

function showThings(){
	var div = document.getElementById(divname);
	var m = riseset(latitude, longitude, date);
	div.innerHTML += "Rise: " + m.rise + "<br>";
	div.innerHTML += "Set: " + m.set + "<br>";

	//~ for(var hour = -23; hour < 24; hour++){
		//~ var m = riseset(latitude, longitude, new Date(2016, 11, 14, hour, 0, 0, 0));
		//~ div.innerHTML += "Hour: " + hour + "    ";
		//~ div.innerHTML += "Set: " + m.set + "    ";
		//~ div.innerHTML += "Rise: " + m.rise + "<br>";
	//~ }
}

function latitudeSearch(date, duration, longitude=0, div=null){
	if(div != null)
		div.innerHTML += "Searching latitudes for duration: " + duration + "<br>";

	var southern = -90;
	var northern = 90;
	var increasing = A(date, -10, longitude) < A(date, 10, longitude); //never fails
	var pot;

	while(southern < northern){
		pot = (southern+northern)/2;
		a = A(date, pot, longitude);
		if(div != null)
			div.innerHTML += "Date: " + date + " Latitude: " + pot 
						  + " Longitude: " + longitude + " Duration: " + a + "<br>";
		
		if(a != undefined && tol(a, duration, DESIRED_EPSILON))
			return pot;
		
		if(a < duration && increasing || a > duration && !increasing || a == undefined && pot < 0)
			southern = pot;
		else if(a > duration && increasing || a < duration && !increasing || a==undefined && pot > 0)
			northern = pot;
	}

	if(div != null)
		div.innerHTML += "For some reason, no latitude was found.<br>";

}

function tol(a, b, epsilon){
	return Math.abs(a-b) <= epsilon;
}

function A(date, latitude, longitude){
	var sunrise = SunCalc.getTimes(date, latitude, longitude).sunrise;
	if(isNaN(sunrise))
		return undefined;

	var sunset = SunCalc.getTimes(new Date(sunrise + 30*MS_PER_MINUTE), latitude, longitude).sunset;
	if(isNaN(sunset))
		return undefined;

	return sunset-sunrise;
}
