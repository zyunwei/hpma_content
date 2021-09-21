"use strict";

GameUI.LoadFrame($("#RankingListFrame"),'xxwar_task','all');

function OnRefresh() {
	$("#ContentTier1").visible = true;

	GameEvents.SendCustomGameEventToServer("xxwar_get_task_status", {});

	$("#TimeoutCloseAllButton").visible = false;
	$("#RefreshButton").style.opacity = 0;
	$.Schedule(5, function () {
		$("#TimeoutCloseAllButton").visible = true;
		$("#RefreshButton").style.opacity = 1;
	})
}

GameUI.FrameEvent("xxwar_task", function (frame_name, isOpen) {
	if (frame_name === 'xxwar_task' && isOpen) {
		OnRefresh();
	}
});

function OnShowStatus(data){
	$("#ContentTier1").visible = false;
	for(var i in data.task_status){
		var taskLabel = $("#txtPostTask" + i);
		if(taskLabel) {
			taskLabel.text = $.Localize("xxwar_task_award_" + i);
		}
		if(data.task_status[i] == "1") {
			taskLabel.text = taskLabel.text + "\n" + $.Localize("xxwar_task_award_collected");
			$("#btnPostTask" + i).SetHasClass("Collected", true);
		} else {
			$("#btnPostTask" + i).SetHasClass("Collected", false);
		}
	}

	for(var i in data.task_indicators) {
		var taskLabel = $("#lblTask" + i);
		if(taskLabel) {
			taskLabel.text = data.task_data[i] + "/" + data.task_indicators[i];
			if(data.task_data_current[i] > 0) {
				taskLabel.text = taskLabel.text + " + " + data.task_data_current[i];
			}

			if(data.task_data[i] >= data.task_indicators[i]) {
				taskLabel.GetParent().SetHasClass("Finished", true);
			} else {
				taskLabel.GetParent().SetHasClass("Finished", false);
			}
		}
	}
	
	$("#RefreshButton").style.opacity = 1;
}

function FinishTask(awardId) {
	GameEvents.SendCustomGameEventToServer("xxwar_finish_task", { AwardId: awardId });
}

function OnFinishTaskResponse(result) {
	OnRefresh();
}

function CloseAll() {
	$("#ContentTier1").visible = false;
}

;(function(){
	$("#ContentTier1").visible = false;
	GameEvents.Subscribe("xxwar_show_task_status", OnShowStatus);
	GameEvents.Subscribe("xxwar_finish_task_response", OnFinishTaskResponse);
})()
