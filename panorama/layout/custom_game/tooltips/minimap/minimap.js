"use strict";

var m_LastItemName = "";

function SetupTooltip() {
	$("#Point").SetHasClass(m_LastItemName,false);

	var itemname = $.GetContextPanel().GetAttributeString("itemname","");
	$("#ItemName").text = $.Localize("DOTA_Tooltip_ability_" + itemname);
	$("#Point").SetHasClass(itemname,true);
	m_LastItemName = itemname;
}

;(function(){
})()
