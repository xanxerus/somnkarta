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
				intervalID = setInterval(updateMap, INTERVAL_DELAY);
			} )});
	});

	

	//~ $('#refresh').on('click', updateMap);
}

function updateMap(){
	while(row < data.getNumberOfRows() && !(data.getValue(row, 1) && data.getValue(row, 2) && data.getValue(row, 5)))
	//~ while(row < 18 && !(data.getValue(row, 1) && data.getValue(row, 2) && data.getValue(row, 5)))
		row++;

	if(row >= data.getNumberOfRows()){
	//~ if(row >= 18){
		clearInterval(intervalID);
	}

	var sleep = new Date(MS_PER_DAY + (data.getValue(row, 0).valueOf() + (data.getValue(row, 1) < .5 ? MS_PER_DAY*data.getValue(row, 1) : MS_PER_DAY*(data.getValue(row, 1) - 1))));
	var wake = new Date(data.getValue(row, 0).valueOf() + Math.round(data.getValue(row, 2)*MS_PER_DAY));
	var g = gradient_descent(data.getValue(row, 0), new Date(sleep), wake, false);
	var name = Number(row).toString();
	
	document.getElementById("test-div").innerHTML = dateOnly(data.getValue(row, 0));
	
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
	
	row++;//=30;
}

/*
		// Update some plots and areas attributes ...
		var updatedOptions = {'areas': {}, 'plots': {}};

			//~ mapOptions: updatedOptions, 



		//~ updatedOptions.areas["department-56"] = {
			//~ tooltip: {
				//~ content: "Morbihan (56) (2)"
			//~ },
			//~ attrs: {
				//~ fill: "#0088db"
			//~ },
			//~ text: {content: "56 (2)"}
		//~ };
		//~ updatedOptions.plots["rennes"] = {
			//~ tooltip: {
				//~ content: "Rennes (2)"
			//~ },
			//~ attrs: {
				//~ fill: "#f38a03"
			//~ }
			//~ , text: {position: "top"}
			//~ , size: 5
		//~ };


			//~ 'paris': {
				//~ latitude: 48.86,
				//~ longitude: 2.3444,
				//~ tooltip: {content: "Paris<br />Population: 500000000"}
			//~ },
			//~ 'newyork': {
				//~ latitude: 40.667,
				//~ longitude: -73.833,
				//~ tooltip: {content: "New york<br />Population: 200001"}
			//~ },
			//~ 'sanfrancisco': {
				//~ latitude: 37.792032,
				//~ longitude: -122.394613,
				//~ tooltip: {content: "San Francisco"}
			//~ },
			//~ 'brasilia': {
				//~ latitude: -15.781682,
				//~ longitude: -47.924195,
				//~ tooltip: {content: "Brasilia<br />Population: 200000001"}
			//~ },
			//~ 'roma': {
				//~ latitude: 41.827637,
				//~ longitude: 12.462732,
				//~ tooltip: {content: "Roma"}
			//~ },
			//~ 'miami': {
				//~ latitude: 25.789125,
				//~ longitude: -80.205674,
				//~ tooltip: {content: "Miami"}
			//~ },

			//~ // Size=0 in order to make plots invisible
			//~ 'tokyo': {
				//~ latitude: 35.687418,
				//~ longitude: 139.692306,
				//~ size: 0,
				//~ text: {content: 'Tokyo'}
			//~ },
			//~ 'sydney': {
				//~ latitude: -33.917,
				//~ longitude: 151.167,
				//~ size: 0,
				//~ text: {content: 'Sydney'}
			//~ },
			//~ 'plot1': {
				//~ latitude: 22.906561,
				//~ longitude: 86.840170,
				//~ size: 0,
				//~ text: {content: 'Plot1', position: 'left', margin: 5}
			//~ },
			//~ 'plot2': {
				//~ latitude: -0.390553,
				//~ longitude: 115.586762,
				//~ size: 0,
				//~ text: {content: 'Plot2'}
			//~ },
			//~ 'plot3': {
				//~ latitude: 44.065626,
				//~ longitude: 94.576079,
				//~ size: 0,
				//~ text: {content: 'Plot3'}
			//~ }

			//~ 'link1': {
				//~ factor: -0.3
				//~ // The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
				//~ , between: [{latitude: 24.708785, longitude: -5.402427}, {x: 560, y: 280}]
				//~ , attrs: {
					//~ "stroke-width": 2
				//~ }
				//~ , tooltip: {content: "Link"}
			//~ }
			//~ , 'parisnewyork': {
				//~ // ... Or with IDs of plotted points
				//~ factor: -0.3
				//~ , between: ['paris', 'newyork']
				//~ , attrs: {
					//~ "stroke-width": 2
				//~ }
				//~ , tooltip: {content: "Paris - New-York"}
			//~ }
			//~ , 'parissanfrancisco': {
				//~ // The curve can be inverted by setting a negative factor
				//~ factor: -0.5
				//~ , between: ['paris', 'sanfrancisco']
				//~ , attrs: {
					//~ "stroke-width": 4
				//~ }
				//~ , tooltip: {content: "Paris - San - Francisco"}
			//~ }
			//~ , 'parisbrasilia': {
				//~ factor: -0.8
				//~ , between: ['paris', 'brasilia']
				//~ , attrs: {
					//~ "stroke-width": 1
				//~ }
				//~ , tooltip: {content: "Paris - Brasilia"}
			//~ }
			//~ , 'romamiami': {
				//~ factor: 0.2
				//~ , between: ['roma', 'miami']
				//~ , attrs: {
					//~ "stroke-width": 4
				//~ }
				//~ , tooltip: {content: "Roma - Miami"}
			//~ }
			//~ , 'sydneyplot1': {
				//~ factor: -0.2
				//~ , between: ['sydney', 'plot1']
				//~ , attrs: {
					//~ stroke: "#a4e100",
					//~ "stroke-width": 3,
					//~ "stroke-linecap": "round",
					//~ opacity: 0.6
				//~ }
				//~ , tooltip: {content: "Sydney - Plot1"}
			//~ }
			//~ , 'sydneyplot2': {
				//~ factor: -0.1
				//~ , between: ['sydney', 'plot2']
				//~ , attrs: {
					//~ stroke: "#a4e100",
					//~ "stroke-width": 8,
					//~ "stroke-linecap": "round",
					//~ opacity: 0.6
				//~ }
				//~ , tooltip: {content: "Sydney - Plot2"}
			//~ }
			//~ , 'sydneyplot3': {
				//~ factor: 0.2
				//~ , between: ['sydney', 'plot3']
				//~ , attrs: {
					//~ stroke: "#a4e100",
					//~ "stroke-width": 4,
					//~ "stroke-linecap": "round",
					//~ opacity: 0.6
				//~ }
				//~ , tooltip: {content: "Sydney - Plot3"}
			//~ }
			//~ , 'sydneytokyo': {
				//~ factor: 0.2
				//~ , between: ['sydney', 'tokyo']
				//~ , attrs: {
					//~ stroke: "#a4e100",
					//~ "stroke-width": 6,
					//~ "stroke-linecap": "round",
					//~ opacity: 0.6
				//~ }
				//~ , tooltip: {content: "Sydney - Plot2"}
			//~ }
 */
