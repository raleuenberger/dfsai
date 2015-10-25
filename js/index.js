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
});

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
		$('#player_std_dev .player_stat_data').html(parseFloat(response['stdDevPoints']).toFixed(2));
		$('#player_simple_score .player_stat_data').html(parseFloat(response['simpleScore']).toFixed(2));
		
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

function getPlayerData(gid, name)
{
	request = $.ajax({
				url: "ajax/getPlayerWeeklyFantasyPoints.php",
				type: "POST",
				dataType: "json",
				data: {"gid" : gid}
			});
			
	request.done(function (response, textStatus, jqXHR) {
	data = getRecentData(response);
	makeChart(data, name);
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
		first = allData.length;
	else
		first = allData.length - 12;
	return allData.slice(first,allData.length);
}

function makeChart(data, name)
{
	var titleString = "Points Scored by " + name + " by Week";
	$('#fantasy_score_chart').highcharts({
		chart: {
			type: 'column'
		},
		title: {
			text: titleString
		},
		xAxis: {
			type: 'category',
			title: {
				text: 'Year, Week'
			}
		},
		yAxis: {
			title: {
				text: 'Points'
			}
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			series: {
				borderWidth: 0,
				dataLabels: {
					enabled: true,
					format: '{point.y}'
				}
			}
		},

		tooltip: {
			headerFormat: '{series.name}: <br>',
			pointFormat: '{point.y}'
		},

		series: [{
			name: "Weekly Points",
			colorByPoint: false,
			data: getChartSeries(data)
		}]

	});
}

function getChartSeries(data)
{
	var array = [];
	for(i=0; i < data.length; i++)
	{
		weekStr = data[i][0] + ", " + data[i][1];
		dataObj = {
			name:  weekStr, 
			y: parseInt(data[i][2])
		};
		array.push (dataObj);
	}
	return array;
}