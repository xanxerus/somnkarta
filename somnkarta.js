var div = null;

function chartThings(){
	var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
	
	//Load library and data file
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(function(){
		$(document).ready(function() { new google.visualization.Query(URL + encodeURIComponent(''))
			.send(chartThings2)});
	});
}

function chartThings2(response){
	div = document.getElementById("test-div");
	var data = response.getDataTable();
	var buffer = "<table>";
	for(var row = 0; row < 100; row++){
		buffer += "<tr>";
		if(data.getValue(row, 1) && data.getValue(row, 2) && data.getValue(row, 5)){
			//~ for(var col = 0; col < 3; col++){
				//~ buffer += "<td>" + data.getValue(row, col) + "</td>";
			//~ }
			var sleep = new Date(MS_PER_DAY + (data.getValue(row, 0).valueOf() + (data.getValue(row, 1) < .5 ? MS_PER_DAY*data.getValue(row, 1) : MS_PER_DAY*(data.getValue(row, 1) - 1))));
			var wake = new Date(data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 2)*MS_PER_DAY));
			
			buffer += "<td>" + sleep + "</td>";
			buffer += "<td>" + wake + "</td>";
			
			//~ difftest(data.getValue(row, 0), new Date(sleep), wake);
			var g = gradient_descent(data.getValue(row, 0), new Date(sleep), wake, false);
			
			buffer += "<td>" + g.l + "</td>";
			buffer += "<td>" + g.phi + "</td>";
			buffer += "<td>" + g.s + "</td>";
			buffer += "<td>" + g.r + "</td>";
			buffer += "<td>" + g.i + "</td>";
			buffer += "</tr>";
		}
	}
	buffer += "</table>";
	
	div.innerHTML += buffer;
}

function showThings(){
	div = document.getElementById("test-div");
	var rise = new Date(2016, 11, 19, 7, 26);
	var set = new Date(2016, 11, 19, 17, 23);
	difftest(floordate(rise), set, rise);
	gradient_descent(floordate(rise), set, rise, true);
}

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

function scale(v, max, min){
	if(max == min)
		return v / Math.abs(v)
	return Math.round(255 * (Math.abs(v)-Math.abs(min)) / (Math.abs(max)-Math.abs(min)))
}

function difftest(n, s, r){
	initiate(n, s, r);
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

	div.innerHTML += buffer;
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

function gradient_descent(n, s, r, verbose=false){
	initiate(n, s, r);
	var l = 0
	var phi = 0;
	var buffer = "<table><tr><td width=\"5%\">i</td><td width=\"15%\">Longitude</td><td width=\"15%\">Latitude</td><td width=\"25%\">Sunrise</td><td width=\"25%\">Sunset</td><td width=\"15%\">Q</td></tr>";
	var v = Q(l, phi);
	var i = 0;

	while(v > 1.0001){
		if(verbose)
			buffer += "<tr><td>" + i + "</td><td>" + l + "</td><td>" + phi  + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr>";
		l -= 5000*Q_l(l, phi);
		phi -= 5000*Q_phi(l, phi);
		v = Q(l, phi);
		i += 1;
	}

	if(verbose){
		buffer += "<tr><td>" + i + "</td><td>" + l + "</td><td>" + phi + "</td><td>" + jtog(R(l, phi))  + "</td><td>" +  jtog(S(l, phi))  + "</td><td>" +  Q(l, phi) + "</td></tr></table>";
		div.innerHTML += buffer;
	}

	return {'l':l, 'phi':phi, 's':jtog(S(l, phi)), 'r':jtog(R(l, phi)), 'i':i};
}


