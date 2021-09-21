"use strict";

var m_Equipments = [];
var m_EquipmentsTable = {};

var BAG_NAME_COMMON = 1;

function OnDragEnter( panel, draggedPanel ) {
	// var panel = m_EquipmentsTable[panelId]
	panel.SetHasClass("drag_enter",true);
}
function OnDragLeave( panel, draggedPanel ) {
	// var panel = m_EquipmentsTable[panelId]
	panel.SetHasClass("drag_enter",false);
}
function OnDragDrop( slot2Panel, draggedPanel ) {
	draggedPanel.m_DragCompleted = true;
	if (draggedPanel.m_Source !== 'bag' && draggedPanel.m_Source !== 'equipments') return;
	if (draggedPanel.m_Source === "equipments") {
		return;
	}

	// var slot2Panel = m_EquipmentsTable[panelId]
	var slot1 = draggedPanel.m_BagSlot;
	GameEvents.SendCustomGameEventToServer('xxwar_bag_swap_item_from_inventory',{ from:{bagName:BAG_NAME_COMMON, slot:slot1}, inventorySlot:slot2Panel.m_Index });
	Game.EmitSound("CustomGameUI.ItemDropToPublicStash");

	return true;
}
function OnDragStart( slot, dragCallbacks ) {
	// var slot = m_EquipmentsTable[panelId]
	OnMouseOut(slot);
	if (slot.m_Item >= 0) {

		slot.SetHasClass('drag_start',true);
		var hero = Players.GetLocalHero();
		var displayPanel = $.CreatePanel('DOTAItemImage',$.GetContextPanel(),'');
		displayPanel.m_Source = "equipments";
		displayPanel.m_inventorySlot = slot.m_Index;
		displayPanel.m_ItemEntIndex = slot.m_Item;
		// displayPanel.panelId = panelId;
		displayPanel.m_IsEquipment = true;
		displayPanel.itemname = Abilities.GetAbilityName(slot.m_Item);
		displayPanel.m_DragCompleted = false;

		dragCallbacks.displayPanel = displayPanel;
		dragCallbacks.offsetX = 0;
		dragCallbacks.offsetY = 0;
	}
}
function OnDragEnd( slot, draggedPanel ) {
	if ( !draggedPanel.m_DragCompleted )
	{
		Game.DropItemAtCursor( Players.GetLocalHero(), draggedPanel.m_ItemEntIndex );
	}

	draggedPanel.DeleteAsync(0);
	// var slot = m_EquipmentsTable[panelId]
	slot.SetHasClass('drag_start',false);
}

function OnMouseOver(slot) {
	if (slot.m_Item > 0) {
		slot.FindChild('tooltip').ShowTooltip("ItemIndex="+slot.m_Item);
	}
}

function OnMouseOut(slot) {
	slot.FindChild('tooltip').HideTooltip();
}

function OnContextMenu(slot) {
	if (slot.m_Item <= 0) return;

	var list = [
		{
			name: '#xxwar_equipments_unequip',
			func: OnDoubleClick,
			args: [slot],
		},
	];

	list.push({
		name: '#DOTA_BackpackDiscard',
		func: OnDiscard,
		args: [slot],
	});

	GameUI.ShowBaseContextMenu(slot, 'right', list, 200);
}

function OnDiscard(slot) {
	GameEvents.SendCustomGameEventToServer("xxwar_equipments_discard",{'slot':slot.m_Index});
}

function OnDoubleClick(slot) {
	OnMouseOut(slot)
	GameEvents.SendCustomGameEventToServer('xxwar_bag_unload_equipment',{ bagName:BAG_NAME_COMMON, inventorySlot:slot.m_Index });
	// Game.EmitSound("CustomGameUI.ItemDropToPublicStash");
}

// 注册拖拽事件
function RegisterSlotEvent(slot) {
	slot.SetDraggable(true);
	$.RegisterEventHandler( 'DragEnter', slot, OnDragEnter );
	$.RegisterEventHandler( 'DragDrop', slot, OnDragDrop );
	$.RegisterEventHandler( 'DragLeave', slot, OnDragLeave );
	$.RegisterEventHandler( 'DragStart', slot, OnDragStart );
	$.RegisterEventHandler( 'DragEnd', slot, OnDragEnd );

	slot.SetPanelEvent('oncontextmenu', function() {
		OnContextMenu(slot);
	});
	slot.SetPanelEvent('onmouseover', function() {
		OnMouseOver(slot);
	});
	slot.SetPanelEvent('onmouseout', function() {
		OnMouseOut(slot);
	});
	slot.SetPanelEvent('ondblclick', function() {
		OnDoubleClick(slot);
	});
}

function AutoUpdateInventory() {
	var hero = Players.GetLocalHero();
	if(hero > 0) {
		for (var i = 0; i < 6; i++) {
			var item = Entities.GetItemInSlot(hero, i);
			var itemname = Abilities.GetAbilityName(item);
			var slot = m_Equipments[i];

			slot.FindChildTraverse("item-img").itemname = itemname;
			slot.m_Item = item;

			var isInCD = !Abilities.IsCooldownReady(item);
			slot.FindChild('cooldown').SetHasClass('is-in-cd', isInCD);

			if (isInCD) {
				var cd = Abilities.GetCooldownTimeRemaining(item);
				var deg = -360 * (cd / Abilities.GetCooldown(item));
				deg = (isFinite(deg))? deg : 0;
				slot.FindChild('cooldown').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
			}
		}
	}

	$.Schedule(0.1, AutoUpdateInventory);
}

GameUI.Euipment_ActiveItems = function(itemList) {
	GameUI.Equipment_InactiveAllItems();
	var hero = Players.GetLocalHero();
	let notFindItems = [];
	let usedHash = {};
	for (let index = 0; index < itemList.length; ++index) {
		let itemName = itemList[index];
		let isFind = false;
		for (let i = 0; i < 6; ++i) {
			if (usedHash[i]) { continue;}
			let slot = m_Equipments[i];
			let item = Entities.GetItemInSlot(hero,i);
			let itemname = Abilities.GetAbilityName(item);
			if (item > 0 && itemname == itemName) {
				let img = slot.FindChild("item-img")
				img.SetHasClass("is-compose-active",true);
				isFind = true;
				usedHash[i] = true;
				break;
			}
		}
		if (!isFind) {
			notFindItems.push(itemName);
		}
	}
	return notFindItems;
	
}
GameUI.Equipment_InactiveAllItems = function() {
	for (let i = 0; i < 6; ++i) {
		let slot = m_Equipments[i];
		let img = slot.FindChild("item-img")
		if (img) {
			img.SetHasClass("is-compose-active",false);
		}
	}
}

;(function(){
	for (var i = 0; i < 6; i++) {
		var slot = $.CreatePanel("Panel",$("#EquipmentsItemList"),"EquipmentSlot"+i);
		slot.BLoadLayoutSnippet('equipment');
		slot.m_Item = -1;
		slot.m_Index = i;
		// m_EquipmentsTable["EquipmentSlot"+i] = slot;

		var tooltip = slot.FindChild('tooltip');
		tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
		tooltip.Setup("item");

		m_Equipments.push(slot);
		RegisterSlotEvent(slot);

		switch(i)
		{
			case 0:
				slot.FindChild('item-img').AddClass("hat");
				break;
			case 1:
				slot.FindChild('item-img').AddClass("clothes");
				break;
			case 2:
				slot.FindChild('item-img').AddClass("shoes");
				break;
			case 3:
				slot.FindChild('item-img').AddClass("gloves");
				break;
			case 4:
				slot.FindChild('item-img').AddClass("trinket");
				break;
			case 5:
				slot.FindChild('item-img').AddClass("weapon");
				break;	
		}
	}

	AutoUpdateInventory();
})()
