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
		// Default attributes can be set for all links
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
	plots: {
		'paris': {
			latitude: 48.86,
			longitude: 2.3444,
			tooltip: {content: "Paris<br />Population: 500000000"}
		},
		'newyork': {
			latitude: 40.667,
			longitude: -73.833,
			tooltip: {content: "New york<br />Population: 200001"}
		},
		'sanfrancisco': {
			latitude: 37.792032,
			longitude: -122.394613,
			tooltip: {content: "San Francisco"}
		},
		'brasilia': {
			latitude: -15.781682,
			longitude: -47.924195,
			tooltip: {content: "Brasilia<br />Population: 200000001"}
		},
		'roma': {
			latitude: 41.827637,
			longitude: 12.462732,
			tooltip: {content: "Roma"}
		},
		'miami': {
			latitude: 25.789125,
			longitude: -80.205674,
			tooltip: {content: "Miami"}
		},

		// Size=0 in order to make plots invisible
		'tokyo': {
			latitude: 35.687418,
			longitude: 139.692306,
			size: 0,
			text: {content: 'Tokyo'}
		},
		'sydney': {
			latitude: -33.917,
			longitude: 151.167,
			size: 0,
			text: {content: 'Sydney'}
		},
		'plot1': {
			latitude: 22.906561,
			longitude: 86.840170,
			size: 0,
			text: {content: 'Plot1', position: 'left', margin: 5}
		},
		'plot2': {
			latitude: -0.390553,
			longitude: 115.586762,
			size: 0,
			text: {content: 'Plot2'}
		},
		'plot3': {
			latitude: 44.065626,
			longitude: 94.576079,
			size: 0,
			text: {content: 'Plot3'}
		}
	},
	// Links allow you to connect plots between them
	links: {
		'link1': {
			factor: -0.3
			// The source and the destination of the link can be set with a latitude and a longitude or a x and a y ...
			, between: [{latitude: 24.708785, longitude: -5.402427}, {x: 560, y: 280}]
			, attrs: {
				"stroke-width": 2
			}
			, tooltip: {content: "Link"}
		}
		, 'parisnewyork': {
			// ... Or with IDs of plotted points
			factor: -0.3
			, between: ['paris', 'newyork']
			, attrs: {
				"stroke-width": 2
			}
			, tooltip: {content: "Paris - New-York"}
		}
		, 'parissanfrancisco': {
			// The curve can be inverted by setting a negative factor
			factor: -0.5
			, between: ['paris', 'sanfrancisco']
			, attrs: {
				"stroke-width": 4
			}
			, tooltip: {content: "Paris - San - Francisco"}
		}
		, 'parisbrasilia': {
			factor: -0.8
			, between: ['paris', 'brasilia']
			, attrs: {
				"stroke-width": 1
			}
			, tooltip: {content: "Paris - Brasilia"}
		}
		, 'romamiami': {
			factor: 0.2
			, between: ['roma', 'miami']
			, attrs: {
				"stroke-width": 4
			}
			, tooltip: {content: "Roma - Miami"}
		}
		, 'sydneyplot1': {
			factor: -0.2
			, between: ['sydney', 'plot1']
			, attrs: {
				stroke: "#a4e100",
				"stroke-width": 3,
				"stroke-linecap": "round",
				opacity: 0.6
			}
			, tooltip: {content: "Sydney - Plot1"}
		}
		, 'sydneyplot2': {
			factor: -0.1
			, between: ['sydney', 'plot2']
			, attrs: {
				stroke: "#a4e100",
				"stroke-width": 8,
				"stroke-linecap": "round",
				opacity: 0.6
			}
			, tooltip: {content: "Sydney - Plot2"}
		}
		, 'sydneyplot3': {
			factor: 0.2
			, between: ['sydney', 'plot3']
			, attrs: {
				stroke: "#a4e100",
				"stroke-width": 4,
				"stroke-linecap": "round",
				opacity: 0.6
			}
			, tooltip: {content: "Sydney - Plot3"}
		}
		, 'sydneytokyo': {
			factor: 0.2
			, between: ['sydney', 'tokyo']
			, attrs: {
				stroke: "#a4e100",
				"stroke-width": 6,
				"stroke-linecap": "round",
				opacity: 0.6
			}
			, tooltip: {content: "Sydney - Plot2"}
		}
	}
});
}



/*
 $('#refresh').on('click', function () {

                // Update some plots and areas attributes ...
                var updatedOptions = {'areas': {}, 'plots': {}};
                updatedOptions.areas["department-56"] = {
                    tooltip: {
                        content: "Morbihan (56) (2)"
                    },
                    attrs: {
                        fill: "#0088db"
                    },
                    text: {content: "56 (2)"}
                };
                updatedOptions.plots["rennes"] = {
                    tooltip: {
                        content: "Rennes (2)"
                    },
                    attrs: {
                        fill: "#f38a03"
                    }
                    , text: {position: "top"}
                    , size: 5
                };

                // add some new plots ...
                var newPlots = {
                    "Limoge": {
                        latitude: 45.834444,
                        longitude: 1.261667,
                        text: {content: "Limoge"},
                        tooltip: {content: "Limoge"}
                    }
                    , "Dijon": {
                        size: 60,
                        latitude: 47.323056,
                        longitude: 5.041944,
                        text: {
                            content: "Dijon",
                            position: "left",
                            margin: 5
                        }
                    }
                }

                // and delete some others ...
                var deletedPlots = ["paris", "lyon"];

                $(".mapcontainer").trigger('update', [{
                    mapOptions: updatedOptions, 
                    newPlots: newPlots, 
                    deletePlotKeys: deletedPlots,
                    animDuration: 1000
                }]);
            });
        });

 */
