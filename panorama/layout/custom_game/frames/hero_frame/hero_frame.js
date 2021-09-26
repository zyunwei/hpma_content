"use strict";
GameUI.LoadFrame($("#HeroFrame"),'hero_frame','bottom_unit_info',true,true);

var ITEM_SLOT_START = 12;
var HotKey = {'Q':0,'W':1,'E':2,'R':3,'T':4,'G':5,"N":6,"M":7,"L":8,"O":9,"P":10,'F':11,
	'4':ITEM_SLOT_START,
	'5':ITEM_SLOT_START + 1,
	'6':ITEM_SLOT_START + 2,
	'7':ITEM_SLOT_START + 3,
	'8':ITEM_SLOT_START + 4,
	'9':ITEM_SLOT_START + 5};
var AbilityKeys = ['Q','W','E','R','T','G','N','M','L',"O","P"];
var ItemKeys = ['4','5','6','7','8','9'];
var AbilitiesChargeTime = {};

function OnNull() {}

function OnClickPortrait() {
	Players.PlayerPortraitClicked( Players.GetLocalPlayer(), false, false );
	GameUI.CloseAllFrame();
}

var heroAttrPanel = null;

GameUI.HeroFrame_OnKeyPress = function (key) {
	switch(key)
	{
		case 'Q':
		case 'W':
		case 'E':
		case 'R':
		case 'D':
		case 'F':
		case 'T':
		case 'B':
		case 'M':
		case 'N':
		case 'L':
		case 'O':
		case 'P':
		case 'Z':
		case 'G':
			AbilityPress(key);
			return;
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			ItemPress(key);
			return;
		case 'TAB':
			var tabPanel = $("#HeroAttributeTabPanel");
			if(heroAttrPanel == null) {
				heroAttrPanel = $.CreatePanel("Panel", tabPanel, "HeroAttributesPanel");
				heroAttrPanel.BLoadLayout("file://{resources}/layout/custom_game/tooltips/hero_attributes/hero_attributes.xml",false,false);
			}
			if(tabPanel.style.visibility == "visible") {
				tabPanel.style.visibility = "collapse";
			} else {
				heroAttrPanel.SetupTooltip()
				tabPanel.style.visibility = "visible";	
			}
			return;
		case 'SPACE':
			if(typeof(GameUI.SpaceClickSwapItem) === "function"){
			 	GameUI.SpaceClickSwapItem();
			}
			return;
	}
}


function HideAttrPanel() {
	var tabPanel = $("#HeroAttributeTabPanel");
	tabPanel.style.visibility = "collapse";
}

function AbilityPress(key) {
	var hero = Players.GetLocalPlayerPortraitUnit();
	if (Players.GetLocalHero() !== hero) {
		return;
	}

	var abilityPanelList = $("#AbilityList");
	for (var i = 0; i <= 4; i++) {
		var panel = abilityPanelList.GetChild(i);
		if (panel && panel.visible == true && panel.HotKey== key) {
			var ability = Entities.GetAbilityByName(hero, panel.m_AbilityName);
			if(ability) {
				if(GameUI.IsAltDown()){
					Abilities.PingAbility(ability);
					return;
				}

				Abilities.ExecuteAbility(ability, hero, false);
			}
		}
	}
}

function ItemPress(key) {
	var hero = Players.GetLocalHero();
	var ability = Entities.GetAbility(hero, HotKey[key]);
	var abilityName = Abilities.GetAbilityName(ability);
	if(abilityName == "custom_item_consumable_ability") {
		if(GameUI.HasShowFrame("ability_select") || GameUI.HasShowFrame("ability_replace")) {
		    GameUI.CloseFrame("ability_select");
    		GameUI.CloseFrame("ability_replace");
		}	
	}

	Abilities.ExecuteAbility( ability, hero, false);
}

function OnAbilityMouseOver(btn) {
	var hero = Players.GetLocalPlayerPortraitUnit();
	$.DispatchEvent( "DOTAShowAbilityTooltipForEntityIndex", btn, btn.m_AbilityName, hero );
}

function OnAbilityMouseOut(btn) {
	$.DispatchEvent( "DOTAHideAbilityTooltip");
}

function OnItemDragEnter() {

}

function OnItemDragLeave() {

}

function OnItemDragStart(item, dragCallbacks) {
	OnItemMouseOut(item);
	var hero = Players.GetLocalHero();
	var itemAbilities = CustomNetTables.GetTableValue("Common", "custom_item_spell_system_" + hero);
	if (!itemAbilities) return;

    var ItemIndex = itemAbilities[item.m_Slot + ITEM_SLOT_START];

	if (ItemIndex >= 0) {
		item.SetHasClass('drag_start',true);
		var displayPanel = $.CreatePanel('DOTAItemImage',$.GetContextPanel(),'');
		displayPanel.m_Source = "custom-item-ability";
		displayPanel.m_Slot = item.m_Slot;
		displayPanel.itemname = Abilities.GetAbilityName(ItemIndex);
		displayPanel.m_DragCompleted = false;
		dragCallbacks.displayPanel = displayPanel;
		dragCallbacks.offsetX = 0;
		dragCallbacks.offsetY = 0;
	}
}

function OnItemDragEnd(item, draggedPanel) {
	if (!draggedPanel.m_DragCompleted) {
		GameEvents.SendCustomGameEventToServer("xxwar_custom_spell_item_release",{slot:draggedPanel.m_Slot});
	}
	draggedPanel.DeleteAsync(0);
	item.SetHasClass('drag_start', false);
}

function OnItemDragDrop(item, draggedPanel) {
	switch(draggedPanel.m_Source)
	{
		case 'custom-item-ability':
		{
			GameEvents.SendCustomGameEventToServer('xxwar_custom_spell_item_swap',{slot1:item.m_Slot, slot2: draggedPanel.m_Slot});
			break;
		}
		case 'bag':
		{
			GameEvents.SendCustomGameEventToServer('xxwar_custom_spell_item_drop',{slot:item.m_Slot, item: draggedPanel.m_ItemEntIndex});
			break;
		}
	}
}

function OnItemMouseOver(btn) {
	var hero = Players.GetLocalPlayerPortraitUnit();
	if (hero === -1) {
		hero = Players.GetLocalHero();
	}

	if (Players.GetLocalHero() === hero) {
		var itemAbilities = CustomNetTables.GetTableValue("Common", "custom_item_spell_system_" + hero);
		if (!itemAbilities) return;

		var ItemIndex = itemAbilities[btn.m_Slot+ITEM_SLOT_START];

		if (ItemIndex > 0)
			btn.FindChild('cooldown').ShowTooltip("ItemIndex="+ItemIndex);
	}
	else{
		var ItemIndex = Entities.GetItemInSlot(hero,btn.m_Slot);
		if (ItemIndex > 0)
			btn.FindChild('cooldown').ShowTooltip("ItemIndex="+ItemIndex);
	}
		
}

function OnItemMouseOut(btn) {
	btn.FindChild('cooldown').HideTooltip();
}

function RegisterAbilityEvent(btn) {
	btn.SetDraggable(true);
	$.RegisterEventHandler('DragEnter', btn, OnAbilityDragEnter);
	$.RegisterEventHandler('DragLeave', btn, OnAbilityDragLeave);
	$.RegisterEventHandler('DragStart', btn, OnAbilityDragStart);
	$.RegisterEventHandler('DragEnd', btn, OnAbilityDragEnd);
	$.RegisterEventHandler('DragDrop', btn, OnAbilityDragDrop);

	btn.SetPanelEvent('onmouseover', function () {
		OnAbilityMouseOver(btn);
	})
	
	btn.SetPanelEvent('onmouseout', function () {
		OnAbilityMouseOut(btn);
	})

	btn.FindChildTraverse("ability-img").SetPanelEvent("onactivate", function(_btn){
        return function(){
        	AbilityPress(_btn.HotKey);
        }
    }(btn));

    btn.SetPanelEvent("oncontextmenu", function(_btn){
    	return function(){
			var ability = Entities.GetAbilityByName(Players.GetLocalHero(), _btn.m_AbilityName);
	    	if(ability) {
	    		GameEvents.SendCustomGameEventToServer("toggle_ability_autocast", { ability:ability });
	    	}
    	}
    }(btn));

	// if(btn.FindChildTraverse("LevelUpTab") == null) {
	// 	var panel = $.CreatePanel("Panel", btn, "LevelUpTab");
 //        panel.BLoadLayoutSnippet("level-up-tab");
	// }
}

function StudyAbility(abilityName){
	var ability = Entities.GetAbilityByName(Players.GetLocalHero(), abilityName);
	if(ability) {
		Abilities.AttemptToUpgrade(ability);
	}
}

function RegisterItemEvents(item, hotkey, slot) {
	item.SetDraggable(true);
	$.RegisterEventHandler('DragEnter', item, OnItemDragEnter);
	$.RegisterEventHandler('DragLeave', item, OnItemDragLeave);
	$.RegisterEventHandler('DragStart', item, OnItemDragStart);
	$.RegisterEventHandler('DragEnd', item, OnItemDragEnd);
	$.RegisterEventHandler('DragDrop', item, OnItemDragDrop);
    item.m_Slot = slot - ITEM_SLOT_START;

	item.SetPanelEvent('onmouseover', function () {
		OnItemMouseOver(item);
	})
	item.SetPanelEvent('onmouseout', function () {
		OnItemMouseOut(item);
	})
	item.SetPanelEvent("onactivate",function () {
		ItemPress(hotkey);
	});
}

function UpdateAbility(btn, hero, slot, abilityName) {
	if (!btn) return;

	var ability = 0;
	if(abilityName != null){
		ability = Entities.GetAbilityByName(hero, abilityName);
	} else {
		ability = Entities.GetAbility(hero, slot);
	}

	if (ability <= 0) {
		btn.visible = false;
		return;
	}

	btn.m_AbilityName = Abilities.GetAbilityName(ability);
	var abilityImg = btn.FindChildTraverse('ability-img');
	if(abilityImg) {
		abilityImg.abilityname = Abilities.GetAbilityName(ability);
	}

	var crystalTotal = 0;
	var statAttrs = CustomNetTables.GetTableValue("CustomAttributes", "StatisticalAttributes_" + String(hero));
	if (statAttrs) {
		crystalTotal = statAttrs["crystal"];
	}

	btn.SetHasClass("active",( ability == Abilities.GetLocalPlayerActiveAbility()));
	btn.SetHasClass("toggle-enable",( Abilities.GetToggleState(ability)));
	btn.SetHasClass("auto-cast",( Abilities.GetAutoCastState(ability)));
	btn.SetHasClass("no-mana",( crystalTotal < Abilities.GetSpecialValueFor(ability, "crystal_cost")));
	btn.SetHasClass("not-activated",!Abilities.IsActivated(ability));
	btn.SetHasClass("not-learn",Abilities.GetLevel(ability)<=0);
	btn.SetHasClass("is-passive",Abilities.IsPassive(ability));
	btn.SetHasClass("is-toggle",Abilities.IsToggle(ability));

	var isOwnHero = true;
	if (Players.GetLocalHero() !== Players.GetLocalPlayerPortraitUnit()) {
		isOwnHero = false;
	}

	var isSmallAbility = false;
	if(btn.BHasClass("small")){
		isSmallAbility = true;
	}

	var isMinorAbility = false;
	for(var i = 0; i <= 4; i++) {
		if(btn.id == "ability_minor_" + i) {
			isMinorAbility = true;
			break;
		}
	}

	if(Abilities.IsHidden(ability) && isMinorAbility == false){
		btn.style.visibility = "collapse";
	} else {
		if(m_IsLocalHero || isSmallAbility == false){
			btn.style.visibility = "visible";
		}
	}

	// if(Entities.GetAbilityPoints(hero) > 0 && Abilities.CanAbilityBeUpgraded(ability) == AbilityLearnResult_t.ABILITY_CAN_BE_UPGRADED 
	// 	&& isOwnHero && isSmallAbility == false){
	// 	btn.SetHasClass("show_level_up_tab", true);

	// 	var levelUpButton = btn.FindChildTraverse("LevelUpTab");
	// 	if(levelUpButton && levelUpButton.StudyAbilityName != btn.m_AbilityName) {
	// 		levelUpButton.StudyAbilityName = btn.m_AbilityName;
	// 		levelUpButton.ClearPanelEvent("onactivate");
	// 		levelUpButton.SetPanelEvent("onactivate", function(abilityName){
	// 	        return function(){
	// 	        	StudyAbility(abilityName);
	// 	        }
	// 	    }(btn.m_AbilityName));
	// 	}
	// } else {
	// 	btn.SetHasClass("show_level_up_tab", false);
	// }

	var isInCD = !Abilities.IsCooldownReady(ability);
	btn.SetHasClass('is-in-cd',isInCD);

	if (isInCD) {
		var cd = Abilities.GetCooldownTimeRemaining(ability);
		var deg = -360 * (cd / Abilities.GetCooldownLength(ability));
		deg = (isFinite(deg))? deg : 0;
		btn.FindChild('cooldown').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
		btn.FindChild('cd').text = Math.ceil(cd);
	}

	var costPanel = btn.FindChild('Cost');
	if(costPanel) {
		var crystal_cost = Abilities.GetSpecialValueFor(ability, "crystal_cost");
		if(crystal_cost && crystal_cost > 0) {
			costPanel.GetChild(0).text = crystal_cost;
		} else {
			var hotkeyText = btn.FindChild('Cost').GetChild(0);
			costPanel.GetChild(0).text = "";
		}
	}

	if(isMinorAbility && isInCD == false && crystal_cost > 0) {
		btn.SetHasClass("show_redraw", true);
	} else {
		btn.SetHasClass("show_redraw", false);
	}

	let chargePanel = btn.FindChildTraverse("charge_panel");
	if(chargePanel) {
		if(Abilities.UsesAbilityCharges(ability)) {
			let charges = Abilities.GetCurrentAbilityCharges(ability);
			chargePanel.style.visibility = "visible";
			var chargeRestoreTime = Abilities.GetAbilityChargeRestoreTimeRemaining(ability);
			if(chargeRestoreTime > 0 && (AbilitiesChargeTime[btn.m_AbilityName] == null || chargeRestoreTime > AbilitiesChargeTime[btn.m_AbilityName])) {
				AbilitiesChargeTime[btn.m_AbilityName] = chargeRestoreTime;
			}

			if(AbilitiesChargeTime[btn.m_AbilityName]) {
				var deg = 360 -360 * (chargeRestoreTime / AbilitiesChargeTime[btn.m_AbilityName]);
				deg = (isFinite(deg))? deg : 0;
				chargePanel.FindChild('charge_bar').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
				chargePanel.FindChild("charges").text = charges;		
			} else {
				chargePanel.FindChild("charges").text = Abilities.GetMaxAbilityCharges(ability);
			}

			btn.SetHasClass("not-activated", charges <= 0);	
		} else {
			chargePanel.style.visibility = "collapse";
		}
	}
}

function AutoUpdateAbilities() {
	var hero = GetDisplayingUnit();

	var AbilitiesList = $("#AbilityList");
	for (var i = 0; i <= 4; i++) {
		UpdateAbility(AbilitiesList.GetChild(i), hero, i, null);
	}

	var ItemList = $("#QuicklyItemList");
	for (var i = 0; i < 6; i++) {
		UpdateAbility(ItemList.GetChild(i), hero, i + ITEM_SLOT_START, null);
	}

	if(m_IsLocalHero) {
		for (var i = 0; i <= 4; i++) {
			UpdateAbility($("#ability_minor_" + i), hero, i, null);		
		}
		
		UpdateAbility($("#ability_move"), hero, -1, "ability_xxwar_move");
		UpdateAbility($("#ability_pre"), hero, 5);
	}

	$.Schedule(0.05, AutoUpdateAbilities);
}

function GetPlayerInfo(hero) {
	var playerIDs = Game.GetPlayerIDsOnTeam(DOTATeam_t.DOTA_TEAM_GOODGUYS);
	for (var i = 0; i < playerIDs.length; i++) {
		if (Players.GetPlayerHeroEntityIndex(playerIDs[i]) === hero) {
			return Game.GetPlayerInfo(playerIDs[i]);
		}
	}
}

var m_LastUpdateTime = 0;
var m_IsLocalHero = true;
var isInitHiddenText = false;
var currentLevelXp = 0;
var lastLevelXp = 0;

function GetDisplayingUnit() {
	var hero = Players.GetLocalPlayerPortraitUnit();
	if (hero === -1) {
		hero = Players.GetLocalHero();
	}

	var data = CustomNetTables.GetTableValue("PlayerSummonHeroes", Game.GetLocalPlayerID());
    if(data != null) {
    	for(var idx in data){
    		if (data[idx] == hero){
    			hero = Players.GetLocalHero();
    			break;
    		}
        }
    }

    return hero;
}

function UpdateHeroInfo() {
	var hero = GetDisplayingUnit();
	if (!Entities.IsRealHero(hero)) return $.Schedule(0.1, UpdateHeroInfo);

	m_IsLocalHero = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()) === hero;

	if (Game.Time() >= m_LastUpdateTime) {
		m_LastUpdateTime = Game.Time() + 0.6;

		var info = GetPlayerInfo(hero);
		if (info) {
			$("#UserName").steamid = info.player_steamid;
		}
		$("#HeroPortraitImg").SetImage("file://{images}/custom_game/hero_frame/" + Entities.GetUnitName(hero) + ".png");

		var ability_move = $("#ability_move");

		if (m_IsLocalHero) {
			if(ability_move) ability_move.visible = true;	
		}
		else {
			if(ability_move) ability_move.visible = false;	
		}
	}
	
	var ContextPanel = $.GetContextPanel();

	var HeroPortraitPanel = $("#HeroPortraitPanel");
	if (m_IsLocalHero) {
		var respawntime = Players.GetRespawnSeconds(Players.GetLocalPlayer());
		HeroPortraitPanel.SetHasClass("IsDeath",respawntime >= 0);
		if (respawntime >= 0) HeroPortraitPanel.SetDialogVariableInt("RespawnTime", respawntime);
	} else {
		HeroPortraitPanel.SetHasClass("IsDeath",false);
	}

	// 基础信息
	var health = Entities.GetHealth(hero);
	var maxhealth = Entities.GetMaxHealth(hero);
	var mana = Entities.GetMana(hero);
	var maxmana = Entities.GetMaxMana(hero);
	var healthPercent = Entities.GetHealthPercent(hero);
	var manaPercent = maxmana > 0 ? (mana / maxmana * 100).toFixed() : 0;
	ContextPanel.SetDialogVariable("HealthText", health + " / " +  maxhealth + ((healthPercent!=100)?  " ( + " + parseFloat(Entities.GetHealthThinkRegen(hero).toFixed(1)) + " )":"") );
	ContextPanel.SetDialogVariable("HealthPercentText", healthPercent + "%");
	ContextPanel.SetDialogVariable("ManaText", mana + " / " +  maxmana + ((manaPercent!=100)?  " ( + " + parseFloat(Entities.GetManaThinkRegen(hero).toFixed(1)) + " )":"") );
	ContextPanel.SetDialogVariable("ManaPercentText", manaPercent + "%");
	$("#HealthPercentBar").style.width = ((health/maxhealth)*100) + "%";
	$("#ManaPercentBar").style.width = (mana/maxmana*100) + "%";

	ContextPanel.SetDialogVariableInt("HeroLevel",Entities.GetLevel(hero));

 	if (Entities.GetNeededXPToLevel(hero) > currentLevelXp) {
        lastLevelXp = currentLevelXp;
        currentLevelXp = Entities.GetNeededXPToLevel(hero);
    }

    var currentForLevel = Entities.GetCurrentXP(hero) - lastLevelXp;
    var needForLevel = Entities.GetNeededXPToLevel(hero) - lastLevelXp;
    needForLevel = Math.max(needForLevel, 0);

	if (needForLevel > 0) {
		$("#HeroExpRing").style.clip = "radial(50% 50%,0deg," + (360*(currentForLevel/needForLevel)).toFixed(2) + "deg)";
	} else {
		$("#HeroExpRing").style.clip = "radial(50% 50%,0deg,360deg)";
	}

	// 属性点
	var AttributesPanel = $("#AttributesPanel");
	var StatisticalAttributes = CustomNetTables.GetTableValue("CustomAttributes", "StatisticalAttributes_"+String(hero));
	if (StatisticalAttributes) {
		AttributesPanel.SetDialogVariable("strength",Math.ceil(StatisticalAttributes["str"]).toString());
		AttributesPanel.SetDialogVariable("agility",Math.ceil(StatisticalAttributes["agi"]).toString());
		AttributesPanel.SetDialogVariable("intellect",Math.ceil(StatisticalAttributes["int"]).toString());
		var crystal = StatisticalAttributes["crystal"];
		var maxCrystal = StatisticalAttributes["max_crystal"];

		$("#lblRealmText").text = $.Localize("xxwar_realm_" + (maxCrystal - 1));
		for(var i = 0; i < 10; i++) {
			let crystalImg = $("#CrystalItem_" + i);
			if(crystal > i) {
				crystalImg.visible = true;
				crystalImg.SetHasClass("Empty", false);
			} else {
				if(maxCrystal > i) {
					crystalImg.visible = true;
					crystalImg.SetHasClass("Empty", true);
				} else {
					crystalImg.visible = false;	
				}
			}
		}
	}

	// 主技能
	var AbilityList = $("#AbilityList");
	var keyIndex = 0;
	for (var i = 0; i <= 4; i++) {
		var panel = AbilityList.GetChild(i);
		if (!panel) {
			panel = $.CreatePanel("Button", AbilityList, "ability_" + i);
			panel.BLoadLayoutSnippet('ability-btn');
			RegisterAbilityEvent(panel);
		}

		var ability = Entities.GetAbility(hero, i);
		if(ability) {
			if(Abilities.IsHidden(ability) == false){
				panel.FindChild('Hotkey').GetChild(0).text = AbilityKeys[keyIndex];
				panel.HotKey = AbilityKeys[keyIndex];
				keyIndex++;
			} else {
				panel.FindChild('Hotkey').GetChild(0).text = "";
				panel.HotKey = "";
			}
			panel.m_AbilityName = Abilities.GetAbilityName(ability);
			panel.FindChild('ability-img').abilityname = panel.m_AbilityName;
		}
	}

	// 物品技能
	var ItemList = $("#QuicklyItemList");
	if (m_IsLocalHero) {
		var itemAbilities = CustomNetTables.GetTableValue("Common", "custom_item_spell_system_" + hero);
		for (var i = ITEM_SLOT_START; i < ITEM_SLOT_START + 6; i++) {
			var item = ItemList.GetChild(i - ITEM_SLOT_START);
			if (!item) {
				item = $.CreatePanel("Button",ItemList,"item_"+i);
				item.BLoadLayoutSnippet('quickly-item');
				item.FindChild('Hotkey').GetChild(0).text = ItemKeys[i - ITEM_SLOT_START];
				item.Hotkey = ItemKeys[i - ITEM_SLOT_START];

				var tooltip = item.FindChild('cooldown');
				tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml', false, false);
				tooltip.Setup("item");
				RegisterItemEvents(item, ItemKeys[i - ITEM_SLOT_START], i);
			}

			item.SetHasClass("is-local-hero",false);

			if (itemAbilities) {
				var ItemIndex = itemAbilities[i];
				if (ItemIndex > 0) {
					var itemCharges = item.FindChild('charges');
					itemCharges.visible = Items.IsStackable(ItemIndex);
					itemCharges.text = Items.GetCurrentCharges(ItemIndex);
					item.FindChild('item-img').itemname = Abilities.GetAbilityName(ItemIndex);
				}
				else{
					item.FindChild('charges').visible = false;
					item.FindChild('item-img').itemname = ""
				}
			}
			else{
				item.FindChild('charges').visible = false;
				item.FindChild('item-img').itemname = ""
			}
		}
	} else {
		for (var i = ITEM_SLOT_START; i < ITEM_SLOT_START + 6; i++) {
			var item = ItemList.GetChild(i - ITEM_SLOT_START);
			if (!item) {
				item = $.CreatePanel("Button",ItemList,"item_"+i);
				item.BLoadLayoutSnippet('quickly-item');
				item.FindChild('Hotkey').GetChild(0).text = ItemKeys[i - ITEM_SLOT_START];
				item.HotKey = ItemKeys[i - ITEM_SLOT_START];

				var tooltip = item.FindChild('cooldown');
				tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
				tooltip.Setup("item");
				RegisterItemEvents(item, ItemKeys[i - ITEM_SLOT_START], i);
			}

			item.SetHasClass("is-local-hero",true);

			var ItemIndex = Entities.GetItemInSlot(hero,i - ITEM_SLOT_START);
			if (ItemIndex > 0) {
				var itemCharges = item.FindChild('charges');
				itemCharges.visible = Items.IsStackable(ItemIndex);
				if (itemCharges.visible) {
					itemCharges.text = Items.GetCurrentCharges(ItemIndex);
				}
				item.FindChild('item-img').itemname = Abilities.GetAbilityName(ItemIndex);
			}
			else{
				item.FindChild('charges').visible = false;
				item.FindChild('item-img').itemname = "";
			}
		}
	}

	if(isInitHiddenText == false){
		if(Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)) {
			isInitHiddenText = true;
			ShowDialogValues();
		}
	}

	$.Schedule(0.1, UpdateHeroInfo);
}

function OnDragDrop(panelId, draggedPanel) {
	draggedPanel.m_DragCompleted = true;
}

function InitAbilities() {
	var hero = Players.GetLocalHero();
	$("#BuffsFrame").SetTargetUnit(hero);

    var initCount = 0;
	var abilityJump = Entities.GetAbilityByName(hero, "ability_xxwar_move");
	if(abilityJump >= 0) {
		InitSmallAbility(abilityJump, "ability_move", "", true);
		initCount++;
	}

	var abilityPre = Entities.GetAbility(hero, 5);
	InitSmallAbility(abilityPre, "ability_pre", "", false);

    if (initCount < 1) {
        $.Schedule(0.5, InitAbilities);
    }

	$.Schedule(0.5, UpdateHeroInfo);
	$.Schedule(1, AutoUpdateAbilities);
}

function InitSmallAbility(ability, panelId, hotkey, moveToFront) {
	var AbilitiesPanel = $("#AbilitiesPanel");
	var abilityPanel = $("#" + panelId) ||  $.CreatePanel("Panel", AbilitiesPanel, panelId);
	var abilityName = Abilities.GetAbilityName(ability);
	abilityPanel.BLoadLayoutSnippet('ability-btn');
	abilityPanel.SetHasClass("small", true);
	abilityPanel.FindChild('Hotkey').GetChild(0).text = hotkey;
	abilityPanel.HotKey = hotkey;
	RegisterAbilityEvent(abilityPanel);
	abilityPanel.m_AbilityName = ability;
	abilityPanel.FindChild('ability-img').abilityname = ability;
	if(moveToFront) {
		AbilitiesPanel.MoveChildBefore(abilityPanel, AbilitiesPanel.GetChild(0));
	}
}

function ShowDialogValues() {
	$("#txtStrength").visible = true;
	$("#txtAgility").visible = true;
	$("#txtIntellect").visible = true;
	$("#HealthText").visible = true;
	$("#HealthPercentText").visible = true;
	$("#ManaText").visible = true;
	$("#ManaPercentText").visible = true;
}

;(function(){
	$.Schedule(0.5, InitAbilities);

	$.RegisterEventHandler('DragDrop', $("#HeroFrame"), OnDragDrop);

	$.RegisterForUnhandledEvent("UIShowCustomLayoutTooltip", HideAttrPanel);

	$("#BuffsFrame").BLoadLayout("file://{resources}/layout/custom_game/frames/buffs_frame/buffs_frame.xml", false, false);

	var BagHandyButtons = $("#BagHandyButtons");
	for (var i = 0; i < BagHandyButtons.GetChildCount(); i++) {
		RegisterBagHandyButtonEvents(BagHandyButtons.GetChild(i));
	}
})()

function OnAbilityDragStart(btn, dragCallbacks) {
	OnAbilityMouseOut(btn);

	var isSmallAbility = false;
	if(btn.BHasClass("small")){
		isSmallAbility = true;
	}

	return false;

	// if(btn.m_AbilityName == "ability_xxwar_move") {
	// 	return false;
	// }

	// if(isSmallAbility && btn.BHasClass("is-in-cd")) {
	// 	return false;
	// }

	// var hero = Players.GetLocalHero();
	// btn.SetHasClass('drag_start',true);
	// var displayPanel = $.CreatePanel('DOTAAbilityImage', $.GetContextPanel(), '');
	// displayPanel.SetHasClass("dragAbilityImage", true);
	// displayPanel.abilityname = btn.m_AbilityName;
	// displayPanel.m_DragCompleted = false;
	// displayPanel.m_Source = isSmallAbility ? "small_abilities" : "abilities";
	// dragCallbacks.displayPanel = displayPanel;
	// dragCallbacks.offsetX = 0;
	// dragCallbacks.offsetY = 0;
	
	// ShowAbilityHandyButtons(isSmallAbility);
	// return true;
}

function OnAbilityDragEnd(btn, draggedPanel) {
	draggedPanel.DeleteAsync(0);
	btn.SetHasClass('drag_start',false);
	HideAbilityHandyButtons();
}

function OnAbilityDragDrop(btn, draggedPanel) {
	if (draggedPanel.m_Source !== 'abilities') return;

	var targetBtn = GetDragAbilityTarget(btn, draggedPanel);
	if(targetBtn && draggedPanel.abilityname != targetBtn.m_AbilityName) {
		GameEvents.SendCustomGameEventToServer('xxwar_ability_swap', {abilityname:draggedPanel.abilityname, targetAbility:targetBtn.m_AbilityName});
	}
}

function OnAbilityDragEnter(btn, draggedPanel) {
	var targetBtn = GetDragAbilityTarget(btn, draggedPanel);
	if(targetBtn) {
		targetBtn.SetHasClass('drag_target', true);
	}
}

function OnAbilityDragLeave(btn, draggedPanel) {
	var targetBtn = GetDragAbilityTarget(btn, draggedPanel);
	if(targetBtn) {
		targetBtn.SetHasClass('drag_target', false);
	}
}

function GetDragAbilityTarget(btn, draggedPanel) {
	if (draggedPanel.m_Source !== 'abilities') return null;
	if(!btn.m_AbilityName) { btn = btn.GetParent();}
	if(!btn.m_AbilityName) { btn = btn.GetParent();}
	if(!btn.m_AbilityName || btn.m_AbilityName == draggedPanel.abilityname){
		return null;
	}

	if(btn.BHasClass("small")){
		return null;
	}

	return btn;
}

function ShowAbilityHandyButtons(isSmallAbility) {
	if(isSmallAbility){
		$("#txtHandyButton").text = $.Localize("#xxwar_button_wash_back");
	} else {
		$("#txtHandyButton").text = $.Localize("#xxwar_button_discard");
	}

	$("#BagHandyButtons").SetHasClass('drag_start', true);
}

function HideAbilityHandyButtons() {
	$("#BagHandyButtons").SetHasClass('drag_start',false);
}

function OnBagHandyButtonDragDrop( panel, draggedPanel ) {
	draggedPanel.m_DragCompleted = true;
	if (draggedPanel.m_Source !== 'abilities' && draggedPanel.m_Source !== "small_abilities") return;

	GameEvents.SendCustomGameEventToServer("xxwar_ability_discard", {'abilityName':draggedPanel.abilityname});
}

function OnBagHandyButtonDragEnter( panel, draggedPanel ) {
	panel.SetHasClass("drag_enter",true);
}

function OnBagHandyButtonDragLeave( panel, draggedPanel ) {
	panel.SetHasClass("drag_enter",false);
}

function RegisterBagHandyButtonEvents(button) {
	$.RegisterEventHandler('DragDrop', button, OnBagHandyButtonDragDrop);
	$.RegisterEventHandler('DragEnter', button, OnBagHandyButtonDragEnter);
	$.RegisterEventHandler('DragLeave', button, OnBagHandyButtonDragLeave);
}

function HideDOTATooltip(){
    $.DispatchEvent("DOTAHideTextTooltip");
    $.DispatchEvent("DOTAHideTitleTextTooltip");
}

function ShowDOTATooltip(targetId){
    switch(targetId){
        case "RealmButton":
            $.DispatchEvent("DOTAShowTextTooltip", $("#" + targetId), "#xxwar_realm_upgrade");
            break;
    }
}
