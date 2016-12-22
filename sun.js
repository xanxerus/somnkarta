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
var s = -1;
var r = -1;

//Constants used in calculation. See wikipedia page for details
var c1 = 357.5291;
var c2 = 0.98560028;
var c3 = 1.9148;
var c4 = 0.0200;
var c5 = 0.0003;
var c6 = 282.9372;
var c7 = 2451545.5;
var c8 = 0.0053;
var c9 = 0.0069;
var c10 = Math.sin(23.44 * Math.PI / 180);
var c11 = Math.sin(-0.83 * Math.PI / 180);

/**
 * Calculates sunrise and sunset for a day and point on Earth
 * @param {Date} date - The day to calculate sunrise for
 * @param {number} l - The longitude of the point on Earth
 * @param {number} phi - The latitude of the point on Earth
 * @return {Object} An object with 'set' and 'rise' attributes
 */
function riseset(date, l, phi){
	setN(date);
	var j = J(l);
	var q = W(l, phi)/(2*Math.PI);
	return {'set':jtog(j+q), 'rise':jtog(j-q)};
}

/**
 * Calculates a point on Earth with a given sunrise and sunset using Gradient Descent.
 * @param {Date} s - Time of sunset
 * @param {Date} r - Time of sunrise
 * @param {number} error - The maximum desired error. 1.0001 by default, about ten minutes.
 * @return An object with attributes 'l' and 'phi' and also 'i' the number of steps taken.
 */
function inverse_riseset(s, r, error = 1.0001){
	initialize(s, r);
	var i = 0, l = 0, phi = 0, step = 5000;

	//Gradient Descent
	while(Q(l, phi) > error){
		var ql = Q_l(l, phi), qphi = Q_phi(l, phi);
		
		if(isNaN(ql) || isNaN(qphi)){
			ql = 0;
			qphi = phi/45;
		}

		l -= step*ql;
		phi -= step*qphi;
		i += 1;
		if(i%100 == 0)
			if(step > 10)
				step /= 2;
			else
				break;
	}

	//Adjust for out of bounds longitudes/latitudes
	if(l > 180)
		l -= 360;
	else if (l < -180)
		l += 360;
	if(phi > 90)
		phi -= 180;
	else if(phi < -90)
		phi += 180;

	return {'l':l, 'phi':phi, 'i':i};
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

/**
 * Initializes global variables used in most other functions.
 * @param {Date} sunset - The Date for the sunrise
 * @param {Date} sunrise - The Date for the sunset
 */
function initialize(sunset, sunrise){
	setN(sunrise);
	s = gtoj(sunset);
	r = gtoj(sunrise);
}

/**
 * Initializes the global variable n, the number of days since Noon January 1 2000
 * @param {Date} given - The given Date used to set n
 */
function setN(given){
	n = floorgtoj(given) - 2451545.0008;
}

/**
 * @return {Number} The global variable n
 */
function getN(){
	return n + 2451545.0008;
}

/**
 * @return {Number} The global variable s
 */
function getS(){
	return s;
}

/**
 * @return {Number} The global variable r
 */
function getR(){
	return r;
}

/**
 * @param {Number} l - Longitude
 * @return {Number} The mean solar Noon (converted to Radians)
 */
function M(l){
	return (c1 + c2*(n - l/360)) % 360 * Math.PI / 180;
}

/**
 * @param {Number} l - Longitude
 * @return {Number} The Equation of the center
 */
function C(l){
	return c3*Math.sin(M(l)) + c4*Math.sin(2*M(l)) + c5*Math.sin(3*M(l));
}

/**
 * @param {Number} l - Longitude
 * @return {Number} The ecliptic longitude (converted to Radians)
 */
function L(l){
	return (M(l) + C(l) + c6) % 360 * Math.PI / 180;
}

/**
 * @param {Number} l - Longitude
 * @return {Number} The solar transit (a Julian day)
 */
function J(l){
	return c7 + n - l/360 + c8*Math.sin(M(l)) - c9*Math.sin(2*L(l));
}

/**
 * @param {Number} l - Longitude
 * @return {Number} The solar declination (in Radians)
 */
function Delta(l){
	return Math.asin(U(l));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The sine of Delta.
 */
function U(l){
	return c10 * Math.sin(L(l));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The hour angle (in Radians) from the observer's zenith.
 */
function W(l, phi){
	return Math.acos(V(l, phi));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The cosine of W. 
 */
function V(l, phi){
	return (c11 - Math.sin(phi*Math.PI/180)*Math.sin(Delta(l))) / (Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The date and time of sunset (a Julian day)
 */
function S(l, phi){
	return J(l) + W(l, phi)/(2*Math.PI);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The date and time of sunrise (a Julian day)
 */
function R(l, phi){
	return J(l) - W(l, phi)/(2*Math.PI);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The error of a specific point's sunrise and sunset. 
 */
function Q(l, phi){
	return (Math.pow(S(l, phi)-s, 2)+1) * (Math.pow(R(l, phi)-r, 2)+1);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of Q with respect to l. 
 */
function Q_l(l, phi){
	return Math.pow(S(l, phi)-s, 2) * 2 * R_l(l, phi) * (R(l, phi) - r)
		+  Math.pow(R(l, phi)-r, 2) * 2 * S_l(l, phi) * (S(l, phi) - s)
		+  2 * S_l(l, phi) * (S(l, phi) - s)
		+  2 * R_l(l, phi) * (R(l, phi) - r);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of Q with respect to phi. 
 */
function Q_phi(l, phi){
	return Math.pow(S(l, phi)-s, 2) * 2 * R_phi(l, phi) * (R(l, phi) - r)
		+  Math.pow(R(l, phi)-r, 2) * 2 * S_phi(l, phi) * (S(l, phi) - s)
		+  2 * S_phi(l, phi) * (S(l, phi) - s)
		+  2 * R_phi(l, phi) * (R(l, phi) - r);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of M with respect to l. 
 */
function M_l(l){
	return -c2/360* Math.PI / 180;
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of C with respect to l. 
 */
function C_l(l){
	return c3*M_l(l)*Math.cos(M(l)) + c4*2*M_l(l)*Math.cos(2*M(l)) + c5*3*M_l(l)*Math.cos(3*M(l));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of L with respect to l. 
 */
function L_l(l){
	return M_l(l) + (C_l(l) * Math.PI / 180);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of J with respect to l. 
 */
function J_l(l){
	return -1/360 + c8*M_l(l)*Math.cos(M(l)) - c9*2*L_l(l)*Math.cos(2*L(l));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of Delta with respect to l. 
 */
function Delta_l(l){
	return U_l(l) / Math.sqrt(1 - Math.pow(U(l), 2));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of U with respect to l. 
 */
function U_l(l){
	return c1 * L_l(l) * Math.cos(L(l));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of W with respect to l. 
 */
function W_l(l, phi){
	return -V_l(l, phi) / Math.sqrt(1 - Math.pow(V(l, phi), 2));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of V with respect to l. 
 */
function V_l(l, phi){
	return Delta_l(l) * (Math.cos(phi*Math.PI/180) * Math.cos(Delta(l)) * (-Math.sin(phi*Math.PI/180)) * Math.cos(Delta(l)) 
		+  (c11-Math.sin(phi*Math.PI/180)*Math.sin(Delta(l)))*Math.cos(phi*Math.PI/180)*Math.sin(Delta(l)))
	 / Math.pow(Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)), 2);
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of S with respect to l. 
 */
function S_l(l, phi){
	return J_l(l) + W_l(l, phi) / 360;
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of R with respect to l. 
 */
function R_l(l, phi){
	return J_l(l) - W_l(l, phi) / 360;
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of S with respect to phi. 
 */
function S_phi(l, phi){
	return W_phi(l, phi) / 360;
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of R with respect to phi. 
 */
function R_phi(l, phi){
	return - W_phi(l, phi) / 360;
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of W with respect to phi. 
 */
function W_phi(l, phi){
	return - V_phi(l, phi) / Math.sqrt(1 - Math.pow(V(l, phi), 2));
}

/**
 * @param {Number} l - Longitude
 * @param {Number} phi - Latitude
 * @return {Number} The partial derivative of V with respect to phi. 
 */
function V_phi(l, phi){
	return (c11 - Math.sin(phi*Math.PI/180)*Math.sin(Delta(l))) / Math.pow(Math.cos(phi*Math.PI/180)*Math.cos(Delta(l)), 2) * Math.sin(phi*Math.PI/180) - Math.cos(phi*Math.PI/180)*Math.sin(Delta(l));
}
