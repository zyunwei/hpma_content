"use strict";

var ITEM_KIND_MATERIAL=0
var ITEM_KIND_WEAPON=1
var ITEM_KIND_SHOES=2
var ITEM_KIND_CLOTHES=3
var ITEM_KIND_HAT=4
var ITEM_KIND_TRINKET=5
var ITEM_KIND_GLOVES=6
var ITEM_KIND_CONSUMABLE=7
var ITEM_KIND_VIRTUAL_EQUIP=8

var ITEM_QUALITY_D=1
var ITEM_QUALITY_C=2
var ITEM_QUALITY_B=3
var ITEM_QUALITY_A=4
var ITEM_QUALITY_S=5
var ITEM_QUALITY_Z=6
var ITEM_QUALITY_EX=7


// 替换价格
var ReplacePrice = {}
ReplacePrice[ITEM_QUALITY_D] = 150;
ReplacePrice[ITEM_QUALITY_C] = 300;
ReplacePrice[ITEM_QUALITY_B] = 600;
ReplacePrice[ITEM_QUALITY_A] = 1200;
ReplacePrice[ITEM_QUALITY_S] = 2400;
ReplacePrice[ITEM_QUALITY_Z] = 6400;
ReplacePrice[ITEM_QUALITY_EX] = 12800;

function Null() {}

function Update() {
	var currencies = CustomNetTables.GetTableValue('Common','currencies_'+Players.GetLocalHero());
	if (currencies) {
		var CurrenciesFrame = $("#Currencies");
		CurrenciesFrame.SetDialogVariableInt("gbi",currencies[1] || 0)
	}

	$.Schedule(0.2,Update);
}

// 显示背包快捷按钮
GameUI.ShowBagHandyButtons = function (itemIndex) {
	$("#BagHandyButtons").SetHasClass('drag_start', true);

	var replaceResultInfo = $("#ReplaceResultInfo");
	var config = GameUI.GetItemConfig(Abilities.GetAbilityName(itemIndex));
	if (config && config.quality > 1) {
		var canReplace = config.kind == ITEM_KIND_WEAPON || config.kind == ITEM_KIND_SHOES || config.kind == ITEM_KIND_CLOTHES || 
			config.kind == ITEM_KIND_HAT || config.kind == ITEM_KIND_HAT || config.kind == ITEM_KIND_TRINKET || config.kind == ITEM_KIND_GLOVES;
		if (canReplace && ReplacePrice[config.quality]) {
			var price = ReplacePrice[config.quality];
			replaceResultInfo.visible = true;
            $("#ReplaceResultText").text = "$" + price;
			$("#BagHandyButtons_Replace").enabled = true;
		} else {
			replaceResultInfo.visible = false;
			$("#BagHandyButtons_Replace").enabled = false;
			$("#ReplaceDisabledText").text = $.Localize("#xxwar_replace_error_msg_quality");
		}
	} else {
		replaceResultInfo.visible = false;
		$("#BagHandyButtons_Replace").enabled = false;
		$("#ReplaceDisabledText").text = $.Localize("#xxwar_replace_error_msg_quality");
	}
}

// 显示背包快捷按钮
GameUI.HideBagHandyButtons = function () {
	$("#BagHandyButtons").SetHasClass('drag_start',false);
}

function OnBagHandyButtonDragDrop( panel, draggedPanel ) {
	draggedPanel.m_DragCompleted = true;
	if (draggedPanel.m_Source !== 'bag') return;

	switch(panel.id)
	{
		case "BagHandyButtons_Discard":
			GameEvents.SendCustomGameEventToServer("xxwar_bag_discard",{'slot':draggedPanel.m_BagSlot});
			break;
		case "BagHandyButtons_Replace":
			GameEvents.SendCustomGameEventToServer("xxwar_bag_replace",{'slot':draggedPanel.m_BagSlot});
			break;
	}
}

function OnBagHandyButtonDragEnter( panel, draggedPanel ) {
	panel.SetHasClass("drag_enter",true);
}

function OnBagHandyButtonDragLeave( panel, draggedPanel ) {
	panel.SetHasClass("drag_enter",false);
}

function RegisterBagHandyButtonEvents(button) {
	$.RegisterEventHandler( 'DragDrop', button, OnBagHandyButtonDragDrop );
	$.RegisterEventHandler( 'DragEnter', button, OnBagHandyButtonDragEnter );
	$.RegisterEventHandler( 'DragLeave', button, OnBagHandyButtonDragLeave );
}

function OnDragDrop(panelId, draggedPanel) {
	draggedPanel.m_DragCompleted = true;
}

GameUI.ShuShanNewItem = function (itemname) {
	if (!itemname) return;

	var item = $.CreatePanel("DOTAItemImage",$.GetContextPanel(),"");
	item.itemname = itemname;
	item.hittest = false;
	item.AddClass("NewItem");

	$('#NewItemEffect').FireEntityInput("effect", "StopPlayEndCap", "1");
	$('#NewItemEffect').FireEntityInput("effect", "Start","1");

	$.Schedule(1,function () {
		item.AddClass("over");
		item.DeleteAsync(1.2);
	})
}

function OnNewItem(data) {
	GameUI.ShuShanNewItem(data.itemname);
}

;(function(){
	$("#Equipments").BLoadLayout("file://{resources}/layout/custom_game/frames/equipments/equipments.xml",false,false);
	$("#Bag").BLoadLayout("file://{resources}/layout/custom_game/frames/bag/bag.xml",false,false);
	$("#ItemToBeCompose").BLoadLayout("file://{resources}/layout/custom_game/frames/items_to_be_compose/items_to_be_compose.xml",false,false);

	var BagHandyButtons = $("#BagHandyButtons");
	for (var i = 0; i < BagHandyButtons.GetChildCount(); i++) {
		RegisterBagHandyButtonEvents(BagHandyButtons.GetChild(i));
	}

	GameEvents.Subscribe("xxwar_new_item_tips",OnNewItem);

	$.RegisterEventHandler('DragDrop', $("#BagAndEquipment"), OnDragDrop );

	Update();
})()
