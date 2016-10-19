
var MS_PER_MINUTE = 60000;
var DESIRED_EPSILON = MS_PER_MINUTE/2;

function getFormData(){
	var ret = {};
	var ser = $('form').serializeArray();
	for(var i = 0; i < ser.length; i++)
		ret[ser[i].name] = Number(ser[i].value);
	return ret;
}

function showThings(divname){
	div = document.getElementById(divname);
	var form = getFormData();
	var date = new Date(Date.UTC(form.year, form.month-1, form.day+1));
	var duration = form.hour*60*MS_PER_MINUTE + form.minute*MS_PER_MINUTE;
	
	//~ var times = SunCalc.getTimes(date, form.latitude, form.longitude);
	//~ div.innerHTML += times.sunrise + "\t" + times.sunset + "<br>";
	div.innerHTML = "";
	latitudeSearch(date, duration, 0, div);
}

function latitudeSearch(date, duration, longitude=0, div=null){
	if(div != null)
		div.innerHTML += "Searching latitudes for duration: " + duration + "<br>";

	var southern = -90;
	var northern = 90;
	var increasing = A(date, -10, longitude) < A(date, 10, longitude); //never fails
	var pot;

	while(southern < northern){
		//~ alert("moo " + duration);
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

