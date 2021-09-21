"use strict";

var ITEM_KIND_WEAPON = 1;
var ITEM_KIND_SHOES = 2;
var ITEM_KIND_CLOTHES = 3;
var ITEM_KIND_HAT = 4;
var ITEM_KIND_TRINKET = 5;
var ITEM_KIND_GLOVES = 6;
var ITEM_KIND_CONSUMABLE = 7;
var m_UseEquipmentItem = false;
var m_AutomaticCompose = true;

var KIND_TO_ITEM = {
	"1": {2:"item_virtual_weapon_2", 3:"item_virtual_weapon_3", 4:"item_virtual_weapon_4", 5:"item_virtual_weapon_5"},
	"2": {2:"item_virtual_shoes_2", 3:"item_virtual_shoes_3", 4:"item_virtual_shoes_4", 5:"item_virtual_shoes_5"},
	"3": {2:"item_virtual_clothes_2", 3:"item_virtual_clothes_3", 4:"item_virtual_clothes_4", 5:"item_virtual_clothes_5",},
	"4": {2:"item_virtual_hat_2", 3:"item_virtual_hat_3", 4:"item_virtual_hat_4", 5:"item_virtual_hat_5"},
	"5": {2:"item_virtual_trinket_2", 3:"item_virtual_trinket_3", 4:"item_virtual_trinket_4", 5:"item_virtual_trinket_5"},
	"6": {2:"item_virtual_gloves_2", 3:"item_virtual_gloves_3", 4:"item_virtual_gloves_4", 5:"item_virtual_gloves_5"},
	"7": {2:"item_virtual_consumable_2", 3:"item_virtual_consumable_3", 4:"item_virtual_consumable_4"}, // , 5:"item_virtual_consumable_5"
	"-1": {2:"item_virtual_random_2", 3:"item_virtual_random_3", 4:"item_virtual_random_4", 5:"item_virtual_random_5"},
};

function UpdateBag() {
	$.Schedule(0.1, ComposeItemUpdate);
}

function ComposeFinished(data) {
	ComposeItemUpdate();
}

function RegisterItemEvents(item) {
	item.SetPanelEvent("onmouseover", function () {
		OnBtnMouseOver(item);
		if (m_UseEquipmentItem) {
			let remainItems = GameUI.Euipment_ActiveItems(item.m_CostItems);
			GameUI.Bag_ActiveItems(remainItems);
		} else {
			GameUI.Bag_ActiveItems(item.m_CostItems);
		}
		
	});

	item.SetPanelEvent("onmouseout", function () {
		OnBtnMouseOut(item);
		GameUI.Bag_InactiveAllItems();
		GameUI.Equipment_InactiveAllItems();
	});

	item.SetPanelEvent("onactivate", function() {
		OnClickCompose(item);
	});
}

function OnClickCompose(item) {
	if (item && item.m_ItemName && item.m_CostItems && item.m_ComposeType) {
		GameUI.Bag_InactiveAllItems();
		GameUI.Equipment_InactiveAllItems();

		var data = {item_name: item.m_ItemName, target_items: item.m_CostItems, compose_type: item.m_ComposeType, use_equipment: m_UseEquipmentItem};	
		GameEvents.SendCustomGameEventToServer("compose_random_item", data);
	}
}

function OnBtnMouseOver(btn) {
	if (!btn.m_ItemName) return;
	btn.FindChild('tooltip').ShowTooltip("itemname=" + btn.m_ItemName);
}

function OnBtnMouseOut(btn) {
	btn.FindChild('tooltip').HideTooltip();
}

function ClearSelectedItems() {
	var ComposeItemList = $("#ComposeItemList");
	var max = ComposeItemList.GetChildCount();

	for (var i = 0; i < max; i++) {
		var item = ComposeItemList.GetChild(i);
		if (item.visible) {
			item.FindChild("ComposeItem").SetHasClass("selected", false);
		}
	}
}

function UpdateItemsList(parentPanel, itemList){
	var itemIndex = 0;
	for(var i in itemList) {
		var itemInfo = itemList[i];
		let targetKind = itemInfo.TargetKind;
		let quality = itemInfo.TargetQuality;
		let itemName = KIND_TO_ITEM[String(targetKind)][quality];
		if (!itemName) { continue; }

		var item = parentPanel.GetChild(itemIndex++);

		if (!item) {
			item = $.CreatePanel("Panel", parentPanel, "");
			item.BLoadLayoutSnippet("item");

			var tooltip = item.FindChild('tooltip');
			tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml', false, false);
			tooltip.Setup("item_for_kv");

			RegisterItemEvents(item);
		}
	
		item.SetHasClass("has-item", true);
		item.FindChildTraverse("item-img").itemname = itemName;
		item.m_ItemName = itemName;
		item.m_CostItems = itemInfo.ItemList;
		if (targetKind == ITEM_KIND_CONSUMABLE) {
			item.m_ComposeType = "consumable_compose";
		} else {
			item.m_ComposeType = "equip_compose";
		}
		item.visible = true;
	}

	var max_count = parentPanel.GetChildCount();
	for (var i = itemIndex; i < max_count; i++) {
		var item = parentPanel.GetChild(i);
		item.m_ItemName = null;
		item.m_CostItems = null;
		item.m_ComposeType = null;
		item.visible = false;
	}
}

function SelectComposeItem(item) {
	if(!item) return;
	var composeItemPanel = item.FindChild("ComposeItem");
	if(composeItemPanel) {
		composeItemPanel.m_ItemName = item.m_ItemName;
	}
}

function ComposeItemUpdate(){
	let composeList = GameUI.GetCanComposeRandomlyItems(m_UseEquipmentItem);
	composeList = composeList || [];
	let composeConsumableList = GameUI.GetCanComposeConsumableItems();
	composeList = composeList.concat(composeConsumableList)
	UpdateItemsList($("#ComposeItemList"), composeList);
}

function SwitchEquipmentCompose(isUseEquipment) {
	m_UseEquipmentItem = isUseEquipment;
	ComposeItemUpdate();
}

function SwitchAutomaticCompose(isAutomaticCompose) {
	m_AutomaticCompose = isAutomaticCompose;
}

GameUI.NoticePreCollectionUpdateForCompose = function() {
	UpdateBag();
}

function CheckAutomaticCompose() {
	if(m_AutomaticCompose == false){
		$.Schedule(3.0, CheckAutomaticCompose);
		return;
	}

	var composeItemList = $("#ComposeItemList");
	var max = composeItemList.GetChildCount();
	for (var i = 0; i < max; i++) {
		var item = composeItemList.GetChild(i);
		if(item && item.visible) {
			OnClickCompose(item);
			break;
		}
	}

	$.Schedule(3.0, CheckAutomaticCompose);
}

;(function(){
	CheckAutomaticCompose();
	ComposeItemUpdate();
	GameEvents.Subscribe("bag_event_update", UpdateBag);
	GameEvents.Subscribe("xxwar_compose_item_finished", ComposeFinished);
})()
