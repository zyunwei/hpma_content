"use strict";

var m_AttributeList = [
	"attack_speed",
	"attack_damage",
	"attack_range",
	"move_speed",
	"spell_amp",
	"status_resistance",
	"evasion",
	"str",
	"agi",
	"int",
	"crystal_regen",
	"hp",
	"mana",
	"armor",
	"magic_armor",
	"health_regen",
    "mana_regen",
	"magic_find",
	"gold_gain",
	"exp_gain",
	"crit_chance",
	"crit_mult",
];

function SetupTooltip() {
	var HeroIndex = $.GetContextPanel().GetAttributeInt("HeroIndex",-1);
	if (HeroIndex === -1) {
		HeroIndex = Players.GetLocalHero();
	}

	var ContextPanel = $.GetContextPanel();

	/*
	 * 属性
	 */
	var StatisticalAttributes = CustomNetTables.GetTableValue("CustomAttributes", "StatisticalAttributes_"+String(HeroIndex));

	if (StatisticalAttributes) {
		for(var name in StatisticalAttributes){
			var attrVal = parseFloat(StatisticalAttributes[name].toFixed(2));
			ContextPanel.SetDialogVariable(name, attrVal);

			if (name === 'attack_damage') {
				var bonusDamage = Entities.GetDamageBonus(HeroIndex)
				if(bonusDamage > 0) {
					ContextPanel.SetDialogVariable(name, attrVal + "+" + bonusDamage);	
				} else if(bonusDamage < 0) {
					ContextPanel.SetDialogVariable(name, attrVal + bonusDamage);	
				}
			}
		}
	}
}

function SetAttrPanel(mainPanel, i) {
	var name = m_AttributeList[i];
	if(!name) return;

	var panel = $.CreatePanel("Panel",mainPanel,"");
	panel.BLoadLayoutSnippet('attribute-panel');

	var text = $.Localize("xxwar_attribute_" + name);
	var isPercentage1 = false;

	if (text.indexOf("%") === 0) {
		text = text.substr(1,text.length);
		isPercentage1 = true;
	}

	panel.FindChildTraverse("attribute-name").text = text;
	panel.FindChildTraverse("attribute-value").text = "#xxwar_attribute_" + name + "_value";
	if(isPercentage1) {
		panel.FindChildTraverse("attribute-val2").text = "%";
	}
}

;(function(){
	var HeroAttributes = $("#HeroAttributes");
	var mainPanel;
	var len = Math.ceil(m_AttributeList.length/2);
	var index = 0;
	for (var i = 0; i < len; i++) {
		mainPanel = $.CreatePanel("Panel",HeroAttributes,"");
		mainPanel.AddClass("line");

		SetAttrPanel(mainPanel, i);
		SetAttrPanel(mainPanel, i+len);
	}

	$.GetContextPanel().SetupTooltip = SetupTooltip;
})()
