"use strict";

var ITEM_QUALITY_D = 1;
var ITEM_QUALITY_C = 2;
var ITEM_QUALITY_B = 3;
var ITEM_QUALITY_A = 4;
var ITEM_QUALITY_S = 5;
var ITEM_QUALITY_Z = 6;
var ITEM_QUALITY_EX = 7;

var ITEM_KIND_MATERIAL = 0;
var ITEM_KIND_WEAPON = 1;
var ITEM_KIND_SHOES = 2;
var ITEM_KIND_CLOTHES = 3;
var ITEM_KIND_HAT = 4;
var ITEM_KIND_TRINKET = 5;
var ITEM_KIND_GLOVES = 6;
var ITEM_KIND_CONSUMABLE = 7;

var m_ItemKindTexts = [];
m_ItemKindTexts[ITEM_KIND_MATERIAL] = "item_kind_material";
m_ItemKindTexts[ITEM_KIND_WEAPON] = "item_kind_weapon";
m_ItemKindTexts[ITEM_KIND_SHOES] = "item_kind_shoes";
m_ItemKindTexts[ITEM_KIND_CLOTHES] = "item_kind_clothes";
m_ItemKindTexts[ITEM_KIND_HAT] = "item_kind_hat";
m_ItemKindTexts[ITEM_KIND_TRINKET] = "item_kind_trinket";
m_ItemKindTexts[ITEM_KIND_GLOVES] = "item_kind_gloves";
m_ItemKindTexts[ITEM_KIND_CONSUMABLE] = "item_kind_consumable";

var m_ItemQualityTexts = [];
m_ItemQualityTexts[ITEM_QUALITY_D] = "D";
m_ItemQualityTexts[ITEM_QUALITY_C] = "C";
m_ItemQualityTexts[ITEM_QUALITY_B] = "B";
m_ItemQualityTexts[ITEM_QUALITY_A] = "A";
m_ItemQualityTexts[ITEM_QUALITY_S] = "S";
m_ItemQualityTexts[ITEM_QUALITY_Z] = "Z";
m_ItemQualityTexts[ITEM_QUALITY_EX] = "EX";

var m_TooltipPanel = null;

var m_AttributeList = [
	"str", "agi", "int", "primary", "hp", "mana", "armor", "magic_armor", "health_regen", "health_regen_pct", "mana_regen",
	"attack_speed", "move_speed", "damage_outgoing", "incoming_damage", "magic_find",
	"cleave", "corruption", "crit_chance", "stun", "doom", "hujiadaofa", "finger_death", "battle_trance",
	"damage_block", "evasion", "attack_return", "bagua", "shivas", "zhiheng", "pet_armor", "pet_cooldown",
	"pierce_chance", "bonus_vision", "exp_gain", "crit_mult", "mowang", "kuihua", "wuguang", "lianhuan",
	"collection", "gold_gain", "pet_duration", "shuriken", "refraction", "tanxian",
	"teleport", "hp_regen_amplify", "outgoing_damage", "jump_length", "jump_cooldown", "wind_agi", "kick_damage",
	"mana_regen_pct", "crazy_pet", "flame", "explosion", "hex_duration",
];

var m_SpecialKeys = [
	"bonus_strength",
	"bonus_agility",
	"bonus_intellect",
	"bonus_primary",
	"bonus_all_stats",
	"bonus_health",
	"bonus_health_regen_pct",
	"bonus_health_percent",
	"bonus_mana",
	"bonus_armor",
	"bonus_magic_armor",
	"bonus_attack_speed",
	"bonus_movement_speed",
	"bonus_damage",
	"bonus_spell_amplify",
	"bonus_spell_lifesteal",
	"bonus_spell_range",
	"bonus_attack_range",
	"bonus_status_resistance",
	"bonus_hit_hp",
	"bonus_hit_mp",
	"bonus_cooldown_reduction",
	"bonus_creep_damage",
];

var m_CompareSpecialKeys = [...m_SpecialKeys];

function DisplayItemInfo(itemIndex, config, specials, CustomAttributes, CustomData, isEquipped) {
	var itemname = Abilities.GetAbilityName(itemIndex);
	var mainPanel = $.GetContextPanel();
	var itemInfoContent = $("#item-info-content")

	SetFromItemName(itemname, config, specials, CustomAttributes, CustomData)
	$("#current-equipment-title-panel").SetHasClass("IsEquipped",isEquipped === true);

	if (config) {
		mainPanel.SetDialogVariable("kind", $.Localize(m_ItemKindTexts[config.kind] || "item_kind_normal"));
		$("#item-quality").SetImage("file://{images}/custom_game/tooltips/" + m_ItemQualityTexts[config.quality] + ".png")
		$.GetContextPanel().SetHasClass(m_ItemQualityTexts[config.quality],true)

		var charges = (Items.IsStackable(itemIndex))? Items.GetCurrentCharges(itemIndex) : 1;
		var amount = config.price;
		amount = "</font><font color='#FFE868'>" + (amount*charges).toString() + "</font>";
		$('#item-gold').text = "<font color='#67A8FF'>" + $.Localize("xxwar_item_price").replace("%s1",amount);
		$("#txtComposable").text = config.composable == "1" ? $.Localize("xxwar_composable_yes") :$.Localize("xxwar_composable_no");
	}
	else{
		$("#item-quality").SetImage("file://{images}/custom_game/tooltips/E.png")
		mainPanel.SetDialogVariable("kind",$.Localize("item_kind_normal"));

		var amount = "</font><font color='#FFE868'>0</font>";
		$('#item-gold').text = "<font color='#67A8FF'>" + $.Localize("xxwar_item_price").replace("%s1",amount);
		$("#txtComposable").text = $.Localize("xxwar_composable_no");
	}
}

function DisplayItemInfoForKv(itemname, config, kv) {
	var mainPanel = $.GetContextPanel();
	var itemInfoContent = $("#item-info-content")

	SetFromItemName(itemname, config, kv["AbilitySpecial"], null, null)
	$("#current-equipment-title-panel").SetHasClass("IsEquipped",false);

	/*
	 * 配置信息
	 */
	if (config) {
		mainPanel.SetDialogVariable("kind", $.Localize(m_ItemKindTexts[config.kind] || "item_kind_normal"));
		$("#item-quality").SetImage("file://{images}/custom_game/tooltips/" + m_ItemQualityTexts[config.quality] + ".png")
		$.GetContextPanel().SetHasClass(m_ItemQualityTexts[config.quality],true)

		var amount = config.price;
		amount = "</font><font color='#FFE868'>" + amount + "</font>";
		mainPanel.FindChildTraverse('item-gold').text = "<font color='#FFC318'>" + $.Localize("xxwar_item_price").replace("%s1",amount);
		$("#txtComposable").text = config.composable == "1" ? $.Localize("xxwar_composable_yes") :$.Localize("xxwar_composable_no");
	}
	else{
		$("#item-quality").SetImage("file://{images}/custom_game/tooltips/E.png")
		mainPanel.SetDialogVariable("kind",$.Localize("item_kind_normal"));

		var amount = "</font><font color='#FFE868'>0</font>";
		mainPanel.FindChildTraverse('item-gold').text = "<font color='#FFC318'>" + $.Localize("xxwar_item_price").replace("%s1",amount);
		$("#txtComposable").text = $.Localize("xxwar_composable_no");
	}
}

function RenderItemDescription(description, specials) {
	var str = $.Localize(description);

	var attrs = str.match(/%([a-zA-Z_0-9])+%/g)
	if (attrs) {
		for (var i = attrs.length - 1; i >= 0; i--) {
			var s = attrs[i];
			var name = s.substr(1,s.length-2);
			if (specials[name]<0) {
				specials[name] = -specials[name];
			}
			str = str.replace(s,"<font color='#FFBB1E'>"+specials[name]+"</font>")
		}
	}
	str = str.replace(/%%/g,"<font color='#FFBB1E'>%</font>");
	return str;
}

function SetFromItemName(itemname, config, specials, customAttributes, CustomData) {
	var mainPanel = $.GetContextPanel();

	var dislplayName = "#DOTA_Tooltip_ability_" + itemname;
	var itemNameLabel = $("#item-name")
	var itemInfoContent = $("#item-info-content")
	var description = $("#item-description")

	itemNameLabel.text = dislplayName;
	$("#item-img").itemname = itemname;
	$("#item-compare").visible = false;
	$("#item-compare-panel").visible = false;
	$("#txtComposable").text = config && config.composable == "1" ? $.Localize("xxwar_composable_yes") :$.Localize("xxwar_composable_no");
	description.text = RenderItemDescription(dislplayName + "_Description", specials);
	description.visible = description.text !== "";

	for(var i in m_ItemQualityTexts) {
		$.GetContextPanel().SetHasClass(m_ItemQualityTexts[i],false)
	}

	/*
	 * 特殊值
	 */
	var AbilitySpecialPanel = itemInfoContent.FindChild("AbilitySpecial");
	var AbilitySpecialPanelIndex = 0;
	AbilitySpecialPanel.visible = !!specials;
	if (specials) {
		m_SpecialKeys.forEach(function (k) {
			if (!specials[k]) return;

			var label = AbilitySpecialPanel.GetChild(AbilitySpecialPanelIndex++);

			if (!label) {
				label = $.CreatePanel('Label',AbilitySpecialPanel,'');
				label.html = true;
				label.AddClass("item-specials-label")
			}

			var str = "xxwar_ability_special_" + k;
			var key = $.Localize(str);

			var percent = "";
			if (key.indexOf("%") == 0)
			{
				percent = "%";
				key = key.replace(percent,"");
			}

			var text = key;

			var numVal = specials[k];
			if(!isNaN(numVal)) {
				numVal = parseFloat(numVal);
			}

			var value = numVal + percent;
			value = value.replace("-","");

			if (key.search(/(\:|：)/) > 0 ) {
				text += "<font color=\"#FCBB00\"> " + value + "</font>";
			}
			else {
				text += "<font color=\"#FCBB00\"> +" + value + "</font>";
			}

			label.text = text;
			label.visible = true;
		})
	}
	var max_count = AbilitySpecialPanel.GetChildCount();
	for (var i = AbilitySpecialPanelIndex; i < max_count; i++) {
		var label = AbilitySpecialPanel.GetChild(i);
		label.visible = false;
	}

	/*
	 * 显示自定义属性
	 */
	var CustomAttributesPanel = itemInfoContent.FindChild("CustomAttributesPanel");
	var CustomAttributesList = CustomAttributesPanel.FindChild("CustomAttributes");
	var CustomAttributesPanelIndex = 0;
	var hasShowCustomAttributes = false;

	if (customAttributes) {
		m_AttributeList.forEach(function (name) {
			var value = customAttributes[name];
			if (!value) return;

			var label = CustomAttributesList.GetChild(CustomAttributesPanelIndex++);

			if (!label) {
				label = $.CreatePanel('Label',CustomAttributesList,'');
				label.html = true;
				label.AddClass("item-specials-label");
			}

			var text = $.Localize("xxwar_attribute_" + name);
			var percent = "";
			if (text.indexOf("%") === 0) {
				text = text.substr(1, text.length);
				percent = "%";
			}

			var numValue = Math.abs(value).toFixed(2);
			label.text = text + "<font color=\"#FCBB00\"> +" + parseFloat(numValue) + percent + "</font>";
			label.visible = true;
			hasShowCustomAttributes = true;
		})
	}

	var max_count = CustomAttributesList.GetChildCount();
	for (var i = CustomAttributesPanelIndex; i < max_count; i++) {
		var label = CustomAttributesList.GetChild(i);
		label.visible = false;
	}

	CustomAttributesPanel.visible = hasShowCustomAttributes;
}

function GetTotalValue(name, specials, compareItemSpecials) {
	var sv1 = specials[name] || 0;
	var sv2 = compareItemSpecials[name] || 0;
	return sv1 - (sv2 || 0);
}

function CompareItem(itemname, compareItemIndex, specials, compareItemSpecials) {
	if (!specials || !compareItemSpecials) return;

	var AttributesGainAndLoss = $("#item-compare-panel")

	// 属性比较
	var AttributesGainAndLossIndex = 0;
	var hasChange = false;
	m_CompareSpecialKeys.sort(function (a,b) {
		if (a == b) return 0;
		var aa = GetTotalValue(a, specials, compareItemSpecials);
		var bb = GetTotalValue(b, specials, compareItemSpecials);
		if (aa == bb) return 0;
		if (aa > bb) return 1;
		if (aa < bb) return -1;
	})
	m_CompareSpecialKeys.forEach(function (name) {
		var label = AttributesGainAndLoss.GetChild(AttributesGainAndLossIndex++);

		if (!label) {
			var label = $.CreatePanel("Label",AttributesGainAndLoss,"");
			label.html = true;
			label.AddClass("item-specials-label");
		}

		var value = GetTotalValue(name,specials,compareItemSpecials);
		if (value === undefined || value === null || value === NaN || value === 0) return AttributesGainAndLossIndex--;

		if(!isNaN(value)) {
			value = parseFloat(value.toFixed(2));
		}

		hasChange = true;

		var text = $.Localize("xxwar_ability_special_" + name);
		var percent = "";

		if (text.indexOf("%") === 0) {
			text = text.substr(1,text.length);
			percent = "%";
		}

		if (value>=0) {
			label.text = text + "<font color='#00ED60'> +" + value + percent + "</font>";
		}
		else{
			label.text = text + "<font color='#FF1409'> " + value + percent + "</font>";
		}

		label.SetHasClass("suit-name",false);
		label.SetHasClass("text-line-through",false);
		label.visible = true;
	})

	var max = AttributesGainAndLoss.GetChildCount();
	var visibleCount = max;
	for (var i = AttributesGainAndLossIndex; i < max; i++) {
		AttributesGainAndLoss.GetChild(i).visible = false;
		visibleCount = visibleCount - 1;
	}

	if(visibleCount > 0) {
		$("#item-compare").visible = true;
		$("#item-compare-panel").visible = true;
		$("#ComposablePanel").visible = false;
	} else {
		$("#item-compare").visible = false;
		$("#item-compare-panel").visible = false;
		$("#ComposablePanel").visible = true;
	}

	AttributesGainAndLoss.visible = hasChange;
}

;(function(){
	$.GetContextPanel().DisplayItemInfo = DisplayItemInfo;
	$.GetContextPanel().DisplayItemInfoForKv = DisplayItemInfoForKv;
	$.GetContextPanel().CompareItem = CompareItem;
})()
