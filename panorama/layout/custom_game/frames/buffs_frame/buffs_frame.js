"use strict";

var	TOOLTIP_POSITION_TOP = 1;
var TOOLTIP_POSITION_BOTTOM = 2;
var BuffTargetUnit = Players.GetLocalPlayerPortraitUnit();
var TooltipPositon = TOOLTIP_POSITION_TOP

function OnMouseOver(buffPanel) {
	$.DispatchEvent('DOTAShowBuffTooltip',buffPanel,buffPanel.hero,buffPanel.m_BuffSerial,Entities.IsEnemy( buffPanel.hero ));
}

function OnMouseOut(buffPanel) {
	$.DispatchEvent('DOTAHideBuffTooltip');
}

function UpdateBuff(buffPanel, hero, buffSerial) {
	var nNumStacks = Buffs.GetStackCount( hero, buffSerial );
	buffPanel.SetHasClass("is_debuff", Buffs.IsDebuff( hero, buffSerial ) );
	buffPanel.SetHasClass("has_stacks", ( nNumStacks > 0 ) );
	buffPanel.FindChildTraverse('stack-count').text = nNumStacks;
	buffPanel.m_BuffSerial = buffSerial;
	buffPanel.hero = hero;
	buffPanel.SetHasClass("is_item", false);
	var buffTexture = Buffs.GetTexture( hero, buffSerial );

	var ability = Buffs.GetAbility(hero, buffSerial);
	var itemPanel = buffPanel.FindChildTraverse('item');
	var abilityPanel = buffPanel.FindChildTraverse('ability');
	var buffImage = buffPanel.FindChildTraverse('buffImage');
	if(ability >= 0) {
		buffImage.visible = false;
		if (Abilities.IsItem(ability)) {
			buffPanel.SetHasClass("is_item", true);
			itemPanel.contextEntityIndex = ability;
		} else {
			if (buffTexture.indexOf("item_" ) === 0) {
				buffPanel.SetHasClass("is_item", true);
				itemPanel.contextEntityIndex = -1;
				itemPanel.itemname = buffTexture;
			} else {
				abilityPanel.contextEntityIndex = ability;	
			}
		}
	} else {
		if (buffTexture.indexOf("item_" ) === 0) {
			buffPanel.SetHasClass("is_item", true);
			itemPanel.contextEntityIndex = -1;
			itemPanel.itemname = buffTexture;
			buffImage.visible = false;
		} else {
			buffPanel.SetHasClass("is_item", false);
			abilityPanel.contextEntityIndex = -1;
			if(buffTexture != "") {
				if(buffTexture.indexOf("modifier_" ) === 0) {
					buffImage.SetImage("file://{images}/spellicons/" + buffTexture + ".png");
					buffImage.visible = true;
				} else {
					abilityPanel.abilityname = buffTexture;
					buffImage.visible = false;
				}
			}
		}
	}

	var deg = -360 * (Buffs.GetRemainingTime(hero, buffSerial) / Buffs.GetDuration(hero, buffSerial));
	deg = (isFinite(deg))? deg : 0;
	buffPanel.FindChildTraverse('CircularDuration').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
}

function RegisterEvents(buffPanel) {
	buffPanel.SetPanelEvent('onmouseover', function () {
		OnMouseOver(buffPanel);
	})
	buffPanel.SetPanelEvent('onmouseout', function () {
		OnMouseOut(buffPanel);
	})
}

function UpdateBuffs() {
	var hero = BuffTargetUnit
	if (!Entities.IsAlive(hero)) return $.Schedule(0.1, UpdateBuffs);

	var nBuffs = Entities.GetNumBuffs( hero );
	var BuffList = $("#BuffList");
	var BuffListIndex = 0;

	for (var i = 0; i < BuffList.GetChildCount(); i++) {
		BuffList.GetChild(i).checked = false;
	}

	for ( var i = 0; i < nBuffs; i++ )
	{
		var buffSerial = Entities.GetBuff( hero, i );
		if ( buffSerial == -1 )
			continue;

		if ( Buffs.IsHidden( hero, buffSerial ) )
			continue;

		var buffPanel = BuffList.GetChild(BuffListIndex++);

		if (!buffPanel) {
			buffPanel = $.CreatePanel('Panel',BuffList,'');
			buffPanel.BLoadLayoutSnippet('buff');
			RegisterEvents(buffPanel);
		}

		UpdateBuff(buffPanel, hero, buffSerial);
		buffPanel.visible = true;
		buffPanel.checked = true;
		if(TooltipPositon == 2){
			buffPanel.style.tooltipPosition = "bottom";
		}
	}

	for (var i = 0; i < BuffList.GetChildCount(); i++) {
		let pnl = BuffList.GetChild(i);
		if(pnl && pnl.checked == false) {
			pnl.visible = false;
		}
	}

	$.Schedule(0.1, UpdateBuffs);
}

;(function(){
	UpdateBuffs();
	$.GetContextPanel().SetTargetUnit = function(target, tooltipPositon){
		BuffTargetUnit = target;
		TooltipPositon = tooltipPositon;
	}
})()
