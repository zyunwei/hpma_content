"use strict";

GameUI.LoadFrame($("#NPCTaskFrame"),'npc_task','bottom_unit_info',false,true);

var m_NPC = -1;
var HotKey = {'Q':0,'W':1,'E':2,'R':3,'V':4,'G':5};
var m_ButtonList = [];

function SelectNPC(defaultNPC) {
	var unit = defaultNPC || Players.GetQueryUnit(Players.GetLocalPlayer());

	if (unit > 0) {
		m_NPC = unit;
		GameEvents.SendCustomGameEventToServer("xxwar_event_select_npc",{'unit':unit});
	}
}

GameUI.NPCTask_OnKeyPress = function (key) {
	switch(key)
	{
		case 'Q':
		case 'W':
		case 'E':
		case 'R':
		case 'V':
		case 'G':
		case 'D':
		case 'F':
			GameUI.HeroFrame_OnKeyPress(key);
			return;
	}

	var ButtonList = $("#ButtonList");
	var index = HotKey[key];
	if (index === undefined) return;

	var btn = ButtonList.GetChild(index);//m_ButtonList[index];
	if (btn && btn.visible) {
		var data = btn.m_Data;
		if (data && (data.display === 'quest' || data.display === 'quest-shared')) {
			OnBtnActive(btn);
		}
	}
}

function OnBtnActive(btn) {
	var data = btn.m_Data;
	switch(data.display)
	{
		case 'item':
		{
			GameEvents.SendCustomGameEventToServer("xxwar_event_buy_item",{'unit': m_NPC, 'itemname': data.itemname});
			break;
		}
		case 'boss':
		{
			GameEvents.SendCustomGameEventToServer("xxwar_event_buy_boss",{'unit': m_NPC, 'itemname': data.itemname});
			break;
		}
		case "creep_refresh":
		{
			GameEvents.SendCustomGameEventToServer("xxwar_event_buy_creep_refresh",{'unit': m_NPC, 'itemname': data.itemname});
			break;
		}
		case "creep_upgrade":
		{
			GameEvents.SendCustomGameEventToServer("xxwar_event_buy_creep_upgrade",{'unit': m_NPC, 'itemname': data.itemname});
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
		case 'boss':
		{
			btn.FindChild('tooltip').ShowTooltip("bossname=" + data.itemname);
			break;
		}
		case "creep_refresh":
		{
			btn.FindChild('tooltip').ShowTooltip("itemname=" + data.itemname);
			break;
		}
		case "creep_upgrade":
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
	var itemCost = btn.FindChildTraverse('item-cost');
	var abilityImg = btn.FindChildTraverse('ability-img');
	var questImg = btn.FindChildTraverse('quest-img');
	itemImg.visible = false;
	itemCost.visible = false;
	abilityImg.visible = false;
	questImg.visible = false;

	var tooltip = btn.FindChild('tooltip');
	tooltip.SetHasClass("tooltip-top",false);
	tooltip.SetHasClass("tooltip-center",false);

	switch(data.display)
	{
		case 'item':
		{
			btn.FindChildTraverse('mid-text').text = "";
			itemCost.text = data.cost || 0;
			itemImg.itemname = data.itemname;
			itemImg.visible = true;
			itemCost.visible = true;

			switch(data.tooltip)
			{
				default:
				{
					tooltip.SetHasClass("tooltip-top",false);
					tooltip.SetHasClass("tooltip-center",false);
					tooltip.Setup("item_for_kv");
				}
			}
			break;
		}
		case 'boss':
		{
			btn.FindChildTraverse('mid-text').text = $.Localize(data.itemname);
			questImg.SetImage("file://{images}/custom_game/boss/" + data.itemname + ".png");
			questImg.visible = true
			itemCost.text = data.cost || 0;
			itemCost.visible = true;
			tooltip.Setup("boss");
			break;
		}

		case "creep_refresh":
		{
			btn.FindChildTraverse('mid-text').text = "";
			itemCost.text = data.cost || 0;
			itemImg.itemname = data.itemname;
			itemImg.visible = true;
			itemCost.visible = true;

			switch(data.tooltip)
			{
				default:
				{
					tooltip.SetHasClass("tooltip-top",false);
					tooltip.SetHasClass("tooltip-center",false);
					tooltip.Setup("item_for_kv");
				}
			}
			break;
		}
		case "creep_upgrade":
		{
			btn.FindChildTraverse('mid-text').text = "";
			itemCost.text = data.cost || 0;
			itemImg.itemname = data.itemname;
			itemImg.visible = true;
			itemCost.visible = true;

			switch(data.tooltip)
			{
				default:
				{
					tooltip.SetHasClass("tooltip-top",false);
					tooltip.SetHasClass("tooltip-center",false);
					tooltip.Setup("item_for_kv");
				}
			}
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

GameUI.FrameEvent("npc_task", function (frame_name,isOpen) {
	if (frame_name === 'npc_task') {
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

function TouchNPC(data) {
	var unit = data.unit || 0;
	if (unit > 0) {
		var all_npc = CustomNetTables.GetTableValue("Common", "all_npc_entity_index");
		for(var i in all_npc) {
			if(all_npc[i] == unit) {
				SelectNPC(unit);
				GameUI.SwapFrame('npc_task',true);
			}
		}
	}
}

function TouchNPCClose() {
	GameUI.SwapFrame('hero_frame',true);
}

;(function(){
	GameEvents.Subscribe("xxwar_select_npc_response",SelectNPCResponse);
	GameEvents.Subscribe("xxwar_touch_npc", TouchNPC );
	GameEvents.Subscribe("xxwar_touch_npc_close", TouchNPCClose );
})()
