/*
 * sun.js is the mathy backend of the Somnkarta project.
 * It is a util class for calculating sunrise and sunset times
 * based on the wikipedia page for sunrise equation
 * https://en.wikipedia.org/wiki/Sunrise_equation
 * 
 * It includes functions for each part of the sunrise equation as well as their
 * partial derivatives with respect to longitude (l) and latitude (phi).
 * There is also an error function which quantifies how far off a point is
 * from having a specified sunrise and sunset. Its derivatives are also included.
 * 
 * The error function and partial derivative functions are used in the
 * gradient descent function, which takes a sunrise and sunset time and finds
 * a point on earth with a maximum given error.
 * 
 * Using the sunrise equation requires the setN() function to be called first.
 * Using the error function requires the initialize() function to be called first.
 */

//Conversion factors used in calculation
var MS_PER_MINUTE = 60000;
var J_UNIX_EPOCH = 2440587.5;
var MS_PER_DAY = 86400000;

//Global variables used in calculations. Must be initialized.
var n = -1;

/**
 * Calculates sunrise and sunset for a day and point on Earth
 * @param {Date} date - The day to calculate sunrise for
 * @param {number} lon - The longitude of the point on Earth
 * @param {number} lat - The latitude of the point on Earth
 * @return {Object} An object with 'set' and 'rise' attributes
 */
function riseset(date, lon, lat){
	n = floorgtoj(date) - 2451545.0008;

	var jStar = n - lon/360;
	var m = (357.5291+0.98560028*jStar)%360;
	var c = 1.9148*Math.sin(m*Math.PI/180) + 0.0003*Math.sin(3*m*Math.PI/180);
	var l = (m+c+180+102.9372) % 360
	var jTransit = 2451545.5 + jStar + 0.0053*Math.sin(m*Math.PI/180) + 0.0069*Math.sin(2*l*Math.PI/180);
	var sinDelta = Math.sin(l*Math.PI/180) * Math.sin(23.44*Math.PI/180);
	var cosOmega =(Math.sin(-0.83*Math.PI/180) - Math.sin(lat*Math.PI/180) * sinDelta) / (Math.cos(lat*Math.PI/180) * Math.cos(Math.asin(sinDelta)));
	var omega = Math.acos(cosOmega);

	var q = omega/(2*Math.PI);
	return {'set':jtog(jTransit+q), 'rise':jtog(jTransit-q)};
}

/**
 * Calculates a point on Earth with a given sunrise and sunset using Gradient Descent.
 * @param {Date} s - Time of sunset
 * @param {Date} r - Time of sunrise
 * @param {number} error - The maximum desired error. 1.0001 by default, about ten minutes.
 * @return An object with attributes 'l' and 'phi' and also 'i' the number of steps taken.
 */
function inverse_riseset(s, r, error = 1.0001){
	n = floorgtoj(s) - 2451545.0008
	s = gtoj(s);
	r = gtoj(r);
	
	var i = 0, lon = 0, lat = 0, step = 5000;
	//choose jTransit halfway between s and r 
	var goalJ = (s+r)/2;
	//choose cos(w) so that goalJ - w/2pi = s
	var goalCos = Math.cos(2*Math.PI*(goalJ-s));

	console.log(goalJ, goalCos);

	for(;;){
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
		if((Math.pow(goalJ-jTransit, 2)+1) * (Math.pow(goalCos-cosOmega, 2)+1) < error){
			//~ console.log((Math.pow(goalJ-jTransit, 2)+1) * (Math.pow(goalCos-cosOmega, 2)+1));
			break;
		}
		
		//error in lon
		var jStar_lon = -1/360.;
		var m_lon = 0.98560028*jStar_lon%360;
		var c_lon = 1.9148*Math.cos(m*Math.PI/180)*Math.PI/180*m_lon + 0.0003*Math.cos(3*m*Math.PI/180)*3*Math.PI/180*m_lon;
		var l_lon = (m_lon+c_lon) % 360;
		var jTransit_lon = jStar_lon + 0.0053*Math.cos(m*Math.PI/180)*m_lon*Math.PI/180 + 0.0069*Math.cos(2*l*Math.PI/180)*2*l_lon*Math.PI/180;
		var sinDelta_lon = Math.cos(l*Math.PI/180)*l_lon*Math.PI/180 * Math.sin(23.44*Math.PI/180);
		var cosOmega_lon = ((Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta))*(-sinDelta_lon*Math.sin(lat*Math.PI/180))) + (Math.sin(-0.83*Math.PI/180) - sinDelta*Math.sin(lat*Math.PI/180))*Math.cos(lat*Math.PI/180)*Math.sin(Math.asin(sinDelta))*sinDelta_lon/Math.sqrt(1-Math.pow(sinDelta, 2))) / Math.pow(Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)), 2)

		//error in lat
		var cosOmega_lat = ((Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta))*(-sinDelta*Math.cos(lat*Math.PI/180))) - (Math.sin(-0.83*Math.PI/180) - sinDelta*Math.sin(lat*Math.PI/180))*(-Math.sin(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)))) / Math.pow(Math.cos(lat*Math.PI/180)*Math.cos(Math.asin(sinDelta)), 2)

		var qlon = Math.pow(jTransit-goalJ, 2) * 2 * cosOmega_lon * (cosOmega - goalCos)
		+  Math.pow(cosOmega-goalCos, 2) * 2 * jTransit_lon * (jTransit - goalJ)
		+  2 * cosOmega_lon * (cosOmega - goalCos)
		+  2 * jTransit_lon * (jTransit - goalJ);

		var qlat = Math.pow(jTransit-goalJ, 2) * 2 * cosOmega_lat * (cosOmega - goalCos)
		+  2 * cosOmega_lat * (cosOmega - goalCos);

		if(isNaN(qlon) || isNaN(qlat)){
			qlon = 0;
			qlat = lat/45;
		}
		//~ console.log(qlon + " " + qlat + "\n");
		lon -= step*qlon;
		lat -= step*qlat/100;
		
		//~ console.log(lon + " " + lat + " " + qlon + " " + qlat + " " + i);
		
		i += 1;
		if(i%100 == 0)
			if(step > 10)
				step /= 2;
			else
				break;

		//~ //Adjust for out of bounds longitudes/latitudes
		//~ if(lon > 180)
			//~ lon = 180;
		//~ else if (lon < -180)
			//~ lon = -180;
		//~ if(lat > 90)
			//~ lat = 90;
		//~ else if(lat < -90)
			//~ lat = -90;

	}

	console.log(i + ": " + lon + " " + lat + " " + qlon + " " + qlat);
	//~ console.log(lon + " " + lat + "\n");

	//Adjust for out of bounds longitudes/latitudes
	if(lon > 180)
		lon -= 360;
	else if (lon < -180)
		lon += 360;
	if(lat > 90)
		lat -= 180;
	else if(lat < -90)
		lat += 180;

	return {'lon':lon, 'lat':lat, 'i':i};
}

/**
 * @param {number} j - A Julian day
 * @return {Date} The equivalent Date object
 */
function jtog(j){
	return new Date(MS_PER_DAY*(j - J_UNIX_EPOCH))
}

/**
 * @param {Date} g - A Date object
 * @return {number} The equivalent Julian day
 */
function gtoj(g){
	return J_UNIX_EPOCH + g / MS_PER_DAY;
}

/**
 * @param {Date} g - A Date object
 * @return {number} The equivalent Julian day, ignoring everything but year, month, and day.
 */
function floorgtoj(g){
	return J_UNIX_EPOCH + Math.floor(floordate(g) / MS_PER_DAY);
}

/**
 * @param {Date} g - A Date object
 * @return {Date} Date object with only the year, month, and day from g.
 */
function floordate(g){
	return new Date(g.getFullYear(), g.getMonth(), g.getDate());
}
