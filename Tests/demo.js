function showThings(){
	var m = riseset(Date(), -60, 30);
	difftest(m.set, m.rise, divName="diffTest_div");
	inverse_riseset(m.set, m.rise, divName="inverse_riseset_div");
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

function diffTest(s, r){
	initiate(s, r);
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
