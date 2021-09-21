"use strict";

var m_TooltipPanel;

function SetupTooltip() {
	var itemname = $.GetContextPanel().GetAttributeString("itemname","");
	if (itemname.length > 0) {
		$("#ItemList").visible = false;
		$("#Loading").visible = true;
		GameEvents.SendCustomGameEventToServer('avalon_get_item_tooltip_data_for_kv',{'itemname':itemname});
	}
}

function ItemTooltipResponse(data) {
	if (m_TooltipPanel.BIsTransparent()) return;

	var itemname = $.GetContextPanel().GetAttributeString("itemname","");
	if (itemname !== data.itemname) return;
	$("#ItemList").visible = true;
	$("#Loading").visible = false;

	GameUI.SimplifyAbilitySpecial(data.kv["AbilitySpecial"]);

	var Item1 = $("#Item1");
	var Item2 = $("#Item2");

	Item1.DisplayItemInfoForKv(itemname, data.config, data.kv);

	if (data.compareItem1) {
		GameUI.SimplifyAbilitySpecial(data.compareItem1_Specials);
		
		Item2.DisplayItemInfo(data.compareItem1, data.compareItem1_Config, data.compareItem1_Specials,data.compareItem1_CustomAttributes, 
			data.compareItem1_CustomData, true);
		Item2.CompareItem(itemname, data.compareItem1, data.kv["AbilitySpecial"], data.compareItem1_Specials);
		Item2.visible = true;
	}
	else{
		$("#Item2").visible = false;
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
	GameEvents.Subscribe("avalon_get_item_tooltip_data_for_kv_response",ItemTooltipResponse);
	$.GetContextPanel().GetParent().FindChild('LeftArrow').visible = false;
	$.GetContextPanel().GetParent().FindChild('RightArrow').visible = false;
	m_TooltipPanel.FindChild('TopArrow').visible = false;
	m_TooltipPanel.FindChild('BottomArrow').visible = false;
})()
