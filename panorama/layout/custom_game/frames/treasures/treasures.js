"use strict";

GameUI.LoadFrame($("#NPCTreasuresFrame"),'treasures','bottom_unit_info',false,true);

var m_NPC = -1;
var m_OpenBoxType = "Treasures";

function SelectNPC(defaultNPC, isSupply=false) {
	var unit = defaultNPC || Players.GetQueryUnit(Players.GetLocalPlayer());

	if (unit > 0) {
		m_NPC = unit;
		if (isSupply) {
			GameEvents.SendCustomGameEventToServer("xxwar_event_select_supply",{'unit':unit});
		} else {
			GameEvents.SendCustomGameEventToServer("xxwar_event_select_treasure",{'unit':unit});
		}
		
	}
}

function OnBtnActive(btn) {
	var data = btn.m_Data;
	switch(data.display)
	{
		case 'item':
		{
			if (m_OpenBoxType == "Treasures") {
				GameEvents.SendCustomGameEventToServer("avalon_treasures_pickup_item",{'unit': m_NPC, 'itemname': data.itemname});
			}
			if (m_OpenBoxType == "Supply") {
				GameEvents.SendCustomGameEventToServer("xxwar_supply_pickup_item",{'unit': m_NPC, 'itemname': data.itemname});
			}
			break;
		}
	}
}

function OnBtnMouseOver(btn) {
	var data = btn.m_Data;
	switch(data.display)
	{
		case 'item':
		{
			btn.FindChild('tooltip').ShowTooltip("itemname=" + data.itemname);
			break;
		}
	}
}

function OnBtnMouseOut(btn) {
	btn.FindChild('tooltip').HideTooltip();
	$.DispatchEvent("DOTAHideTextTooltip");
	$.DispatchEvent("DOTAHideAbilityTooltip");
}

function DisplayButton(btn, data, index) {
	OnBtnMouseOut(btn);

	var itemImg = btn.FindChildTraverse('item-img');
	var abilityImg = btn.FindChildTraverse('ability-img');
	itemImg.visible = false;
	abilityImg.visible = false;

	var tooltip = btn.FindChild('tooltip');
	tooltip.SetHasClass("tooltip-top",false);
	tooltip.SetHasClass("tooltip-center",false);

	switch(data.display)
	{
		case 'item':
		{
			btn.FindChildTraverse('mid-text').text = "";
			itemImg.itemname = data.itemname;
			itemImg.visible = true;

			tooltip.SetHasClass("tooltip-top",false);
			tooltip.SetHasClass("tooltip-center",false);
			tooltip.Setup("item_for_kv");
			break;
		}
	}
	btn.m_Data = data;
	btn.visible = true;
	return index+1;
}

function RegisterEvents(btn) {
	btn.SetPanelEvent("onactivate",function() {
		OnBtnActive(btn);
	});
	btn.SetPanelEvent("onmouseover",function() {
		OnBtnMouseOver(btn);
	});
	btn.SetPanelEvent("onmouseout",function() {
		OnBtnMouseOut(btn);
	});
	btn.SetPanelEvent("oncontextmenu",function() {
		OnBtnActive(btn);
	});
}

function SelectNPCResponse(data) {
	if (data.unit !== m_NPC) return;
	var btnList = data.btnList;

	$("#NPCName").text = $.Localize(Entities.GetUnitName(m_NPC));

	var ButtonListPanel = $("#ButtonList");
	var ButtonListIndex = 0;
	for(var i in btnList) {
		var btnData = btnList[i];

		var btn = ButtonListPanel.GetChild(ButtonListIndex);
		if (!btn) {
			btn = $.CreatePanel("Panel",ButtonListPanel,"");
			btn.BLoadLayoutSnippet('btn');

			var tooltip = btn.FindChild('tooltip');
			tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);

			RegisterEvents(btn);
		}
		ButtonListIndex = DisplayButton(btn, btnData, ButtonListIndex);
	}

	var max_count = ButtonListPanel.GetChildCount();
	for (var i = ButtonListIndex; i < max_count; i++) {
		ButtonListPanel.GetChild(i).visible = false;
	}
}

GameUI.FrameEvent("treasures", function (frame_name,isOpen) {
	if (frame_name === 'treasures') {
		if (isOpen) {
			SelectNPC();
		}
		else{
			m_NPC = -1;

			var ButtonListPanel = $("#ButtonList");
			var max_count = ButtonListPanel.GetChildCount();
			for (var i = 0; i < max_count; i++) {
				ButtonListPanel.GetChild(i).visible = false;
			}
		}
	}
});

function TouchTreasure(data) {
	var panel = $("#NPCTreasuresFrame")
	var unit = data.unit || 0;
	if (unit > 0) {
		m_OpenBoxType = "Treasures";
		SelectNPC(unit);
		panel.visible = true;
		panel.AddClass("show");
	}
}

function TouchSupply(data) {
	var panel = $("#NPCTreasuresFrame")
	var unit = data.unit || 0;
	if (unit > 0) {
		m_OpenBoxType = "Supply";
		SelectNPC(unit, true);
		panel.visible = true;
		panel.AddClass("show");
	}
}

function TouchTreasureClose() {
	var panel = $("#NPCTreasuresFrame")
	// panel.visible = false;
	panel.RemoveClass("show");
}


function CheckAutoPickBoxItem() {	
	if($("#NPCTreasuresFrame").BHasClass("show")){
		var buttonList = $("#ButtonList");
		var max_count = buttonList.GetChildCount();
		for (var i = 0; i < max_count; i++) {
			var item = buttonList.GetChild(i);
			if(item && item.visible) {
				OnBtnActive(item);
			}
		}
	}

	$.Schedule(0.25, CheckAutoPickBoxItem);
}

;(function(){
	CheckAutoPickBoxItem();
	GameEvents.Subscribe("xxwar_event_select_treasure_response", SelectNPCResponse);
	GameEvents.Subscribe("xxwar_touch_treasure", TouchTreasure);
	GameEvents.Subscribe("xxwar_touch_supply", TouchSupply);
	GameEvents.Subscribe("xxwar_touch_treasure_close", TouchTreasureClose);
})()
