// JavaScript Document

var GlobalSuggestionLoaded = false;
$(document).ready(function()
{
	$("#search_bar_input").keyup(function()
	{
		GlobalSuggestionLoaded = false;
		if($('#search_bar_input').val().length > 3) LoadPlayerSuggestionsList();
		else $("#search_bar_suggestions").hide();
	});
	
	$("#main_menu_toggle").on("click", function()
	{
		$("#site").toggleClass("pushed");
	});
	
	$(".main_menu_tab").on("click", function()
	{
		LoadGeneratedRoster();
	});
});

function LoadGeneratedRoster()
{
	request = $.ajax(
	{
		url: "ajax/getBestPlayerOfEachPosition.php",
		dataType: "json"
	});
		
	request.done(function(response, textStatus, jqXHR) 
	{
		bestPlayers = HandleBestPlayerSelecting(response);
		LoadSidebarRoster(bestPlayers);
	});
	
	request.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error("The following error occured: " + textStatus, errorThrown);
	});
}

function HandleBestPlayerSelecting(sortedPlayers)
{
	var playerPosCounts = [];
	playerPosCounts['QB'] = 1;
	playerPosCounts['RB'] = 2;
	playerPosCounts['WR'] = 3;
	playerPosCounts['TE'] = 1;
	playerPosCounts['PK'] = 1;
	playerPosCounts['Def'] = 1;
	var bestPlayers = [];
	
	for(i = 0; i < sortedPlayers.length; i++)
	{
		if(sortedPlayers[i].length < 1) continue;
		for(j = 0; j < playerPosCounts[sortedPlayers[i][0]]; j++)
		{
			bestPlayers.push(sortedPlayers[i][1][j]);
		}
	}
	return bestPlayers;
}

function LoadSidebarRoster(bestPlayers)
{
	for(i = 0; i < bestPlayers.length; i++)
	{
		var html = $("#main_menu_roster").html();
		var entry = '<a href="#" class="roster_entry" data-gid="' + bestPlayers[i]['gid'] + '" data-name="' + bestPlayers[i]['name'] + '">'+bestPlayers[i]['name']+'</a>';
		$("#main_menu_roster").append(entry);
	}
}

function LoadPlayerSuggestionsList()
{
	var curSearchName = $('#search_bar_input').val();
	
	request = $.ajax(
	{
		url: "ajax/getSimilarPlayerSuggestions.php",
		type: "POST",
		data: {"search_name" : curSearchName},
		beforeSend: function()
		{
			$("#search_bar_input").css("background", "none url(../img/ajax-loader.gif) no-repeat");
		}
	});
		
	request.done(function(response, textStatus, jqXHR) 
	{
		if(!GlobalSuggestionLoaded)
		{
			$("#search_bar_suggestions").show();
			$("#search_bar_suggestions").html(response);
		}
		$("#search_bar_input").css("background", "none");
	});
	
	request.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error("The following error occured: " + textStatus, errorThrown);
	});
}

$('#main_menu_roster').on('click', 'a', function()
{
	console.log("HI");
	var name = $(this).data('name');
	var gid = $(this).data('gid');
	$("#search_bar_input").val(name);
	$("#search_bar_suggestions").hide();
	
	LoadPlayerData(gid);
	GlobalSuggestionLoaded = true;
});

$('#search_bar_suggestions').on('click', 'a', function()
{
	var name = $(this).data('name');
	var gid = $(this).data('gid');
	$("#search_bar_input").val(name);
	$("#search_bar_suggestions").hide();
	
	LoadPlayerData(gid);
	GlobalSuggestionLoaded = true;
});

function LoadPlayerData(gid)
{
	LoadPlayerProfile(gid);
	//LoadPlayerFantasyStats(gid);
	//LoadPlayerRealStats(gid);
	//LoadPlayerSchedule(gid);
}

function LoadPlayerProfile(gid)
{
	console.log("Loading Player Profile");
	request = $.ajax(
	{
		url: "ajax/getPlayerProfile.php",
		type: "POST",
		dataType: "json",
		data: {"gid" : gid}
	});
		
	request.done(function(response, textStatus, jqXHR) 
	{
		$('#player_team_helmet').html('<img id="player_team_helmet_img" src="img/'+response['team']+'.png">');
		$('#player_name').html(response['name']);
		$('#player_position').html(response['position']);
		$('#player_avg_points .player_stat_data').html(parseFloat(response['averagePoints']).toFixed(2));
		$('#player_avg_points .player_stat_data').css("color", ComputeRedToGreenRGB(100 - ((response['averagePoints'] / response['maxAvgPoints']) * 100)));
		console.log(response['maxAvgPoints']);
		
		$('#player_std_dev .player_stat_data').html(parseFloat(response['stdDevPoints']).toFixed(2));
		$('#player_std_dev .player_stat_data').css("color", ComputeRedToGreenRGB(((response['stdDevPoints'] / response['maxStdDev']) * 100)));
		
		$('#player_simple_score .player_stat_data').html(parseFloat(response['averageSimpleScore']).toFixed(2));
		$('#player_simple_score .player_stat_data').css("color", ComputeRedToGreenRGB(100 - ((response['averageSimpleScore'] / 3.5) * 100)));
		
		$('#main_profile').show();
		$('#main_profile').animate({"width": "100%", "opacity": "1.0"}, 'slow');
		
		$('#logo_container').animate({"opacity": "0.0"}, 'slow');
		
		LoadPlayerFantasyStats(gid, response["name"]);	
	});
	
	request.fail(function(jqXHR, textStatus, errorThrown)
	{
		console.error("The following error occured: " + textStatus, errorThrown);
	});
}

function LoadPlayerFantasyStats(gid, name)
{
	console.log("Loading Player Fantasy Stats");
	$('#fantasy_stats').show();
	$('#fantasy_stats').animate({"width": "100%", "opacity": "1.0"}, 'slow');

	getPlayerData(gid, name);
	
	LoadPlayerRealStats(gid);
}

function LoadPlayerRealStats(gid)
{
	console.log("Loading Player Real Stats");
	$('#real_stats').show();
	$('#real_stats').animate({"width": "100%", "opacity": "1.0"}, 'slow');
	
	LoadPlayerSchedule(gid);
}

function LoadPlayerSchedule(gid)
{
	console.log("Loading Player Schedule");
	$('#schedule').show();
	$('#schedule').animate({"width": "100%", "opacity": "1.0"}, 'slow');
}

function ComputeRedToGreenRGB(percent) 
{
    if (percent === 100) 
	{
        percent = 99
    }
    var r, g, b;

    if (percent < 50) 
	{
        // green to yellow
        r = Math.floor(255 * (percent / 50));
        g = 255;
    } 
	else 
	{
        // yellow to red
        r = 255;
        g = Math.floor(255 * ((50 - percent % 50) / 50));
    }
    b = 0;

    return "rgb(" + r + "," + g + "," + b + ")";
}
function getPlayerData(gid, name)
{
	request = $.ajax({
				url: "ajax/getPlayerWeeklyFantasyData.php",
				type: "POST",
				dataType: "json",
				data: {"gid" : gid}
			});
			
	request.done(function (response, textStatus, jqXHR) {
	data = getRecentData(response[0]);
	expected = Number(parseFloat(response[1]).toFixed(2));
	makeChart(data, name, expected);
	});
	
	request.fail(function (jqXHR, textStatus, errorThrown){
		console.error(
			"The following error occured: "+
			textStatus, errorThrown
		);
	});
}


function getRecentData(allData)
{
	var first;

	if(allData.length < 12)
		first = 0;
	else
		first = allData.length - 12;
	return allData.slice(first,allData.length);
}

function makeChart(data, name, expected)
{
	var titleString = "Points and Salary for " + name + " by Week";
	$('#fantasy_score_chart').highcharts({
		chart: {
			backgroundColor: 'transparent'
		},
		title: {
			text: titleString
		},
		xAxis: {
			type: 'category',
			title: {
				text: 'Year, Week'
			},
			gridLineColor: 'transparent'
		},
		yAxis: [{
			gridLineColor: 'transparent',
			labels: {
				enabled: false
			},
			title: {
				enabled: false
			}
		}, {
			gridLineColor: 'transparent',
			title: {
				text: "Weekly Salary",
				enabled: false
			},
			labels: {
				enabled: false
			},
			opposite: true
		}],
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				borderWidth: 0
			}
		},

		tooltip: {
			shared: false
		},
		legend: {
            layout: 'vertical',
            align: 'right',
            x: 0,
            verticalAlign: 'top',
            y: 0,
            floating: true
        },
		series: [{
			name: "Weekly Points",
			color: "rgba(0,255,0,1)",
			type: 'column',
			colorByPoint: false,
			data: getPlayerPointsSeries(data, expected),
			dataLabels: {
				enabled: true,
				format: '{point.y:.2f}'
				},
			tooltip: {
				headerFormat: '{series.name}: <br>',
				pointFormat: '{point.name}: {point.y}'
			}
		}, {
			name: "Weekly Salary",
			type: 'spline',
			color: "rgba(0,0,0,1)",
			data: getPlayerSalarySeries(data),
			dataLabels: {
				enabled: true,
				format: '${point.y}'
			},
			tooltip: {
				headerFormat: '{series.name}: <br>',
				pointFormat: '${point.y}'
			},
			yAxis: 1
		}]

	});
}

function getPlayerPointsSeries(data, expected)
{
	var maxPoints = getMaxPoints(data);
	var percentage;
	var points;
	var array = [];
	var rgb;
	var dataObj;
	for(i=0; i < data.length - 1; i++)
	{
		points = parseFloat(data[i][2]);
		percentage = 100 - (100 * (points / maxPoints));
		if(points < 0)
			percentage = 100;
		rgb = ComputeRedToGreenRGB(percentage);

		weekStr = data[i][0] + ", " + data[i][1];
		dataObj = {
			name:  weekStr, 
			y: points,
			color: rgb
		};
		array.push (dataObj);
	}
	points = expected;
	rgb = "rgba(124,205,247,1)";
	weekStr = "Expected Points";
	dataObj = {
		name:  weekStr, 
		y: points,
		color: rgb
	};
	array.push (dataObj);
	return array;
}

function getPlayerSalarySeries(data)
{
	var salary;
	var array = [];
	for(i=0; i < data.length; i++)
	{
		salary = parseInt(data[i][3]);

		weekStr = data[i][0] + ", " + data[i][1];
		dataObj = {
			name:  weekStr, 
			y: salary
		};
		array.push (dataObj);
	}
	return array;
}

function getMaxPoints(data)
{
	var max = 0;
	var curr;
	for(i=0; i < data.length; i++)
	{
		curr = parseInt(data[i][2]);
		if(curr > max)
			max = curr;
	}
	return max;
}