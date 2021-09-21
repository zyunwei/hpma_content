"use strict";

var m_Item = -1;
var m_ItemName = "";
var m_UnqiueStr = "TooltipManager" + (Math.random() * 9999 + Game.Time()).toString();
var m_IsHideTooltip = false;
var m_DefaultTooltipText = "";
var m_StackCount = 0;

$.GetContextPanel().SetItem = function (itemIndex) {
	m_Item = itemIndex;
	m_ItemName = Abilities.GetAbilityName(itemIndex);
	$("#ItemImage").itemname = m_ItemName;
	var ItemCharges = $("#ItemCharges");

	if (Items.IsStackable(itemIndex)) {
		ItemCharges.text = Items.GetCurrentCharges(itemIndex);
		ItemCharges.visible = true;
	}
	else {
		ItemCharges.visible = false;
	}
}

$.GetContextPanel().GetItem = function () {
	return m_Item;
}

$.GetContextPanel().SetStackCount = function (count) {
	m_StackCount = count;
	$("#ItemCharges").text = count;
	$("#ItemCharges").visible = true;
}

$.GetContextPanel().GetStackCount = function () {
	return m_StackCount;
}

$.GetContextPanel().SetItemName = function (itemname) {
	m_Item = -1;
	m_ItemName = itemname;
	$("#ItemImage").itemname = itemname;
	$("#ItemCharges").visible = false;
}

$.GetContextPanel().GetItemName = function () {
	return m_ItemName;
}

$.GetContextPanel().SetDefaultImage = function (index) {
	$("#ItemImage").AddClass("default"+index);
}

$.GetContextPanel().SetDefaultTooltipText = function (text) {
	m_DefaultTooltipText = text;
}

function OnMouseOver() {
	if (m_Item > 0) {
		m_IsHideTooltip = false;
		$.DispatchEvent("UIShowCustomLayoutParametersTooltip", "item",
			"file://{resources}/layout/custom_game/tooltips/item/item.xml",
			"ItemIndex=" + m_Item + "&ResetKey=" + m_UnqiueStr);
	}
	else if(m_ItemName){
		m_IsHideTooltip = false;
		$.DispatchEvent("UIShowCustomLayoutParametersTooltip", "item_for_kv",
			"file://{resources}/layout/custom_game/tooltips/item_for_kv/item_for_kv.xml",
			"itemname=" + m_ItemName + "&ResetKey=" + m_UnqiueStr);
	}
	else if (m_DefaultTooltipText) {
		$.DispatchEvent("DOTAShowTextTooltip", $.Localize(m_DefaultTooltipText));
	}
}

function OnMouseOut() {
	m_IsHideTooltip = true;
	$.DispatchEvent( "UIHideCustomLayoutTooltip", "item");
	$.DispatchEvent( "UIHideCustomLayoutTooltip", "item_for_kv");
	$.DispatchEvent( "DOTAHideTextTooltip" );
}

;(function(){
	$.GetContextPanel().OnMouseOut = OnMouseOut;
	GameUI.m_TooltipManagerResetFuncs[m_UnqiueStr] = function() {
		if(m_IsHideTooltip)return;
		if (m_Item > 0) {
			$.DispatchEvent("UIShowCustomLayoutTooltip","item","file://{resources}/layout/custom_game/tooltips/item/item.xml");
		} else {
			$.DispatchEvent("UIShowCustomLayoutTooltip","item_for_kv","file://{resources}/layout/custom_game/tooltips/item_for_kv/item_for_kv.xml");
		}
	}
})()
