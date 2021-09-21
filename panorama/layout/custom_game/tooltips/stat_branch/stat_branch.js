"use strict";

var m_sUpgradeIDs = [
    "Upgrade1",
    "Upgrade2",
    "Upgrade3",
    "Upgrade4",
    "Upgrade5",
    "Upgrade6",
    "Upgrade7",
    "Upgrade8",
];
var m_sUpgradeNameIDs = [
    "UpgradeName1",
    "UpgradeName2",
    "UpgradeName3",
    "UpgradeName4",
    "UpgradeName5",
    "UpgradeName6",
    "UpgradeName7",
    "UpgradeName8",
];
var m_sUpgradeOptionIDs = [
    "UpgradeOption1",
    "UpgradeOption2",
    "UpgradeOption3",
    "UpgradeOption4",
];
var Pet_Talents = {}

function SetupTooltip() {
    var self = $.GetContextPanel();
    if(self.style) {
        self.style.backgroundColor = "none";
        self.style.border = "0px";
        self.style.boxShadow = "none";    
    }

    var parent = self.GetParent();
    if(parent && parent.GetChild(0)) {
         parent.GetChild(0).visible = false
    }

	var iHeroIndex = parseInt(self.GetAttributeString("HeroIndex",""));
    var petTalent = Pet_Talents[Entities.GetUnitName(iHeroIndex)];
    if(!petTalent){
        petTalent = CustomNetTables.GetTableValue("PetTalent", Entities.GetUnitName(iHeroIndex));
        Pet_Talents[Entities.GetUnitName(iHeroIndex)] = petTalent;
    }
    var n = -1;
    for (var index = 0; index < Entities.GetAbilityCount(iHeroIndex); index++) {
        var iAbility = Entities.GetAbility(iHeroIndex, index);
        if (iAbility == -1 || Abilities.GetAbilityName(iAbility).indexOf("special_bonus") == -1) {
            continue;
        }
        ++n;
        var pUpgrade = self.FindChildTraverse(m_sUpgradeIDs[n]);
        if (!pUpgrade) {
            continue;
        }
        var pUpgradeName = pUpgrade.FindChildTraverse(m_sUpgradeNameIDs[n]);
        var abilityName = Abilities.GetAbilityName(iAbility);
        var specialValues = petTalent[abilityName];
        if(!!specialValues){
            for (let i in specialValues) {
                pUpgradeName.SetDialogVariable("value", Number(specialValues[i]));
            }
        }
        var sName = $.Localize("DOTA_Tooltip_ability_" + abilityName, pUpgradeName);
        self.SetDialogVariable("name_" + (n + 1), sName);
        var pUpgradeOption = self.FindChildTraverse(m_sUpgradeOptionIDs[Math.floor(n / 2)]);
        var iLevel = Abilities.GetLevel(iAbility);
        pUpgrade.SetHasClass("BranchChosen", iLevel > 0);
        if (!!pUpgradeOption) {
            if (n % 2 == 0)
                pUpgradeOption.SetHasClass("RightBranchChosen", iLevel > 0);
            if (n % 2 == 1) {
                pUpgradeOption.SetHasClass("LeftBranchChosen", iLevel > 0);
            }
        }
    }    
}