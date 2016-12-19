var date = new Date(); //Date.UTC(2016, 11, 14));
var duration = 8*60*MS_PER_MINUTE;
//~ var latitude = 32.989924;
//~ var longitude = -96.751620;
var latitude = 0;
var longitude = 0;
var div = null;

function f2c(number, max=1, min=0){
	if(isNaN(number))
		return "#00FF00";

	var d = max != min ? Math.abs(Math.round(255 * (1-(Math.abs(number)-Math.abs(min)) / (Math.abs(max)-Math.abs(min))))) : 255;
	var h = Math.abs(d) < 256 ? Math.abs(d).toString(16) : 'FF';
    if(h.length < 2)
		h = '0' + h;

	return "#" + h+h+h;
}

function f2d(number, max=1, min=0){
	if(isNaN(number))
		return "#00FF00";

	var d = max != min ? Math.abs(Math.round(255 * (1-(Math.abs(number)-Math.abs(min)) / (Math.abs(max)-Math.abs(min))))) : 255;
	var h = Math.abs(d) < 256 ? Math.abs(d).toString(16) : 'FF';
    if(h.length < 2)
		h = '0' + h;

	if(number < 0){
		return "#" + h + "0000";
	}
	else if(number>0){
		return "#" + "0000" + h;
	}
	else
		return "#FFFFFF";
}

function showThings(){
	div = document.getElementById("test-div");
	var m = riseset(date, longitude, latitude);
	div.innerHTML += "Longitude: " + longitude + "<br>";
	div.innerHTML += "Latitude: " + latitude + "<br>";
	div.innerHTML += "Rise: " + m.rise + "<br>";
	div.innerHTML += "Set: " + m.set + "<br>";
	difftest(date, m.set, m.rise);
	//~ qtest(date, m.set, m.rise);
	//~ gradient_descent(date, m.set, m.rise);
}

function difftest(n, s, r){
	setN(n);
	setS(s);
	setR(r);

	var buffer = "";
	var m = getMq(Q);

	buffer += m.max + " " + m.min + "<br><table>";
	for(var phi = 85; phi >= -85; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			var v = Q(l, phi);;
			if(m.max == m.min)
				buffer += "<td>" + v/Math.abs(v) + "</td>";
			else
				buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";
				//~ buffer += "<td bgcolor=\"" + f2c(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";

			//~ buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + v +  "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";

	m = getMq(Q_l);

	buffer += m.max + " " + m.min + "<br><table>";
	var max = 0;
	for(var phi = 85; phi >= -85; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			var v = Q_l(l, phi);
			if(m.max == m.min)
				buffer += "<td>" + v/Math.abs(v) + "</td>";
			else
				buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";
				//~ buffer += "<td bgcolor=\"" + f2c(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";

			//~ buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + v +  "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";

	m = getMq(Q_phi);

	buffer += m.max + " " + m.min + "<br><table>";
	var max = 0;
	for(var phi = 85; phi >= -85; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			var v = Q_phi(l, phi);
			if(m.max == m.min)
				buffer += "<td>" + v/Math.abs(v) + "</td>";
			else
				buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";
				//~ buffer += "<td bgcolor=\"" + f2c(v, m.max, m.min) + "\">" + Math.round(100 * (Math.abs(v)-Math.abs(m.min)) / (Math.abs(m.max)-Math.abs(m.min))) +  "</td>";

			//~ buffer += "<td bgcolor=\"" + f2d(v, m.max, m.min) + "\">" + v +  "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";

	div.innerHTML += buffer;
}

function getMs(f){
	var max = 0;
	var min = -1;
	for(var phi = 85; phi >= -85; phi-=5){
		for(var l = -180; l <= 180; l+=5){
			var v = f(l, phi);
			if(Math.abs(v) > max)
				max = Math.abs(v);
			if(min<0 || Math.abs(v) < min)
				min = Math.abs(v);
		}
	}
	return {'max':max, 'min':min};
}

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

function qtest(n, s, r){
	setN(n);
	setS(s);
	setR(r);
	var m = getMq(Q);
	div.innerHTML += jtog(getS());
	var buffer = "<table>"
	for(var phi = 90; phi >= -90; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			var v = Q(l, phi);
			//~ buffer += "<td bgcolor=\"" + f2c(v-1, .6) + "\">" + Math.round((v-1)*1000) +  "</td>";
			buffer += "<td bgcolor=\"" + f2c(v-1, m.max, m.min) + "\">" + v +  "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";
	div.innerHTML += buffer;
}

function gradient_descent(n, s, r){
	setN(n);
	setS(s);
	setR(r);
	var l = 0
	var phi = 0;
	var buffer = "<table><tr><td width=\"15%\">Longitude</td><td width=\"15%\">Latitude</td><td width=\"25%\">Sunrise</td><td width=\"25%\">Sunset</td><td width=\"15%\">Q</td></tr>";
	
	while(Q(l, phi) > 1.15){
		buffer += "<tr><td>" + l + "</td><td>" + phi  + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr>";
		l = (l + Q_l(l, phi)) % 180;
		phi = (phi + Q_phi(l, phi));// % 90;
	}
	buffer += "<tr><td>" + l + "</td><td>" + phi  + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr></table>";
	
	div.innerHTML += buffer;
}


