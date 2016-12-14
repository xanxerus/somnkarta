
var EPOCH = new Date(2000, 1, 1, 12);
var MS_PER_DAY = 86400000;

function riseset(latitude, longitude, date){
	var n = Math.floor((date-EPOCH) / 86400000);
	var J = n - longitude/360;
	var M = (357.5291 + 0.98560028*J) % 360;
	var M_radians = M / 180 * Math.PI;
	var C = 1.9148*Math.sin(M_radians) + 0.0200*Math.sin(2*M_radians) + 0.0003*Math.sin(3*M_radians);
	var L = (M+C+180+102.9372)%360;
	var J_transit = 2451545.5 + J + 0.0053*Math.sin(M_radians) - 0.0069*Math.sin(2*L);
	var sind = Math.sin(L/180*Math.PI)*Math.sin(23.44/180*Math.PI);
	var cosw = ( Math.sin(-0.83/180*Math.PI) - Math.sin(latitude/180*Math.PI)*sind ) / (Math.cos(latitude/180*Math.PI)*Math.cos(Math.asin(sind)));
	var w = Math.acos(cosw)*180/Math.PI;
	
	return {'set':EPOCH + J_transit + w/360, 'rise':J_transit - w/360};
}
