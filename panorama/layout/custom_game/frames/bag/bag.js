"use strict";

var m_BagSlotList = [];
var m_BagSlotTable = {};

var BAG_NAME_COMMON = 1;

GameUI.Bag_EachItems = function (func) {
	var hero = Players.GetLocalHero();
	var bagData = CustomNetTables.GetTableValue("Bag", hero.toString() + BAG_NAME_COMMON);

	var max_count = m_BagSlotList.length;
	for (var i = 0; i < m_BagSlotList.length; i++) {
		var slot = m_BagSlotList[i];
		if(slot != null && slot.m_ItemEntIndex != null) {
			var itemIndex = slot.m_ItemEntIndex;
			if (itemIndex > 0) {
				var itemInfo = bagData[i + 1];
				var charges = (Items.IsStackable(itemIndex))? Items.GetCurrentCharges(itemIndex) : 1;
				if(itemInfo){
					charges = itemInfo.stackable ? itemInfo.charges : 1;
				}
				if (func(Abilities.GetAbilityName(itemIndex), charges, i, itemIndex) === true) return;
			}
		}
	}
}

GameUI.Bag_ActiveItems = function(itemList) {
	var hero = Players.GetLocalHero();
	var bagData = CustomNetTables.GetTableValue("Bag", hero.toString() + BAG_NAME_COMMON);

	GameUI.Bag_InactiveAllItems();
	let startIndex = 0;
	let itemHash = {};
	for (let index = 0; index < itemList.length; index++) {
		let itemName = itemList[index];
		for (let i = startIndex; i < m_BagSlotList.length; i++) {
			startIndex = i + 1;
			let slot = m_BagSlotList[i];
			if (slot != null && slot.m_ItemEntIndex != null && slot.m_ItemEntIndex > 0) {
				let name = Abilities.GetAbilityName(slot.m_ItemEntIndex)
				if (name == itemName) {					
					var isStackable = Items.IsStackable(slot.m_ItemEntIndex);
					var itemInfo = bagData[i + 1];
					if(itemInfo) {
						isStackable = itemInfo.stackable;
					}

					if (isStackable) {
						let count = Items.GetCurrentCharges(slot.m_ItemEntIndex);
						if(itemInfo){
							count = itemInfo.charges;
						}

						if (!itemHash[name]) {
							itemHash[name] = count;
						}
						itemHash[name] = itemHash[name] - 1;
						if (itemHash[name] >= 0) {
							startIndex -= 1;
						} else {
							break;
						}
					}

					slot.SetHasClass("is-compose-active",true);
					break;
				}
			}
		}
	}	
}

GameUI.Bag_InactiveAllItems = function() {
	for (let i = 0; i < m_BagSlotList.length; ++i) {
		let slot = m_BagSlotList[i];
		if (slot != null) {
			slot.SetHasClass("is-compose-active", false);
		}
	}
}

function OnDragStart( slot, dragCallbacks ) {
	OnMouseOut(slot);
	if (slot.m_ItemEntIndex >= 0) {

		slot.SetHasClass('drag_start',true);
		var hero = Players.GetLocalHero();
		var displayPanel = $.CreatePanel('DOTAItemImage',$.GetContextPanel(),'');
		displayPanel.m_Source = "bag";
		displayPanel.m_BagSlot = slot.m_BagSlot;
		displayPanel.m_ItemEntIndex = slot.m_ItemEntIndex;
		// displayPanel.panelId = panelId;
		displayPanel.itemname = Abilities.GetAbilityName(slot.m_ItemEntIndex);

		dragCallbacks.displayPanel = displayPanel;
		dragCallbacks.offsetX = 0;
		dragCallbacks.offsetY = 0;

        GameUI.ShowBagHandyButtons(slot.m_ItemEntIndex);
	}
}

function OnDragEnter( panel, draggedPanel ) {
	// var panel = m_BagSlotTable[panelId];
	panel.SetHasClass("drag_enter",true);
}

function OnDragLeave( panel, draggedPanel ) {
	// var panel = m_BagSlotTable[panelId];
	panel.SetHasClass("drag_enter",false);
}

function OnDragDrop( slot2Panel, draggedPanel ) {
	if (draggedPanel.m_Source !== 'bag' && draggedPanel.m_Source !== 'equipments') return;

	// var slot2Panel = m_BagSlotTable[panelId];
	if (draggedPanel.m_Source !== 'bag' || draggedPanel.m_BagSlot !== slot2Panel.m_BagSlot) {
		var slot1 = draggedPanel.m_BagSlot;
		var slot2 = slot2Panel.m_BagSlot;

		if (draggedPanel.m_IsEquipment) {
			GameEvents.SendCustomGameEventToServer('xxwar_bag_swap_item_from_inventory',{ from:{bagName:BAG_NAME_COMMON, slot:slot2}, inventorySlot:draggedPanel.m_inventorySlot });
		} else if (Items.IsStackable(draggedPanel.m_ItemEntIndex) && Items.IsStackable(slot2Panel.m_ItemEntIndex)
				&& Abilities.GetAbilityName(draggedPanel.m_ItemEntIndex) === Abilities.GetAbilityName(slot2Panel.m_ItemEntIndex)) {

			GameEvents.SendCustomGameEventToServer('xxwar_bag_merge_item',{'slot1':slot2,'slot2':slot1});
		}
		else{
			GameEvents.SendCustomGameEventToServer('xxwar_bag_swap_item',{ from:{bagName:BAG_NAME_COMMON, slot:slot1}, to:{bagName:BAG_NAME_COMMON, slot:slot2} });
		}

		Game.EmitSound("CustomGameUI.ItemDropToPublicStash");
	}
}

function OnDragEnd( slot, draggedPanel ) {
	draggedPanel.DeleteAsync(0);
	// var slot = m_BagSlotTable[panelId];
	slot.SetHasClass('drag_start',false);
	GameUI.HideBagHandyButtons();
}

function OnMouseOver(slot) {
	if (slot.m_ItemEntIndex > 0) {
		slot.FindChild('tooltip').ShowTooltip("ItemIndex="+slot.m_ItemEntIndex);
	}
}

function OnMouseOut(slot) {
	slot.FindChild('tooltip').HideTooltip();
}

function OnDoubleClick(slot) {
	OnMouseOut(slot);
	var abilityName = Abilities.GetAbilityName(slot.m_ItemEntIndex);
	if(abilityName == "item_consumable_ability") {
		if(GameUI.HasShowFrame("ability_select") || GameUI.HasShowFrame("ability_replace")) {
		    GameUI.CloseFrame("ability_select");
    		GameUI.CloseFrame("ability_replace");
		}
	}

	GameEvents.SendCustomGameEventToServer('xxwar_bag_equip_item',{bagName:BAG_NAME_COMMON, slot:slot.m_BagSlot});
	Game.EmitSound("CustomGameUI.ItemDropToPublicStash");
}

var LastContextMenuSlot = null;
function OnContextMenu(slot) {
	if (slot.m_ItemEntIndex <= 0) return;
	LastContextMenuSlot = slot;
	GameEvents.SendCustomGameEventToServer("xxwar_bag_context_menu",{'item':slot.m_ItemEntIndex});
}

function OnDiscard(slot) {
	GameEvents.SendCustomGameEventToServer("xxwar_bag_discard",{'slot':slot.m_BagSlot});
}

function OnSell(slot) {
	if (slot.m_ItemEntIndex <= 0) return;
	GameEvents.SendCustomGameEventToServer("xxwar_bag_sell",{'item':slot.m_ItemEntIndex});
}

function OnSplit(slot) {
	if (slot.m_ItemEntIndex <= 0) return;
	$.Schedule(0.1, function () {
		GameUI.ShowContextMenu(slot,'right','split_item',{'slot':slot.m_BagSlot});
	})
}

function OnContextMenuResponse(data) {
	var list = [];

	if (data.is_consumable) {
		list.push({
			name: '#xxwar_bag_use_item',
			func: OnDoubleClick,
			args: [LastContextMenuSlot],
		});
	}

	if (data.is_equipment) {
		list.push({
			name: '#xxwar_equipments_equip',
			func: OnDoubleClick,
			args: [LastContextMenuSlot],
		});
	}

	list.push({
		name: '#DOTA_BackpackDiscard',
		func: OnDiscard,
		args: [LastContextMenuSlot],
	});

	if (Items.IsStackable(LastContextMenuSlot.m_ItemEntIndex)) {
		list.push({
			name: '#xxwar_bag_split_item',
			func: OnSplit,
			args: [LastContextMenuSlot],
		});
	}

	GameUI.ShowBaseContextMenu(LastContextMenuSlot, 'right', list, 200);
}

// 注册拖拽事件
function RegisterSlotEvent(slot) {
	slot.SetDraggable(true);
	$.RegisterEventHandler( 'DragEnter', slot, OnDragEnter );
	$.RegisterEventHandler( 'DragDrop', slot, OnDragDrop );
	$.RegisterEventHandler( 'DragLeave', slot, OnDragLeave );
	$.RegisterEventHandler( 'DragStart', slot, OnDragStart );
	$.RegisterEventHandler( 'DragEnd', slot, OnDragEnd );

	slot.SetPanelEvent('oncontextmenu',function() {
		OnContextMenu(slot);
	});
	slot.SetPanelEvent('onmouseover',function() {
		OnMouseOver(slot);
	});
	slot.SetPanelEvent('onmouseout',function() {
		OnMouseOut(slot);
	});
	slot.SetPanelEvent('ondblclick',function() {
		OnDoubleClick(slot);
	});
}

function AutoUpdateBag() {
	var hero = Players.GetLocalHero();
	var bagData = CustomNetTables.GetTableValue("Bag", hero.toString() + BAG_NAME_COMMON);
	if (!bagData) {
		$.Schedule(0.1, AutoUpdateBag);
		return;
	}

	m_BagSlotList.forEach(function(slot, i) {
		var itemInfo = bagData[i + 1];
		if (!itemInfo) return;

		var itemIndex = itemInfo.entindex;

		slot.m_ItemEntIndex = itemIndex;
		slot.FindChildTraverse('item-img').itemname = Abilities.GetAbilityName(itemIndex);

		var charges = slot.FindChildTraverse('item-charges');
		if(charges != null) {
			if(itemInfo.charges > 0) {
				charges.RemoveClass('hide');
				charges.text = itemInfo.charges;
			} else {
				charges.AddClass('hide');
			}
		}

		var isInCD = !Abilities.IsCooldownReady(itemIndex);
		slot.FindChild('tooltip').SetHasClass('is-in-cd', isInCD);

		if (isInCD) {
			var cd = Abilities.GetCooldownTimeRemaining(itemIndex);
			var deg = -360 * (cd / Abilities.GetCooldown(itemIndex));
			deg = (isFinite(deg))? deg : 0;
			slot.FindChild('tooltip').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
		}
	})

	$.Schedule(0.1, AutoUpdateBag);
}

;(function(){
	var mainPanel = $.CreatePanel("Panel", $("#BagItemList"), "");
	mainPanel.AddClass('line');
	for (var i = 1; i <= 12; i++) {
		var slot = $.CreatePanel("Panel",mainPanel,"BagSlot"+i);
		slot.BLoadLayoutSnippet('slot');
		slot.m_BagSlot = i;
		slot.m_ItemEntIndex = -1;
		m_BagSlotList.push(slot);
		// m_BagSlotTable["BagSlot"+i] = slot;

		var tooltip = slot.FindChild('tooltip');
		tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
		tooltip.Setup("item");
		RegisterSlotEvent(slot);

		if (i % 6 === 0) {
			mainPanel = $.CreatePanel("Panel",$("#BagItemList"),"");
			mainPanel.AddClass('line');
		}
	}

	$("#BagItemList").SetHasClass("checked",true);

	AutoUpdateBag();
	
	GameEvents.Subscribe("xxwar_bag_context_menu_response", OnContextMenuResponse );
})()
