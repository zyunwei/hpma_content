"use strict";

var m_AttributeList = [
	"attack_speed",
	"attack_damage",
	"attack_range",
	"move_speed",
	"str",
	"agi",
	"int",
	"spell_amp",
	"status_resistance",
	"evasion",
	"hp",
	"mana",
	"armor",
	"magic_armor",
	"health_regen",
    "mana_regen",
];

function GetAttrFromTable(heroIndex, attrName) {
	var petAttributes = CustomNetTables.GetTableValue("PetAttributes", String(heroIndex));
	if(petAttributes) {
		return petAttributes[attrName];
	}
	return 0;
}

function SetupTooltip() {
	var heroIndex = $.GetContextPanel().GetAttributeInt("HeroIndex", -1);
	if (heroIndex === -1) {
		return;
	}

	var ContextPanel = $.GetContextPanel();
	for(var i in m_AttributeList) {
		var name = m_AttributeList[i];
		switch(name) {
			case "str":
			case "agi":
			case "int":
			case "spell_amp":
			case "status_resistance":
			case "evasion":
			case "attack_speed":
				ContextPanel.SetDialogVariable(name, GetAttrFromTable(heroIndex, name));
				break;
			case "attack_damage":
				var baseDamage = Math.round(Entities.GetDamageMin(heroIndex) + Entities.GetDamageMax(heroIndex) * 0.5);
				var bonusDamage = Entities.GetDamageBonus(heroIndex);
				if(bonusDamage < 0) {
					ContextPanel.SetDialogVariable(name, baseDamage + bonusDamage);
				} else if (bonusDamage > 0) {
					ContextPanel.SetDialogVariable(name, baseDamage + "+" + bonusDamage);
				} else {
					ContextPanel.SetDialogVariable(name, baseDamage);
				}
				break;
			case "attack_range":
				var val = Math.round(Entities.GetAttackRange(heroIndex));
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "move_speed":
				var val = Math.round(Entities.GetMoveSpeedModifier(heroIndex, Entities.GetBaseMoveSpeed(heroIndex)));
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "hp":
				var val = Math.round(Entities.GetHealth(heroIndex)) + " / " + Math.round(Entities.GetMaxHealth(heroIndex));
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "mana":
				var val = Math.round(Entities.GetMana(heroIndex)) + " / " + Math.round(Entities.GetMaxMana(heroIndex));
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "armor":
				ContextPanel.SetDialogVariable(name, GetAttrFromTable(heroIndex, name));
				// var val = parseFloat(Entities.GetPhysicalArmorValue(heroIndex)).toFixed(2);
				// ContextPanel.SetDialogVariable(name, val);
				break;
			case "magic_armor":
				var val = parseFloat(Entities.GetMagicalArmorValue(heroIndex) * 100).toFixed(2);
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "health_regen":
				var val = parseFloat(Entities.GetHealthThinkRegen(heroIndex)).toFixed(2);
				ContextPanel.SetDialogVariable(name, val);
				break;
			case "mana_regen":
				var val = parseFloat(Entities.GetManaThinkRegen(heroIndex)).toFixed(2);
				ContextPanel.SetDialogVariable(name, val);
				break;
			default:
				ContextPanel.SetDialogVariable(name, "0");
				break;
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
	var PetAttributes = $("#PetAttributes");
	var mainPanel;
	var len = Math.ceil(m_AttributeList.length/2);
	var index = 0;
	for (var i = 0; i < len; i++) {
		mainPanel = $.CreatePanel("Panel", PetAttributes, "");
		mainPanel.AddClass("line");

		SetAttrPanel(mainPanel, i);
		SetAttrPanel(mainPanel, i+len);
	}

	$.GetContextPanel().SetupTooltip = SetupTooltip;
})()
