var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var QUERY = "/gvis/gid=0&headers=1&tq=" + encodeURIComponent('select A,B,C,E,D where (F = TRUE and E is not null)');
var DATA = null;

function setData(data){
	DATA = data;
}

function gogogo(data){
	setData(data);
	$( "#slider-range" ).slider({
		range: true,
		min: 0,
		max: data.getNumberOfRows()-1,
		values: [ 75, 360 ],
		slide: function( event, ui ) {
			$( "#amount" ).val( DATA.getValue(ui.values[0],0) + " to " + DATA.getValue(ui.values[1],0) );
		}
	});
	
	$( "#amount" ).val(DATA.getValue($("#slider-range").slider("values", 0),0) + " to " + DATA.getValue($( "#slider-range" ).slider( "values", 1 ),0));
}

function kittymowr(){
	document.getElementById("moo").innerHTML = DATA.getValue($("#slider-range").slider("values", 0),3) + "<br>" + DATA.getValue($("#slider-range").slider("values", 1), 3);
}
