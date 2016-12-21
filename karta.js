var URL = 'https://docs.google.com/spreadsheets/d/1-5iMHMlFECK3dpUeOvYkbnPGG9cF_Q6JvmKJT3hG8Vs/edit?usp=sharing';
var row = 0;
var data = null;
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var INTERVAL_DELAY = 300;
var intervalID = -1;

function dateOnly(date){
	return dayNames[date.getDay()] + " " + monthNames[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
}

function mapThings(){
	$(".mapcontainer").mapael({
		map: {
			name: "world_countries",
			defaultArea: {
				attrs: {
					fill: "#f4f4e8"
					, stroke: "#ced8d0"
				}
			}
			, defaultLink: {
				factor: 0.4
				, attrsHover: {
					stroke: "#a4e100"
				}
			}
			, defaultPlot: {
				text: {
					attrs: {
						fill: "#000"
					},
					attrsHover: {
						fill: "#000"
					}
				}
			}
		},
	});
	
	//Load library and data file
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(function(){
		$(document).ready(function() { new google.visualization.Query(URL + encodeURIComponent(''))
			.send(function(response) {  
				data = response.getDataTable(); 
				//~ intervalID = setInterval(updateMap, INTERVAL_DELAY);
			} )});
	});
}

function updateMap(){
	//~ alert("kitty");
	while(row < data.getNumberOfRows() && !(data.getValue(row, 1) && data.getValue(row, 2) && data.getValue(row, 5)))
		row++;

	if(row >= data.getNumberOfRows()){
		clearInterval(intervalID);
		return;
	}

	var wake = new Date(data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 2)*MS_PER_DAY));
	var sleep = new Date(MS_PER_DAY + (data.getValue(row, 0).valueOf() + (data.getValue(row, 1) < .5 ? MS_PER_DAY*data.getValue(row, 1) : MS_PER_DAY*(data.getValue(row, 1) - 1))));

	//~ var sleep = data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 1)*MS_PER_DAY);
	//~ if(data.getValue(row, 1) < data.getValue(row, 2))
		//~ sleep += MS_PER_DAY;
	//~ sleep = new Date(sleep);

	var g = inverse_riseset(sleep, wake);
	if(g != null){
		var name = Number(row).toString();
		document.getElementById("test-div").innerHTML = row + ": " + dateOnly(data.getValue(row, 0)) + " " + g.l + " " + g.phi + " " + sleep + " " + wake;
		document.getElementById("test-div").innerHTML += "<br>";
		for(var col = 0; col < 6; col++)
			document.getElementById("test-div").innerHTML += data.getValue(row, col) + " ";
		
		var newPlots = {};
		newPlots[name] = {
				longitude: g.l,
				latitude: g.phi,
				//~ text: {content: dateOnly(data.getValue(row, 0))},
				tooltip: {content: sleep + " " + wake + " " + g.l + " " + g.phi},
				size : 5
			};
		var deletedPlots = row>10 ? [Number(row-10).toString()] : [];
		$(".mapcontainer").trigger('update', [{
			newPlots: newPlots, 
			deletePlotKeys: deletedPlots,
			animDuration: 300
		}]);
	}
	else{
		document.getElementById("test-div").innerHTML = "Unknowable value";
	}
	row++;
}
