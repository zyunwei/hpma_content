"use strict";

var m_TooltipPanel;

function SetupTooltip() {
	var itemIndex = $.GetContextPanel().GetAttributeInt("ItemIndex",-1);
	if (itemIndex > 0) {
		$("#ItemList").visible = false;
		$("#Loading").visible = true;
		GameEvents.SendCustomGameEventToServer('avalon_get_item_tooltip_data',{'item':itemIndex});
	}
}

function ItemTooltipResponse(data) {
	if (m_TooltipPanel.BIsTransparent()) return;

	var itemIndex = $.GetContextPanel().GetAttributeInt("ItemIndex",-1);
	if (itemIndex !== data.item) return;
	$("#ItemList").visible = true;
	$("#Loading").visible = false;
	if(!data.specials) data.specials = {};
	data.specials["cooldown"] = {"var_type": "FIELD_FLOAT", "AbilityCooldown": data.cooldown};
	GameUI.SimplifyAbilitySpecial(data.specials);
	
	var Item1 = $("#Item1");
	var Item2 = $("#Item2");
	Item1.DisplayItemInfo(itemIndex, data.config, data.specials,data.custom_attributes, data.custom_data, false);

	if (data.compareItem1) {
		GameUI.SimplifyAbilitySpecial(data.compareItem1_Specials);
		data.compareItem1_Specials["cooldown"] = {"var_type": "FIELD_FLOAT", "AbilityCooldown": data.compareItem1_cooldown};
		Item2.DisplayItemInfo(data.compareItem1, data.compareItem1_Config, data.compareItem1_Specials,data.compareItem1_CustomAttributes, 
			data.compareItem1_CustomData, true);
		Item2.CompareItem(Abilities.GetAbilityName(itemIndex), data.compareItem1, data.specials, data.compareItem1_Specials);
		Item2.visible = true;
	} else {
		Item2.visible = false;
	}

	if (Item2.visible) {
		var len = Item1.actuallayoutwidth;
		if (Item2.visible) {
			len += Item2.actuallayoutwidth;
		}

        var pos = GameUI.GetCursorPosition();
        var w = Game.GetScreenWidth();
        if ((pos[0] + len) >= w) {
            $("#ItemList").MoveChildAfter(Item1,Item2);
        } else {
	        $("#ItemList").MoveChildBefore(Item1,Item2);
	    }
	}
	
	var resetFunc = GameUI.m_TooltipManagerResetFuncs[$.GetContextPanel().GetAttributeString("ResetKey","")];
	if (resetFunc) {
		resetFunc();
	}
}

;(function(){
	$("#Item1").BLoadLayout("file://{resources}/layout/custom_game/templates/item_tooltip/item_tooltip.xml",false,false);
	$("#Item2").BLoadLayout("file://{resources}/layout/custom_game/templates/item_tooltip/item_tooltip.xml",false,false);

	m_TooltipPanel = $.GetContextPanel().GetParent().GetParent();
	GameEvents.Subscribe("avalon_get_item_tooltip_data_response",ItemTooltipResponse);
	$.GetContextPanel().GetParent().FindChild('LeftArrow').visible = false;
	$.GetContextPanel().GetParent().FindChild('RightArrow').visible = false;
	m_TooltipPanel.FindChild('TopArrow').visible = false;
	m_TooltipPanel.FindChild('BottomArrow').visible = false;
})()
