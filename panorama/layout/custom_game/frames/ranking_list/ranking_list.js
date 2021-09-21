"use strict";

GameUI.LoadFrame($("#RankingListFrame"),'ranking_list','all');

function OnRefresh() {
	$("#ContentTier1").visible = true;

	var RankingListContent = $("#RankingListContent");
	var max = RankingListContent.GetChildCount();
	for (var i = 1; i < max; i++) {
		RankingListContent.GetChild(i).visible = false;
	}

	GameEvents.SendCustomGameEventToServer("xxwar_get_ranking", {});

	$("#TimeoutCloseAllButton").visible = false;
	$("#RefreshButton").style.opacity = 0;
	$.Schedule(5, function () {
		$("#TimeoutCloseAllButton").visible = true;
		$("#RefreshButton").style.opacity = 1;
	})
}

GameUI.FrameEvent("ranking_list", function (frame_name, isOpen) {
	if (frame_name === 'ranking_list' && isOpen) {
		OnRefresh();
	}
});

function OnShowRanking(data){
	$("#ContentTier1").visible = false;
	var RankingListContent = $("#RankingListContent");
	var lastIndex = 0;
	var playerInfo = Game.GetPlayerInfo(Game.GetLocalPlayerID());
	var localSteamId = playerInfo == null ? "" : playerInfo.player_steamid;
    for(var index in data){
    	lastIndex = parseInt(index) + 1;
		var panel = RankingListContent.GetChild(lastIndex);
		if (!panel) {
			panel = $.CreatePanel("Panel", RankingListContent, "");
			panel.BLoadLayoutSnippet('ranking-list-item');
		}

		if(panel.FindChild("Rank")){
			panel.FindChild("Rank").text = data[index]["Ranking"];
			panel.FindChild("SteamName").text = data[index]["SteamName"];
			panel.FindChild("SteamName").SetHasClass("local", localSteamId == data[index].SteamId);
			panel.FindChild("Grade").text = $.Localize("UI_RANK_" + data[index]["Grade"]);
			panel.FindChild("Score").text = data[index]["Score"];
			panel.visible = true;
		}
    }

	var max = RankingListContent.GetChildCount();
	for (var i = lastIndex + 1; i < max; i++) {
		RankingListContent.GetChild(i).visible = false;
	}

	$("#RefreshButton").style.opacity = 1;
}

function CloseAll() {
	$("#ContentTier1").visible = false;
}

;(function(){
	$("#ContentTier1").visible = false;
	GameEvents.Subscribe("xxwar_show_ranking", OnShowRanking);
})()
