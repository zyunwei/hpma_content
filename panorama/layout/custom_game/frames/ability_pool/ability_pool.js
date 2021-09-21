var abilityList = [];
var MinorAbilityList = [];
var currentType = "main";

function AddAbilityPoolButton(){
    var hudElements = GameUI.GetHUDElements();
    var buttonBar = hudElements.FindChildTraverse("ButtonBar")
    var abilityPoolButton =  $.CreatePanel("Button", buttonBar, "AbilityPoolButton");
    abilityPoolButton.style.backgroundImage = "url(\"s2r://panorama/images/control_icons/hamburger_png.vtex\")";
    abilityPoolButton.style.backgroundSize = "30px";
    RegisterEvents(abilityPoolButton);
}

function RegisterEvents(btn){
    btn.SetPanelEvent("onactivate",function() {
		OnBtnClick();
	});
	btn.SetPanelEvent("onmouseover",function() {
		$.DispatchEvent("DOTAShowTextTooltip", btn, "#xxwar_ability_pool");
	});
	btn.SetPanelEvent("onmouseout",function() {
		$.DispatchEvent("DOTAHideTextTooltip");
	});
}

function OnBtnClick(){
    $.DispatchEvent("DOTAHideTextTooltip");
    var abilityPoolRootPanel = $("#AbilityPoolRootPanel");
    abilityPoolRootPanel.ToggleClass("show");
}

function InitAbilityPool(){
    var abilityPool = $("#AbilityPool");
    SetAbilityPoolData(abilityPool, abilityList);
    var minorAbilityPool = $("#MinorAbilityPool");
    SetAbilityPoolData(minorAbilityPool, MinorAbilityList);
}

function SetAbilityPoolData(panel, data){
    var lineCount = 0;
    var currentLine;
    var filteredList = [];
    for(let i = 0; i < data.length; i++){
        let abilityName = data[i];
        let isPet = abilityName.indexOf("ability_custom_call_summon_") === 0;
        if(!isPet) {
            filteredList.push(abilityName)
        }
    }

    for(let i = 0; i < filteredList.length; i++){
        let abilityName = filteredList[i];
        let index = i % 10;
        if(index == 0){
            lineCount++;
            currentLine = $.CreatePanel("Panel", panel, "Line" + String(lineCount));
            currentLine.AddClass("AbilityPoolLine");
        }
        let abilityPanel = $.CreatePanel("Panel", currentLine, "");
        abilityPanel.BLoadLayoutSnippet("AbilityIconSnippet");
        abilityPanel.FindChildTraverse("ability-img").abilityname = abilityName;
        abilityPanel.SetPanelEvent("onmouseover",function() {
            $.DispatchEvent("DOTAShowAbilityTooltip", abilityPanel, abilityName);
        });
        abilityPanel.SetPanelEvent("onmouseout",function() {
            $.DispatchEvent("DOTAHideAbilityTooltip");
        });
    }
}

function LoadAbility(){
    var abilities = CustomNetTables.GetTableValue("CustomAbilities", "MainAbilities")
    var minorAbilities = CustomNetTables.GetTableValue("CustomAbilities", "MinorAbilities")
    for(let i in abilities){
        abilityList.push(abilities[i].AbilityName);
    }

    for(let i in minorAbilities){
        MinorAbilityList.push(minorAbilities[i].AbilityName);
    }
}

function ChangeAbilityType(){
    var mainAbilityPool = $("#AbilityPool");
    var minorAbilityPool = $("#MinorAbilityPool");
    var title = $("#AbilityPoolType");
    if(currentType === "main"){
        minorAbilityPool.SetHasClass("hidden", false);
        mainAbilityPool.SetHasClass("hidden", true);
        currentType = "minor";
        title.text = $.Localize("xxwar_minor_abilities");
    } else {
        minorAbilityPool.SetHasClass("hidden", true);
        mainAbilityPool.SetHasClass("hidden", false);
        currentType = "main";
        title.text = $.Localize("xxwar_main_abilities");
    }
}

(function(){
    AddAbilityPoolButton();
    LoadAbility();
    InitAbilityPool();
    ChangeAbilityType();
})()