/**
 * Convert a number into a color based on its maximum and minimum.
 * Blue if positive, Red if negative, Green if NaN or max == min.
 * The brighter the lesser the number's magnitude.
 *
 * @param {number} number - The number to convert
 * @param {number} max - The maximum value of that number
 * @param {number} min - The minimum value of that number
 * @param {boolean} greyscale - If true, colors will be greyscaled.
 * @return {String} A hex color corresponding to where the number is in its possible range.
 */
function f2d(number, max=1, min=0, greyscale=false){
	if(isNaN(number) || max==min)
		return "#00FF00";

	var d = Math.abs(Math.round(255 - scale(number, max, min)));
	var h = Math.abs(d).toString(16);
	if(h.length < 2)
		h = '0' + h;

	if(greyscale)
		return "#" + h + h + h;
	else if(number < 0)
		return "#" + h + "0000";
	else if(number>0)
		return "#" + "0000" + h;
	else
		return "#FFFFFF";
}

/**
 * Convert a number into a percentage of its maximum multiplied by 255.
 *
 * @param {number} number - The number to convert
 * @param {number} max - The maximum value of that number
 * @param {number} min - The minimum value of that number
 * @return {number} A number from 0 to 255.
 */
function scale(v, max, min){
	if(max == min)
		return v / Math.abs(v)
	return Math.round(255 * (Math.abs(v)-Math.abs(min)) / (Math.abs(max)-Math.abs(min)))
}

/**
 * Find the max and min values of a function across the Earth
 *
 * @param {function} f - The function to use
 * @return {object} An object with 'max' and 'min' attributes
 */
function getMq(f){
	var max = NaN;
	var min = NaN;
	for(var phi = 85; phi >= -85; phi-=5){
		for(var l = -180; l <= 180; l+=5){
			var v = f(l, phi);
			if(isNaN(max) || Math.abs(v) > max)
				max = Math.abs(v);
			if(isNaN(min) || Math.abs(v) < min)
				min = Math.abs(v);
		}
	}
	return {'max':max, 'min':min};
}

/**
 * Display the error and gradient of error of various points on the Earth.
 *
 * @param {Date} s - The Date of sunset
 * @param {Date} r - The Date of sunrise
 * @param {String} divName - The name of the div to write to
 */
function diffTest(s, r, divName){
	initialize(s, r);
	var buffer = "";
	for(var arr = [Q, Q_l, Q_phi], f = 0; f < 3; f++){
		var m = getMq(arr[f]);
		buffer += m.max + " " + m.min + "<br><table>";
		var max = 0;
		for(var phi = 85; phi >= -85; phi-=5){
			buffer += "<tr>";
			for(var l = -180; l <= 180; l+=5){
				var v = arr[f](l, phi);
					buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + scale(v, m.max, m.min) +  "</td>";
				//~ buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + v +  "</td>";
			}
			buffer += "</tr>";
		}
		buffer += "</table>";
	}
	document.getElementById(divName).innerHTML += buffer;
}
