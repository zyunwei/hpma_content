"use strict";

var m_IgnoreItem = {};
GameUI.SwapTargetSlot = -1;

function CreateItemIcon(panel, itemname){
	if(panel && itemname) {
		panel.BLoadLayout("file://{resources}/layout/custom_game/templates/item/item.xml",false,false);
		panel.SetItemName(itemname);	
	}
}

function CreateSwapMiniFrame(data) {
	m_IgnoreItem[data["new_item"]] = true;

	var SwapDialogList = $("#SwapDialogList");
	var panel = $.CreatePanel("Panel", SwapDialogList, "swap_" + data.slot);
	panel.BLoadLayoutSnippet("swap-item-mini-frame");
	panel.SetDialogVariable("ItemName",$.Localize("DOTA_Tooltip_ability_" + data["new_item"]));
	panel.SlotIndex = data.slot;
	GameUI.SwapTargetSlot = data.slot;

	CreateItemIcon(panel.FindChildTraverse("swap-item"), data["new_item"])
	CreateItemIcon(panel.FindChildTraverse("current-item"), data["current_item"])

	panel.FindChildTraverse("button-yes").SetPanelEvent("onactivate", function () {
		GameEvents.SendCustomGameEventToServer('xxwar_bag_equip_item',{ bagName:1, slot:data.slot});
		panel.visible = false;
		GameUI.SwapTargetSlot = -1;
	})

	panel.FindChildTraverse("button-cancel").SetPanelEvent("onactivate", function () {
		panel.visible = false;
		GameUI.SwapTargetSlot = -1;
	})

	panel.DeleteAsync(10);
}

function ItemSwapEvent(data) {
	if (m_IgnoreItem[data["new_item"]]) return;
	CreateSwapMiniFrame(data);
}

function ItemSwapRemoveEvent(data) {
	var swapDialogList = $("#SwapDialogList");
	for(var i = 0; i < swapDialogList.GetChildCount(); i++ ) {
		var swapDialog = swapDialogList.GetChild(i);
		if(swapDialog && swapDialog.SlotIndex == data.slot_index) {
			swapDialog.DeleteAsync(0);
			break;
		}
	}
}

GameUI.SpaceClickSwapItem = function(){
	if(GameUI.SwapTargetSlot != -1) {
		GameEvents.SendCustomGameEventToServer('xxwar_bag_equip_item',{ bagName:1, slot:GameUI.SwapTargetSlot});
		GameUI.SwapTargetSlot = -1;
		$("#SwapDialogList").RemoveAndDeleteChildren();
	}
}

;(function(){
	GameEvents.Subscribe("item_swap_alert", ItemSwapEvent);
	GameEvents.Subscribe("item_swap_alert_remove", ItemSwapRemoveEvent);
})()
