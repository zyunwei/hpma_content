var m_rewardDatas = [];
var m_replaceIndex = -1;

GameUI.LoadFrame($("#SelectPanel"), 'ability_select', 'ability_select_panel', false, true);
GameUI.LoadFrame($("#ReplacePanel"), 'ability_replace', 'ability_select_panel', false, true);

function ClosePanel() {
    GameUI.CloseFrame("ability_select");
    GameUI.CloseFrame("ability_replace");
}

function OnConfirmSelect(index) {
    if (index < 0) {
        return;
    }
    GameUI.CloseFrame("ability_select");
    GameUI.CloseFrame("ability_replace");
    GameEvents.SendCustomGameEventToServer('xxwar_select_ability',{"Index": index + 1});
}

function OnConfirmReplace(abilityname) {
    GameUI.CloseFrame("ability_select");
    GameUI.CloseFrame("ability_replace");
    GameEvents.SendCustomGameEventToServer('xxwar_replace_ability',{"AbilityName": abilityname, "ReplaceIndex": m_replaceIndex});
}

function UpdateAbilityPanels(datas) {
    m_rewardDatas = datas;

    let panelList = $("#RewardsContainer");
    let count = panelList.GetChildCount();
    for (let i = count - 1; i >= datas.length; --i) {
        let ui = panelList.GetChild(i);
        ui.DeleteAsync(0);
        count -= 1;
    }

    for (let i = 0; i < count; ++i) {
        let ui = panelList.GetChild(i);
        UpdateItem(ui, datas[i], i);

    }
    for (let i = count; i < datas.length; ++i) {
        let rewardPanel = $.CreatePanel('Button', panelList, ''); 
        rewardPanel.BLoadLayoutSnippet("RewardOptionSnippet_"+ datas[i].Type);

        UpdateItem(rewardPanel, datas[i], i);
    }    
}

function UpdateItem(ui, data, index) {
    let abilityImg = ui.FindChildTraverse("RewardAbilityImage")
    abilityImg.abilityname = data.AbilityName;

    ui.SetPanelEvent("onactivate", function() {OnConfirmSelect(index)});

    let name = $.Localize("DOTA_Tooltip_ability_" + data.AbilityName, ui)
    let description = GameUI.ReplaceDOTAAbilitySpecialValues( data.AbilityName, $.Localize( "DOTA_Tooltip_ability_" + data.AbilityName + "_Description", ui ) )
    ui.SetDialogVariable( "reward_name", name );
    // ui.SetDialogVariable( "reward_description", description );
}

function OnAbilitySelectMessage(message) {
    let datas = [];
    for (let key in message["datas"]) {
        datas.push(message["datas"][key])
    }

    GameUI.SwapFrame("ability_select", true);

    UpdateAbilityPanels(datas);
}

function OnAbilityReplaceMessage(message) {
    let datas = [];
    for (let key in message["datas"]) {
        datas.push(message["datas"][key]);
    }
    m_replaceIndex = message.Index;
    GameUI.SwapFrame("ability_replace", true);
   
    UpdateReplacePanels(datas);
}

function UpdateReplacePanels(datas){
    let panelList = $("#ReplaceContainer");
    panelList.RemoveAndDeleteChildren();

    for (let i = 0; i < datas.length; ++i) {
        let rewardPanel = $.CreatePanel('Button', panelList, ''); 
        rewardPanel.BLoadLayoutSnippet("RewardOptionSnippet_Replace");

        var abilityPanel = rewardPanel.FindChildTraverse("ability-img");
        abilityPanel.abilityname = datas[i].AbilityName;
        SetPanelEvent(rewardPanel);
    }    
}

function SetPanelEvent(rewardPanel) {
    var abilityPanel = rewardPanel.FindChildTraverse("ability-img");
    rewardPanel.SetPanelEvent("onmouseover", function() {
        $.DispatchEvent("DOTAShowAbilityTooltip", rewardPanel, abilityPanel.abilityname);
    });
    rewardPanel.SetPanelEvent("onmouseout", function() {
        $.DispatchEvent("DOTAHideAbilityTooltip");
    });
    rewardPanel.SetPanelEvent("onactivate", function() {
        OnConfirmReplace(abilityPanel.abilityname);
    });
}

(function(){
    GameEvents.Subscribe("ability_select", OnAbilitySelectMessage);
    GameEvents.Subscribe("ability_replace", OnAbilityReplaceMessage);
})()