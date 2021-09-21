"use strict";

var HeroIconsContainer = $("#HeroIconsContainer");
var AbilitiesChargeTime = {};

function AutoUpdateSummonHeroes() {
    var data = CustomNetTables.GetTableValue("PlayerSummonHeroes", Game.GetLocalPlayerID());
    if(data == null) { 
        $.Schedule(0.1, AutoUpdateSummonHeroes);
        return; 
    }

    var id_prefix = "summonhero_";
    
    for(var idx in data) {
        var panelId = id_prefix + data[idx];
        var panel = HeroIconsContainer.FindChildTraverse(panelId);
        if(panel == null) {
            panel = $.CreatePanel("Panel", HeroIconsContainer, panelId);
            panel.BLoadLayoutSnippet("HeroInfoContainer");

            var buffFramePanel = panel.FindChildTraverse("BuffsFrame");
            if(buffFramePanel) {
                buffFramePanel.BLoadLayout("file://{resources}/layout/custom_game/frames/buffs_frame/buffs_frame.xml", false, false);
                buffFramePanel.SetTargetUnit(data[idx], 2);    
            }

            var statBranchPanel = panel.FindChildTraverse("PetStatBranch");
            if(statBranchPanel) {
                statBranchPanel.BLoadLayout("file://{resources}/layout/custom_game/frames/stat_branch/stat_branch.xml", false, false);
                statBranchPanel.SetTargetUnit(data[idx]);
                var tooltipPanel = statBranchPanel.FindChild('tooltip');
                if(tooltipPanel) {
                    tooltipPanel.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml', false, false);
                    tooltipPanel.Setup("stat_branch");
                }
            }

            var petAvatarPanel = panel.FindChildTraverse("heroInfo");
            if(petAvatarPanel) {
                petAvatarPanel.SetAttributeInt("HeroIndex", data[idx]);
                petAvatarPanel.SetPanelEvent('onactivate', function (entindex) {
                    return function(){
                        GameUI.SetCameraTargetPosition(Entities.GetAbsOrigin(entindex), 0.2);
                        $.Schedule(0.2, function(){ GameUI.SetCameraTarget(-1);});   
                    }
                }(data[idx]));

                var tooltipPanel = petAvatarPanel.GetParent().FindChild('tooltip');
                if(tooltipPanel) {
                    tooltipPanel.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml', false, false);
                    tooltipPanel.SetAttributeInt("HeroIndex", data[idx]);
                    tooltipPanel.Setup("pet_attributes");

                    petAvatarPanel.SetPanelEvent("onmouseover", function () {
                        tooltipPanel.ShowTooltip("HeroIndex=" + data[idx]);
                    });

                    petAvatarPanel.SetPanelEvent("onmouseout", function () {
                        tooltipPanel.HideTooltip();
                    });
                }
            }
        }
    }

    for(var idx in data){
        var panelId = id_prefix + data[idx];
        var panel = HeroIconsContainer.FindChildTraverse(panelId);
        if(panel && panel.unitEntIndex == null){
            var heroname = Entities.GetUnitName(data[idx]);
            var heroImg = panel.FindChildTraverse("imgHero");
            if(heroImg && heroname != ""){
                heroImg.SetImage("file://{images}/heroes/" + heroname + ".png");
                panel.unitEntIndex = data[idx];
            }
        }
    }

    for (var index = 0; index < HeroIconsContainer.GetChildCount(); index++) {
        var panel = HeroIconsContainer.GetChild(index);
        if(panel && panel.unitEntIndex){
            panel.FindChildTraverse("txtLevel").text = "Lv " + Entities.GetLevel(panel.unitEntIndex);
            panel.FindChildTraverse("healthBar").style.width = Entities.GetHealthPercent(panel.unitEntIndex) + "%";
            var currentMana = Entities.GetMana(panel.unitEntIndex);
            var maxMana = Entities.GetMaxMana(panel.unitEntIndex);
            var manaPercent = 0;
            if(maxMana > 0){
                manaPercent = Math.round(currentMana * 100 / maxMana);
            }
            if(manaPercent < 0){
                manaPercent = 0;
            }
            if(manaPercent > 100){
                manaPercent = 100;
            }
            panel.FindChildTraverse("manaBar").style.width = manaPercent + "%";

            var hero = parseInt(panel.unitEntIndex);

            if(Entities.IsAlive(hero) == false){
                panel.SetHasClass("dead", true);
            } else {
                panel.SetHasClass("dead", false);
            }

            var lifetimeBar = panel.FindChildTraverse("lifetimeBar");
            var lblLifetime = panel.FindChildTraverse("lblLifetime");
            var hasLifeTime = false;
            var nBuffs = Entities.GetNumBuffs(hero);
            for (var i = 0; i < nBuffs; i++) {
                var buff = Entities.GetBuff(hero, i);
                if (buff == -1)
                    continue;

                var buffName = Buffs.GetName(hero, buff);
                if(buffName == "modifier_kill"){
                    hasLifeTime = true;
                    var totalSeconds = Buffs.GetDuration(hero, buff);
                    var remainSeconds = Buffs.GetRemainingTime(hero, buff);
                    lifetimeBar.value = remainSeconds / totalSeconds;
                    lblLifetime.text =  GetTimeString(remainSeconds);
                }
            }

            if(hasLifeTime) {
                lifetimeBar.visible = true;
                lblLifetime.visible = true;
            } else {
                lifetimeBar.visible = false;
                lblLifetime.visible = false;
            }

            var AbilitiesList = panel.FindChildTraverse("AbilityList");
            var ItemList = panel.FindChildTraverse("ItemList")
            for (var i = 0; i < 10; i++) {
                var panel = AbilitiesList.GetChild(i);
                if (!panel) {
                    panel = $.CreatePanel("Button", AbilitiesList, "ability_" + i);
                    panel.BLoadLayoutSnippet('ability-btn');
                    RegisterAbilityEvent(panel, hero);
                }

                var ability = Entities.GetAbility(hero, i);
                if(ability) {
                    panel.m_AbilityName = Abilities.GetAbilityName(ability);
                    panel.FindChild('ability-img').abilityname = panel.m_AbilityName;
                    UpdateAbility(panel, hero, i);
                }
            }
            for(var i = 0; i < 6; i++){
                var itemPanel = ItemList.GetChild(i);
                if(!itemPanel){
                    itemPanel = $.CreatePanel("Panel", ItemList, "item_" + i);
                    itemPanel.BLoadLayout( "file://{resources}/layout/custom_game/templates/item_dota/inventory_item.xml", false, false );
                    itemPanel.SetItemSlot(i);
                }
                var item = Entities.GetItemInSlot(hero, i);
                if(item){
                    itemPanel.SetItem(hero, item);
                } else {
                    itemPanel.SetItem(hero, -1);
                }
            }
        }
    }

    $.Schedule(0.1, AutoUpdateSummonHeroes);
}

function GetTimeString(seconds) {
    if(seconds == undefined) return "00:00";
    if(seconds <= 0) return "00:00"; 
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = Math.floor(seconds % 60);
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds
}

function UpdateAbility(btn, hero, slot) {
    if (!btn) return;

    var ability = Entities.GetAbility(hero, slot);
    if (ability <= 0) {
        btn.visible = false;
        return;
    }

    if(Abilities.IsHidden(ability) || Abilities.GetLevel(ability) < 1) {
        btn.visible = false;
        return;
    }

    btn.m_AbilityName = Abilities.GetAbilityName(ability);
    if(btn.m_AbilityName.indexOf("special_bonus_") === 0) {
        btn.visible = false;
        return;   
    }

    var abilityImg = btn.FindChildTraverse('ability-img');
    if(abilityImg) {
        abilityImg.abilityname = Abilities.GetAbilityName(ability);
    }

    btn.SetHasClass("active",( ability == Abilities.GetLocalPlayerActiveAbility()));
    btn.SetHasClass("toggle-enable",( Abilities.GetToggleState(ability)));
    btn.SetHasClass("auto-cast",( Abilities.GetAutoCastState(ability)));
    btn.SetHasClass("no-mana",( Entities.GetMana(hero) < Abilities.GetManaCost(ability)));
    btn.SetHasClass("not-activated",!Abilities.IsActivated(ability));
    btn.SetHasClass("not-learn",Abilities.GetLevel(ability)<=0);
    btn.SetHasClass("is-passive",Abilities.IsPassive(ability));
    btn.SetHasClass("is-toggle",Abilities.IsToggle(ability));

    if(Abilities.IsHidden(ability)){
        btn.style.visibility = "collapse";
    } else {
        btn.style.visibility = "visible";
    }

    var isInCD = !Abilities.IsCooldownReady(ability);
    btn.SetHasClass('is-in-cd',isInCD);

    if (isInCD) {
        var cd = Abilities.GetCooldownTimeRemaining(ability);
        var deg = -360 * (cd / Abilities.GetCooldown(ability));
        deg = (isFinite(deg))? deg : 0;
        btn.FindChild('cooldown').style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
        btn.FindChild('cd').text = Math.ceil(cd);
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

function RegisterAbilityEvent(btn, hero) {
    btn.SetPanelEvent('onmouseover', function () {
        if(btn && btn.m_AbilityName && hero) {
            $.DispatchEvent("DOTAShowAbilityTooltipForEntityIndex", btn, btn.m_AbilityName, hero);
        }
    })
    btn.SetPanelEvent('onmouseout', function () {
        $.DispatchEvent("DOTAHideAbilityTooltip");
    })
}

function ItemHideTooltip() {
    $.DispatchEvent("DOTAHideAbilityTooltip", $.GetContextPanel());
}

function OnBagHandyButtonDragDrop(panel, draggedPanel) {
    draggedPanel.m_DragCompleted = true;
    if (draggedPanel.m_Source !== 'pet_items') return;

    GameEvents.SendCustomGameEventToServer("xxwar_pet_item_discard", {'item_entity':draggedPanel.m_DragItem});
}

function OnBagHandyButtonDragEnter(panel, draggedPanel) {
    panel.SetHasClass("drag_enter", true);
}

function OnBagHandyButtonDragLeave(panel, draggedPanel) {
    panel.SetHasClass("drag_enter", false);
}

function RegisterBagHandyButtonEvents(button) {
    $.RegisterEventHandler('DragDrop', button, OnBagHandyButtonDragDrop);
    $.RegisterEventHandler('DragEnter', button, OnBagHandyButtonDragEnter);
    $.RegisterEventHandler('DragLeave', button, OnBagHandyButtonDragLeave);
}

;(function(){
    AutoUpdateSummonHeroes();
    $("#MiniMapPanel").BLoadLayout("file://{resources}/layout/custom_game/frames/minimap/minimap.xml", false, false);

    var BagHandyButtons = $("#BagHandyButtons");
    for (var i = 0; i < BagHandyButtons.GetChildCount(); i++) {
        RegisterBagHandyButtonEvents(BagHandyButtons.GetChild(i));
    }
})()
