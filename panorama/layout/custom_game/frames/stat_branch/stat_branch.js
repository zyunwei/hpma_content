var m_iUnitEntIndex = -1

var sStatRowIDs = [
    "StatRow10",
    "StatRow15",
    "StatRow20",
    "StatRow25",
];
function MouseOverTalentTree() {
    $.GetContextPanel().FindChild('tooltip').ShowTooltip("HeroIndex=" + m_iUnitEntIndex);
}

function MouseOutTalentTree() {
    $.GetContextPanel().FindChild('tooltip').HideTooltip();
}

function UpdateTalentTree() {
    if (m_iUnitEntIndex != -1) {
        $("#StatLevelProgressBar").value = parseInt(Entities.GetLevel(m_iUnitEntIndex));
        $("#StatLevelProgressBarBlur").value = parseInt(Entities.GetLevel(m_iUnitEntIndex));

        var talentCount = 0;
        for (var index = 0; index < Entities.GetAbilityCount(m_iUnitEntIndex); index++) {
            var iAbility = Entities.GetAbility(m_iUnitEntIndex, index);
            if (iAbility == -1 || Abilities.GetAbilityName(iAbility).indexOf("special_bonus") == -1) continue;
            talentCount++;
            var iLevel = Abilities.GetLevel(iAbility);
            var pStatRow = $("#" + sStatRowIDs[Math.floor((talentCount - 1) / 2)]);
            if (pStatRow) {
                if (talentCount % 2 == 1){
                    pStatRow.SetHasClass("RightBranchSelected", iLevel > 0);
                }
                if (talentCount % 2 == 0){
                    pStatRow.SetHasClass("LeftBranchSelected", iLevel > 0);
                }
            }
        }
    }
    $.Schedule(0.1, UpdateTalentTree);
}


(function() {
    $.GetContextPanel().SetTargetUnit = function(target){
		m_iUnitEntIndex = target;
	}
    UpdateTalentTree();
})();