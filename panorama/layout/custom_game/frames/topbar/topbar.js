"use strict";

var LastEnemyEntIndex = null;
var LastSelectedEntIndex = null;
var EntitiesLastHealthPercent = {};

function OnItemMouseOver(item) {
	item.FindChild('tooltip').ShowTooltip("itemname=" + item.FindChild("item-img").itemname);
}

function OnItemMouseOut(item) {
	item.FindChild('tooltip').HideTooltip();
}

function RegisterEvents(item) {
	item.SetPanelEvent("onmouseover",function() {
		OnItemMouseOver(item);
	});
	item.SetPanelEvent("onmouseout",function() {
		OnItemMouseOut(item);
	});
}

function CreateUnitDropItems(data) {
	$("#EnemyDropItemsFrame").visible = true;
	var EnemyDropItemList = $("#EnemyDropItemList");
	var index = 0;

	var ItemList = data;
	if (ItemList) {
		for (var i in ItemList) {
			var t = ItemList[i];
			var item = EnemyDropItemList.GetChild(index++);
			if (!item) {
				item = $.CreatePanel("Panel",EnemyDropItemList,"");
				item.BLoadLayoutSnippet('item');
				var tooltip = item.FindChild('tooltip');
				tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
				tooltip.Setup("item_for_kv");
				RegisterEvents(item);
			}

			item.FindChild("item-img").itemname = t;
			item.visible = true;
		}
	}

	var max = EnemyDropItemList.GetChildCount();
	for (var i = index; i < max; i++) {
		EnemyDropItemList.GetChild(i).visible = false;
	}
}

function UpdateEnemyInfo() {
	var target = null;
	var selectedUnit = Players.GetLocalPlayerPortraitUnit();
	if(selectedUnit > 0) {
		if(selectedUnit == Players.GetLocalHero() && LastEnemyEntIndex) {
			target = LastEnemyEntIndex;
		} else {
			target = selectedUnit;
			if(selectedUnit != LastSelectedEntIndex){
				GameEvents.SendCustomGameEventToServer("set_enemy_info_target", { target: selectedUnit });
			}

			if(selectedUnit != LastEnemyEntIndex) {
				OnChangeEnemyInfo(selectedUnit);
			}

			LastSelectedEntIndex = selectedUnit;
		}
	}

	if(target > 0) {
		var targetHealth = Entities.GetHealth(target);
		var isCollectionUnit = Entities.GetAbilityByName(target, "ability_collection_unit") != -1 ||
			Entities.GetAbilityByName(target, "ability_npc_unit") != -1 ||
			Entities.GetAbilityByName(target, "ability_npc_teleport") != -1 ||
			Entities.GetAbilityByName(target, "ability_npc_tombstone") != -1;

		if (target != Players.GetLocalHero() && targetHealth != 0 && isCollectionUnit == false) {
			$("#EnemyInfo").visible = true;
			$("#BuffsFrame").SetTargetUnit(target, 2);
			UpdateEnemyInfoForUnit(target);
			$.Schedule(0.25, UpdateEnemyInfo);
			return;
		}
	}

	$("#EnemyInfo").visible = false;
	$.Schedule(0.25, UpdateEnemyInfo);
}

var hpbarSchedule = null;

function UpdateEnemyInfoForUnit(target) {
	var targetHealthPercent = Entities.GetHealthPercent(target);
	var unitName = Entities.GetUnitName(target);
	var level = Entities.GetLevel(target)
	var itemList = [];

	var bossConfig = GameUI.GetBossConfig(unitName);
	if(bossConfig){
		CreateUnitDropItems(bossConfig.ItemList);
	} else {
		$("#EnemyDropItemsFrame").visible = false;
	}

    $("#EnemyName").text = "LV"+ level + "   "+  $.Localize(unitName);
	$("#EnemyHealthValue").text =  Entities.GetHealth(target);

	var hpbar2 = $("#EnemyHealthBarBackground_2");
	hpbar2.style.width = targetHealthPercent.toString() + "%";

	hpbarSchedule = $.Schedule(0.25, function(){
		hpbar2.style['transition-duration'] = "0.5s";
		hpbarSchedule = null;
	});	

	hpbar2.style.width = EntitiesLastHealthPercent[target].toString() + "%";
	EntitiesLastHealthPercent[target] = targetHealthPercent;
	
	$("#EnemyHealthBarBackground").style.width = targetHealthPercent.toString() + "%";
	var attackDamageText = Math.floor( (Entities.GetDamageMin(target)+Entities.GetDamageMax(target))/2 ).toString();
	var attackBonus = Entities.GetDamageBonus(target);
	if(attackBonus > 0) {
		attackDamageText = attackDamageText + "+" + attackBonus;
	} else if(attackBonus < 0) {
		attackDamageText = attackDamageText + attackBonus;
	}
	$("#EnemyAttackDamage").SetDialogVariable("EnemyAttackDamage", attackDamageText);

	var armorText = Math.floor(Entities.GetPhysicalArmorValue(target)).toString();
	$("#EnemyArmor").SetDialogVariable("EnemyArmor", armorText);
}

function UpdateEnemyInfoTarget(info){
	if(info.entindex != LastEnemyEntIndex) {
		OnChangeEnemyInfo(info.entindex);
	}

	LastEnemyEntIndex = info.entindex;
}

function OnChangeEnemyInfo(target){
	try{ if(hpbarSchedule != null) { $.CancelScheduled(hpbarSchedule, {}); }} catch(e) {}
	var hpbar2 = $("#EnemyHealthBarBackground_2");
	hpbar2.style['transition-duration'] = "0s";

	if(EntitiesLastHealthPercent[target] == null) {
		EntitiesLastHealthPercent[target] = 100;
		hpbar2.style.width = "100%";
	} else {
		hpbar2.style.width = Entities.GetHealthPercent(target) + "%";	
	}
}

function UpdatePlayerRegion(regionInfo){
	let regionId = regionInfo.RegionId
	let regionNameTable = [
		"",
		"#xxwar_region_1",
		"#xxwar_region_2",
		"#xxwar_region_3",
		"#xxwar_region_4",
		"#xxwar_region_5",
		"#xxwar_region_6",
		"#xxwar_region_7",
		"#xxwar_region_8",
		"#xxwar_region_9",
		"#xxwar_region_10",
		"#xxwar_region_11",
		"#xxwar_region_12",
	];
	// if (regionId && regionId > 0) {
	// 	$("#lblAreaName").text = $.Localize(regionNameTable[regionId]);
	// }
}

function GetTimeString(seconds){
    if(seconds == undefined) return "00:00";
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = Math.floor(seconds % 60);
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
}

function UpdateTopbarInfo(){
	var topbarInfo = CustomNetTables.GetTableValue("Common", "TopbarInfo");
	if(topbarInfo){
		$("#lblSurviveCount").text = topbarInfo.AlivePlayerCount;
		$("#lblStageCountdown").text = GetTimeString(topbarInfo.StageCountdown);
		$("#lblJackpot").text = topbarInfo.Jackpot;
		$("#panel_jackpot_detail").visible = true;
		$("#lblGlobalJackpot").text = isNaN(topbarInfo.GlobalJackpot) ? topbarInfo.GlobalJackpot : "× " + topbarInfo.GlobalJackpot;

		var jackpotList = $("#panel_jackpot_list");
		for(var i in topbarInfo.JackpotAmount) {
			var number = parseInt(i);
			var amount = topbarInfo.JackpotAmount[number];
			var jackpotLine = jackpotList.GetChild(number - 1);
			if(!jackpotLine) {
				jackpotLine = $.CreatePanel("Panel", jackpotList, "");
				jackpotLine.BLoadLayoutSnippet('jackpot_item');
			}

			jackpotLine.FindChildTraverse("lblRank").text = "No." + number;

			var bullion = jackpotLine.FindChildTraverse("lblBullion");
			bullion.text = "× " + Math.round(amount);
		}
	}

	$.Schedule(0.25, UpdateTopbarInfo);
}

function HideDOTATooltip(){
    $.DispatchEvent("DOTAHideTextTooltip");
    $.DispatchEvent("DOTAHideTitleTextTooltip");
}

function ShowDOTATooltip(targetId){
    switch(targetId){
        case "tooltipLeftPanel":
        	$.DispatchEvent("DOTAShowTextTooltip", $("#" + targetId), $.Localize("#xxwar_now_region"));
            break;
        case "lblSurviveCount":
        	$.DispatchEvent("DOTAShowTitleTextTooltip", $("#" + targetId), $.Localize("#xxwar_remain_team"), $.Localize("#xxwar_remain_team_amount"));
            break;
        case "lblStageCountdown":
            $.DispatchEvent("DOTAShowTitleTextTooltip", $("#" + targetId), $.Localize("#xxwar_block_region"), $.Localize("#xxwar_remain_time"));
            break;
        case "lblJackpot":
            $.DispatchEvent("DOTAShowTitleTextTooltip", $("#" + targetId), $.Localize("#xxwar_jackpot_bullion"), $.Localize("#xxwar_jackpot_des"));
            break;
    }
}

function AddLeftMenu(imgPath){
	if(!imgPath) { return; }
	var panel = $.GetContextPanel().FindChildTraverse("LeftMenu");
	var button = $.CreatePanel("Panel", panel, "");
	button.BLoadLayoutSnippet("left_menu_button");
	button.FindChild("menuImage").SetImage(imgPath);
	return button;
}


;(function(){
	GameUI.AddLeftMenu = AddLeftMenu;
	$("#BuffsFrame").BLoadLayout("file://{resources}/layout/custom_game/frames/buffs_frame/buffs_frame.xml", false, false);
	UpdateTopbarInfo();
	UpdateEnemyInfo()
	GameEvents.Subscribe("update_player_region", UpdatePlayerRegion);
	GameEvents.Subscribe("update_enemy_info_target", UpdateEnemyInfoTarget);
})()
