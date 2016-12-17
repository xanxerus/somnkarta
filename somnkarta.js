var date = new Date(); //Date.UTC(2016, 11, 14));
var duration = 8*60*MS_PER_MINUTE;
var latitude = 32.989924;
var longitude = -96.751620;
//~ var latitude = 0;
//~ var longitude = 0;
var div = null;

function f2c( percentage ) {
    var color_part_dec = Math.abs(Math.round(255 * percentage));
    var color_part_hex = Number(color_part_dec).toString(16);
    if(color_part_hex.length < 2)
		color_part_hex = '0' + color_part_hex;
    return "#" + color_part_hex + color_part_hex + color_part_hex;
}

function showThings(){
	div = document.getElementById("test-div");
	var m = riseset(date, longitude, latitude);
	div.innerHTML += "Longitude: " + longitude + "<br>";
	div.innerHTML += "Latitude: " + latitude + "<br>";
	div.innerHTML += "Rise: " + m.rise + "<br>";
	div.innerHTML += "Set: " + m.set + "<br>";
	difftest(date, m.set, m.rise);
	//~ rstest(date, m.set, m.rise);
	//~ qtest(date, m.set, m.rise);
	//~ gradient_descent(date, m.set, m.rise);
}

function difftest(n, s, r){
	setN(n);
	setS(s);
	setR(r);
	div.innerHTML += jtog(getS());
	var buffer = "<table>"
	for(var phi = 90; phi >= -90; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			S1 = S(l, phi);
			R1 = R(l, phi);
			Q1 = Q(l, phi);
			var v = Q1; //Math.abs(getS() - S(l, phi))/1.5;
			buffer += "<td bgcolor=\"" + "white" + "\">" + (Q_phi(l, phi)<0?'v':'^') +  "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";
	div.innerHTML += buffer;
}


function rstest(n, s, r){
	setN(n);
	setS(s);
	setR(r);
	var buffer = "<table>"
	for(var phi = 90; phi >= -90; phi-=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			buffer += "<td>" + jtog(R(l, phi)).getHours() + ", " + jtog(S(l, phi)).getHours() + "</td>";
		}
		buffer += "</tr>";
	}
	buffer += "</table>";
	div.innerHTML += buffer;
}


function qtest(n, s, r){
	setN(n);
	setS(s);
	setR(r);
	var buffer = "<table>"
	for(var phi = -90; phi <= 90; phi+=5){
		buffer += "<tr>";
		for(var l = -180; l <= 180; l+=5){
			buffer += "<td>" + Q(l, phi) + "</td>";
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
	
	while(Q(l, phi) > 1){
		buffer += "<tr><td>" + l + "</td><td>" + phi  + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr>";
		l = (l + Q_l(l, phi));// % 180;
		phi = (phi + Q_phi(l, phi));// % 90;
	}
	buffer += "<tr><td>" + l + "</td><td>" + phi  + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr></table>";
	
	div.innerHTML += buffer;
}


