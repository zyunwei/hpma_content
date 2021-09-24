var CARD_COUNT_LIMIT = 10;
var SUMMON_CARD_LIMIT = 2;
var GROUP_COUNT_LIMIT = 5;
var HEROES_LIST = {
    "3" : ["templar_assassin", "lina"],
};

var SelectedHero = "";
var SelectedGroupIndex = 1;
var HeroImageList = [];
var CurrentPage = "";
var ClientData = [];
var AllCardData = [];

function InitHeroList(){
    for(var i in HEROES_LIST) {
        var container = $("#pnlHeroContainer" + i);
        if(container) {
            container.RemoveAndDeleteChildren();
            for(var j in HEROES_LIST[i]) {
                var heroname = HEROES_LIST[i][j];
                var pnlHero = $.CreatePanel("Panel", container, "pnl_" + heroname);
                HeroImageList.push(pnlHero);
                pnlHero.BLoadLayoutSnippet("HeroImage");
                pnlHero.FindChildTraverse("heroImage").heroname = "npc_dota_hero_" + heroname;
                pnlHero.SetPanelEvent("ondblclick", function(){
                    OnSelectHero();
                });
                pnlHero.SetPanelEvent("onactivate", function(_pnlHero, _heroname){
                    return function(){
                        for(var index in HeroImageList) {
                            HeroImageList[index].SetHasClass("selected", false);
                        }

                        var heroAnimation = $("#heroAnimation");
                        heroAnimation.RemoveAndDeleteChildren();
                        var panel = $.CreatePanel("Panel", heroAnimation, "");
                        panel.BLoadLayoutSnippet("hsp_" + _heroname);

                        $("#heroIntroduction").visible = true;
                        $("#selectedHeroName").text = $.Localize("npc_dota_hero_" + _heroname);
                        $("#introContent").text = $.Localize(Hero_Introduction[_heroname]);

                        SelectedHero = _heroname;
                        _pnlHero.SetHasClass("selected", true);
                        SetHeroDetailInfo(_heroname);
                    }
                }(pnlHero, heroname));
            }
        }
    }
}

function btnNavLeft_Click(){
    if(CurrentPage == "HeroSelection") {
        OnSelectHero();
    } else {
        $("#btnNavRight").SetHasClass("default", true);
        OnBackToHeroSelection();
    }
}

function btnNavRight_Click(){
    if(CurrentPage == "HeroSelection") {
        OnSelectHero();
    } else {
        if(!ClientData[SelectedGroupIndex] || !ClientData[SelectedGroupIndex].Cards) return;
        var cards = [];
        for(var i in ClientData[SelectedGroupIndex].Cards) {
            var cardInfo = ClientData[SelectedGroupIndex].Cards[i];
            for(var i = 0; i < cardInfo.count; i++){
                cards.push(cardInfo.name);
            }
        }

        if(cards.length < CARD_COUNT_LIMIT){
            ShowMessage(["xxwar_select" , CARD_COUNT_LIMIT , "xxwar_card_amount"]);
            return;
        }

        SaveCardGroup();
        var postSchema = GetPostSchema();
        postSchema.SelectedCards = cards;
        GameEvents.SendCustomGameEventToServer('xxwar_config_finish', postSchema);
        $("#BottomContent").visible = false;
        $("#PlayerListRoot").SetHasClass("show", true);
        $("#CardPool").SetHasClass("show", false);
        UpdatePlayerInfo();
    }
}

function UpdatePlayerInfo(){
    if(Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION)){
        return;
    }
    var playerInfo = CustomNetTables.GetAllTableValues("PlayerReadyInfo");
    if(!playerInfo) return $.Schedule(0.5,UpdatePlayerInfo);
    var parent = $("#PlayerList");
    var index = 0;
    for(let i in playerInfo){
        let panel = parent.GetChild(index);
        if(!panel){
            panel = $.CreatePanel("Panel", parent, "");
            panel.BLoadLayoutSnippet("PlayerInfo");
        }

        if(playerInfo[i].key != null) {
            let info = playerInfo[playerInfo[i].key];
            if(info != null && info.value != null) {
                panel.FindChildTraverse("DOTAAvatarImage").steamid = info.value.steamid;
                panel.FindChildTraverse("DOTAUserName").steamid = info.value.steamid;
                panel.FindChildTraverse("PlayerInfoState").text = $.Localize(info.value.msg);
            }
        }

        index++;
    }
    $.Schedule(0.5, UpdatePlayerInfo);
}

function OnSelectHero() {
    if(AllCardData.length == 0) {
        ShowMessage(["xxwar_loaddata_error"]);
        return;
    }

    if(SelectedHero == "") {
        $("#pageHeroSelection").visible = true;
        $("#pageCardSelection").visible = false;
        ShowMessage(["xxwar_select_hero"]);
        return;
    }
    $("#pageHeroSelection").visible = false;
    $("#pageCardSelection").visible = true;

    $("#btnNavRight").SetHasClass("default", false);
    $("#btnNavRight").GetChild(0).text = $.Localize("#xxwar_finish");
    $("#btnNavLeft").visible = true;
    $("#lblTitle").text = $.Localize("#xxwar_select_cardgroup");

    CurrentPage = "CardSelection";

    GameEvents.SendCustomGameEventToServer('xxwar_load_card_group', GetPostSchema());

    $("#HeroInfoIcon").SetImage("file://{images}/custom_game/hero_selection/heroes/npc_dota_hero_" + SelectedHero + ".png");
    $("#HeroInfoName").text = $.Localize("#npc_dota_hero_" + SelectedHero);
}

function OnBackToHeroSelection() {
    if(!!ClientData[SelectedGroupIndex]){
        var currentGroupCards = ClientData[SelectedGroupIndex].Cards;
        for(var i in currentGroupCards) {
            var cardInfo = currentGroupCards[i];
            InitSelectedCardPanel($("#SelectedCardListContent"), cardInfo.name, 0);
        }
    }
    $("#pageHeroSelection").visible = true;
    $("#pageCardSelection").visible = false;
    $("#btnNavRight").GetChild(0).text = $.Localize("#xxwar_next");
    $("#btnNavLeft").visible = false;
    $("#lblTitle").text = $.Localize("#xxwar_button_select_hero");
    $("#CardGroupContent").RemoveAndDeleteChildren();
    $("#SelectedCardListContent").RemoveAndDeleteChildren();
    $("#SelectedCount").text = "0/" + CARD_COUNT_LIMIT;
    for(var index in HeroImageList) {
        HeroImageList[index].SetHasClass("selected", false);
    }
    CurrentPage = "HeroSelection";

    $("#BottomContent").visible = true;
    $("#PlayerListRoot").SetHasClass("show", false);
    $("#CardPool").SetHasClass("show", true);
}

var bottomMessageTime = 0;
function ShowMessage(msg){
    var data = {};
    data.text = msg;
    data._time = Game.Time();
    var BottomMsgPanel = $("#BottomMsgPanel");
    var BottomMsg = $("#BottomMsg");
    BottomMsgPanel.SetHasClass("show", false);
    BottomMsgPanel.SetHasClass("error", false);
    var content = ""
    for(var i in msg){
        content += $.Localize(msg[i]);
    }
    BottomMsg.text = content;
    BottomMsgPanel.SetHasClass("show", true);
    BottomMsgPanel.SetHasClass("error", true);
    bottomMessageTime = data._time;
    $.Schedule(2, function () {
        if (bottomMessageTime !== data._time) return;
        BottomMsgPanel.SetHasClass("show", false);
    })
}

function StartCountdown(){
    if(Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION)){
        return;
    }
    var gameTime = Game.GetGameTime();
    var transitionTime = Game.GetStateTransitionTime();

    var time = Math.max( 0, Math.floor( transitionTime - gameTime ) );
    var minute = Math.floor(time / 60);
    var secs = time - minute*60
    if (secs < 10) {secs = "0" + secs}
    $("#lblCountDown").text = minute + ":" + secs;
    $.Schedule(0.2, StartCountdown);
}

function InitCardGroupPanel(groupIndex){
    if(ClientData[groupIndex] == null) {
        ClientData[groupIndex] = { "IsDefault" : 0, "Cards" : {}, "IsModified": true };
    }

    var parent = $("#CardGroupContent");
    var panel = $("#CardGroup_" + groupIndex);
    if(panel == null) {
        panel = $.CreatePanel("Panel", parent, "CardGroup_" + groupIndex);
        panel.BLoadLayoutSnippet("CardGroup");
        panel.FindChildTraverse("CardGroupText").text = groupIndex == 0 ? $.Localize("#xxwar_new_comer") : $.Localize("#xxwar_button_card_group") + groupIndex;
        panel.SetHasClass("default", groupIndex == 0);
        panel.GroupIndex = groupIndex;
        panel.SetPanelEvent("onactivate", function(){
            SelectCardGroup(groupIndex);
        });
    }

    if(ClientData[groupIndex].IsDefault == 1) {
        panel.FindChildTraverse("star").visible = true;
    } else {
        panel.FindChildTraverse("star").visible = false;
    }
    return panel;
}

function InitSelectedCardPanel(parent, cardName, cardCount) {
    var cardId = "SelectedCard_" + cardName;
    var panel = $("#" + cardId);
    if(panel == null && cardCount > 0) {
        panel = $.CreatePanel("Panel", parent, cardId);
        panel.BLoadLayoutSnippet("SelectedCard");
        panel.FindChildTraverse("ItemImage").abilityname = cardName;
        panel.FindChildTraverse("ItemName").text = $.Localize("#DOTA_Tooltip_ability_" + cardName);    
        panel.CardName = cardName;
        AddSelectedCardToNetTable(cardName);
        panel.SetPanelEvent("onactivate", function() { 
            RemoveCard(cardName); 
        });
        panel.SetPanelEvent("onmouseover", function() {
            $.DispatchEvent("DOTAShowAbilityTooltip", panel, cardName);
        });
        panel.SetPanelEvent("onmouseout", function() {
            $.DispatchEvent("DOTAHideAbilityTooltip");
        });
    }
    if(panel != null && cardCount > 0) {
        var crystalCost = GetCardCrystalCost(cardName);
        panel.FindChildTraverse("CrystalCost").text = crystalCost;
        panel.FindChildTraverse("txtCount").text = cardCount + "/" + GetCardMaxCount(cardName);    
    } else if(panel != null) {
        RemoveSelectedCardFromNetTable(cardName)
        panel.DeleteAsync(0);
    }
}

function AddSelectedCardToNetTable(cardName){
    GameEvents.SendCustomGameEventToServer('xxwar_add_selected_card_to_nettable', {CardName: cardName});
}

function RemoveSelectedCardFromNetTable(cardName){
    GameEvents.SendCustomGameEventToServer('xxwar_remove_selected_card_from_nettable', {CardName: cardName});
}

function SelectCardGroup(groupIndex){
    if(ClientData[SelectedGroupIndex] != null && ClientData[SelectedGroupIndex].IsModified) {
        ShowMessage(["xxwar_not_save_card_error"]);
        return;
    }

    if(!!ClientData[SelectedGroupIndex]){
        var currentGroupCards = ClientData[SelectedGroupIndex].Cards;
        for(var i in currentGroupCards) {
            var cardInfo = currentGroupCards[i];
            InitSelectedCardPanel($("#SelectedCardListContent"), cardInfo.name, 0);
        }
    }

    var cardGroupPanel = InitCardGroupPanel(groupIndex);
    if(!cardGroupPanel) return;

    SelectedGroupIndex = groupIndex;

    var groupPanels = $("#CardGroupContent").Children();
    for(var i in groupPanels) {
        groupPanels[i].SetHasClass("selected", false);
    }
    cardGroupPanel.SetHasClass("selected", true);

    var selectedCardList = $("#SelectedCardListContent");
    selectedCardList.RemoveAndDeleteChildren();

    if(!ClientData[groupIndex] || !ClientData[groupIndex].Cards) return;

    for(var i in ClientData[groupIndex].Cards) {
        var cardInfo = ClientData[groupIndex].Cards[i];
        InitSelectedCardPanel(selectedCardList, cardInfo.name, cardInfo.count);
    }

    $("#SelectedCount").text = GetSelectedCardCount() + "/" + CARD_COUNT_LIMIT;
}

function GetSelectedCardCount() {
    if(ClientData[SelectedGroupIndex] == null) {
        return 0;
    }

    var totalCardCount = 0;
    for(var i in ClientData[SelectedGroupIndex].Cards) {
        var cardInfo = ClientData[SelectedGroupIndex].Cards[i];
        if(cardInfo != null){
            totalCardCount = totalCardCount + cardInfo.count;
        }
    }
    return totalCardCount;
}

function GetSelectedCardCountByType(cardType) {
    if(ClientData[SelectedGroupIndex] == null) {
        return 0;
    }

    var totalCardCount = 0;
    for(var i in ClientData[SelectedGroupIndex].Cards) {
        var cardInfo = ClientData[SelectedGroupIndex].Cards[i];
        if(cardInfo != null && cardType == GetCardType(cardInfo.name)) {
            totalCardCount = totalCardCount + cardInfo.count;    
        }
    }

    return totalCardCount;
}

function GetCardMaxCount(cardName) {
    var maxCount = 0;
    if(AllCardData != null && AllCardData[cardName] != null && AllCardData[cardName].MaxCount != null) {
        maxCount =  AllCardData[cardName].MaxCount;
    }
    return maxCount;
}

function GetCardCrystalCost(cardName) {
    var crystalCost = 0;
    if(AllCardData != null && AllCardData[cardName] != null && AllCardData[cardName].CrystalCost != null) {
        crystalCost =  AllCardData[cardName].CrystalCost;
    }
    return crystalCost;
}

function GetCardType(cardName) {
    var cardType = "";
    if(AllCardData != null && AllCardData[cardName] != null && AllCardData[cardName].CardType != null) {
        cardType =  AllCardData[cardName].CardType;
    }
    return cardType;
}

function AddCard(cardName){
    if(ClientData[SelectedGroupIndex] == null || ClientData[SelectedGroupIndex].Cards == null) {
        ShowMessage(["xxwar_button_select_card_group"]);
        return;
    }

    if(GetSelectedCardCount() >= CARD_COUNT_LIMIT){
        ShowMessage(["xxwar_reach_card_limit", CARD_COUNT_LIMIT]);
        return;
    }

    var currentGroupCards = ClientData[SelectedGroupIndex].Cards;

    var hasCardInGroup = false;
    var currentCardInfo = null;

    var lastCardIndex = 0;
    for(var i in currentGroupCards) {
        var cardInfo = currentGroupCards[i];
        if(cardInfo.name == cardName) {
            hasCardInGroup = true;
            currentCardInfo = cardInfo;
        }
        lastCardIndex = parseInt(i);
    }

    var maxCount = GetCardMaxCount(cardName);
    if(currentCardInfo && currentCardInfo.count >= maxCount) {
        ShowMessage(["xxwar_reach_this_card_limit", maxCount]);
        return;
    }

    var summonCardCount = GetSelectedCardCountByType("summon");
    if(GetCardType(cardName) == "summon" && summonCardCount >= SUMMON_CARD_LIMIT) {
        ShowMessage(["xxwar_reach_summon_card_limit", SUMMON_CARD_LIMIT]);
        return;
    }

    if(currentCardInfo == null) {
        currentCardInfo = { "name" : cardName, "count" : 0 };
        currentGroupCards[lastCardIndex + 1] = currentCardInfo;
    }

    ClientData[SelectedGroupIndex].IsModified = true;
    currentCardInfo.count = currentCardInfo.count + 1;
    InitSelectedCardPanel($("#SelectedCardListContent"), cardName, currentCardInfo.count);
    $("#SelectedCount").text = GetSelectedCardCount() + "/" + CARD_COUNT_LIMIT;
}

function RemoveCard(cardName){
    if(ClientData[SelectedGroupIndex] == null || ClientData[SelectedGroupIndex].Cards == null) {
        ShowMessage(["xxwar_button_select_card_group"]);
        return;
    }

    if($("#CardPool").BHasClass("show") == false) {
        ShowMessage(["xxwar_wait_other_player"]);
        return;
    }

    var currentGroupCards = ClientData[SelectedGroupIndex].Cards;
    var currentCardInfo = null;
    for(var i in currentGroupCards) {
        var cardInfo = currentGroupCards[i];
        if(cardInfo.name == cardName) {
            currentCardInfo = cardInfo;
            break;
        }
    }

    if(currentCardInfo == null || currentCardInfo.count <= 0) {
        ShowMessage(["xxwar_operation_fail"]);
        return;
    }

    ClientData[SelectedGroupIndex].IsModified = true;
    currentCardInfo.count = currentCardInfo.count - 1;
    InitSelectedCardPanel($("#SelectedCardListContent"), cardName, currentCardInfo.count);
    $("#SelectedCount").text = GetSelectedCardCount() + "/" + CARD_COUNT_LIMIT;
}

function SaveCardGroup(){
    if(ClientData[SelectedGroupIndex] == null || ClientData[SelectedGroupIndex].Cards == null) {
        ShowMessage(["xxwar_button_select_card_group"]);
        return;
    }

    if(GetSelectedCardCount() < CARD_COUNT_LIMIT){
        ShowMessage(["xxwar_select" , CARD_COUNT_LIMIT , "xxwar_card_amount"]);
        return;
    }

    var cards = ClientData[SelectedGroupIndex].Cards;
    var cardGroup = {};
    for(var i in cards){
        var index = i;
        if(i < 10) {
            index = "0" + i;
        }
        cardGroup[index] = {name:cards[i].name, count:cards[i].count};
    }

    if(ClientData[SelectedGroupIndex].IsDefault == 1) {
        for(var groupIndex in ClientData) {
            if(groupIndex == SelectedGroupIndex) {
                ClientData[groupIndex].IsDefault = 1;
            } else {
                ClientData[groupIndex].IsDefault = 0;
            }
            InitCardGroupPanel(groupIndex);
        }
    }

    if (SelectedGroupIndex == 0 && ClientData[SelectedGroupIndex].IsModified){
        ClientData[SelectedGroupIndex].IsModified = false
        CreateCardGroup()
        if(SelectedGroupIndex != 0){
            for(var i in cards){
                for(let j = 0; j < cards[i].count; j++){
                    AddCard(cards[i].name)
                }
            }
            ShowMessage(["xxwar_create_new_cardgourp"])
        }
    }
    var postSchema = GetPostSchema();
    postSchema.CardGroup = cardGroup;
    postSchema.IsDefault = ClientData[SelectedGroupIndex].IsDefault;
    if(SelectedGroupIndex != 0){
        GameEvents.SendCustomGameEventToServer('xxwar_save_card_group', postSchema);
    }
}

function CreateCardGroup(){
    if(ClientData[SelectedGroupIndex] != null && ClientData[SelectedGroupIndex].IsModified) {
        ShowMessage(["xxwar_not_save_card_error"]);
        return;
    }

    var newGroupIndex = -1;
    for(var i = 1; i <= GROUP_COUNT_LIMIT; i++){
        if($("#CardGroup_" + i) == null) {
            newGroupIndex = i;
            break;
        }
    }
    if(newGroupIndex == -1) {
        ShowMessage(["xxwar_reach_cardgroup_limit" , GROUP_COUNT_LIMIT]);
        return;
    }

    SelectCardGroup(newGroupIndex);
}

function DelCardGroup(){
    if(SelectedGroupIndex == 0){
        ShowMessage(["xxwar_newcomer_cant_del"]);
        return
    }
    var groupCount = 0;
    for(var i in ClientData) { groupCount++; }
    if(groupCount <= 1){
        ShowMessage(["xxwar_atleast_one_card_group"]);
        return;
    }

    GameEvents.SendCustomGameEventToServer('xxwar_del_card_group', GetPostSchema());
}

function SetDefault(){
    if(SelectedGroupIndex == 0){
        ShowMessage(["xxwar_newcomer_cant_setdefault"]);
        return;
    }
    if(ClientData[SelectedGroupIndex] == null) {
        return 0;
    }

    if(GetSelectedCardCount() < CARD_COUNT_LIMIT){
        ShowMessage(["xxwar_select" , CARD_COUNT_LIMIT , "xxwar_card_amount"]);
        return;
    }

    ClientData[SelectedGroupIndex].IsDefault = 1;
    InitCardGroupPanel(SelectedGroupIndex);
    SaveCardGroup();
}

function GetPostSchema() {
    return {HeroName:"npc_dota_hero_" + SelectedHero, GroupIndex:SelectedGroupIndex};
}

var teamMateSelectedCards = new Array();
var enemySelectedCards = new Array();
var mySelectedCards = new Array();

function ChangeSelectedCardsState(cards, type, isShow){
    for(let i in cards){
        let cardName = cards[i];
        let card = $("#" + cardName);
        if(!!card && !!card.FindChildTraverse(type)){
            card.FindChildTraverse(type).visible = isShow;
        }
    }
}

function PlayerSelectedCardsChanged(tableName, key, data){
    ChangeSelectedCardsState(mySelectedCards, "GreenHook", false);
    ChangeSelectedCardsState(enemySelectedCards, "RedHook", false);
    ChangeSelectedCardsState(teamMateSelectedCards, "YellowHook", false);
    teamMateSelectedCards = new Array();
    enemySelectedCards = new Array();
    mySelectedCards = new Array();
    var playerSelectedCards = CustomNetTables.GetAllTableValues(tableName);
    for(let j in playerSelectedCards){
        let cards = playerSelectedCards[j].value;
        let playerId = playerSelectedCards[j].key;
        for(let i in cards){
            let cardName = cards[i];
            if(Players.GetLocalPlayer() == Number(playerId) && mySelectedCards.indexOf(cardName) == -1){
                mySelectedCards.push(cardName);
            }
            if(Players.GetLocalPlayer() != Number(playerId) && Players.GetTeam(Number(playerId)) == Players.GetTeam(Players.GetLocalPlayer()) && teamMateSelectedCards.indexOf(cardName) == -1){
                teamMateSelectedCards.push(cardName);
            }
            if(Players.GetTeam(Number(playerId)) != Players.GetTeam(Players.GetLocalPlayer()) && enemySelectedCards.indexOf(cardName) == -1){
                enemySelectedCards.push(cardName);
            }      
        }    
    }
    ChangeSelectedCardsState(mySelectedCards, "GreenHook", true);
    ChangeSelectedCardsState(enemySelectedCards, "RedHook", true);
    ChangeSelectedCardsState(teamMateSelectedCards, "YellowHook", true);
}

function LoadIsVip(){
    var playerInfo = CustomNetTables.GetTableValue("PlayerInfo", String(Players.GetLocalPlayer()));
    if(!playerInfo) return $.Schedule(1, LoadIsVip)
    else if(playerInfo.IsVip == 1){ 
        CustomNetTables.SubscribeNetTableListener("PlayerSelectedCards", PlayerSelectedCardsChanged );
    }
}

var CheckedClassify = [];
function SelectClassify(classify){
    CheckedClassify.push(classify);
    UpdateClassifyDisplay();
}

function UnSelectClassify(classify) {
    CheckedClassify = CheckedClassify.filter(function(value, index, arr){
        return value != classify;
    });
    UpdateClassifyDisplay();
}

function UpdateClassifyDisplay(){
    var showAll = CheckedClassify.length == 0;
    var spellCardsPanel = $("#SpellCards");
    var children = spellCardsPanel.Children();
    for(var i in children) {
        var classifies = [];
        for(var m in children[i].classify){
            classifies.push(children[i].classify[m]);
        }

        var show = true;
        for(var j in CheckedClassify) {
            if(showAll == false && classifies.indexOf(CheckedClassify[j]) < 0){
                show = false;
            }
        }

        children[i].visible = show;
    }
}

function ClearClassify(){
    var parentPanel = $("#ClassifyPanel");
    var children = parentPanel.Children();

    for(var i in children) {
        if(children[i].paneltype == "ToggleButton"){
            children[i].SetSelected(false);
        }
    }
}

function InitGuide(){
    $("#Guide").BLoadLayout("file://{resources}/layout/custom_game/templates/guide/guide.xml",false,false);
}

function Close(){
    $("#Guide").Close()
}

function SetHeroDetailInfo(heroName){
    var detail = Hero_Detail[heroName];
    var detailPanel = $("#heroDetail");
    detailPanel.visible = true;
    if(!detail){ return; }
    var colCount = 0;
    for(let key in detail){
        detailCol = detailPanel.GetChild(colCount);
        if(!detailCol){
            detailCol = $.CreatePanel("Panel", detailPanel, key);
            detailCol.BLoadLayoutSnippet("HeroDetailCol");
            detailCol.FindChild("HeroDetailColTitle").text = $.Localize(Hero_Deatil_Localize_Map[key]);
        }
        let colList = detailCol.FindChild("HeroDetailColList");
        let rowCount = 0;
        for(let stat in detail[key]){
            detailRow = colList.GetChild(rowCount);
            if(!detailRow){
                detailRow = $.CreatePanel("Panel", colList, "");
                detailRow.BLoadLayoutSnippet("HeroDetailRow");
            }
            detailRow.FindChild("HeroDetailRowIcon").SetImage(detail[key][stat].imgPath);
            detailRow.FindChild("HeroDetailRowText").text = detail[key][stat].content;
            rowCount++;
        }
        colCount++;
    }
}


(function() {
    StartCountdown();
    InitHeroList();
    OnBackToHeroSelection();
    LoadIsVip();
    InitGuide();
    // $("#Guide").BLoadLayout("file://{resources}/layout/custom_game/frames/guide/guide.xml",false,false);

    GameEvents.SendCustomGameEventToServer('xxwar_get_cardpool_data', {});
    GameEvents.Subscribe("xxwar_get_cardpool_data_res", function(data) {
        if(!data) return;
        AllCardData = {};
        var cardList = [];
        for(var i in data){
            if(data[i].IsHidden == 0) {
                AllCardData[i] = data[i];
                cardList.push({
                    "name": i,
                    "value" : data[i],
                });
            }
        }

        var spellCardsPanel = $("#SpellCards");
        spellCardsPanel.RemoveAndDeleteChildren();

        var petCardsPanel = $("#PetCards");
        petCardsPanel.RemoveAndDeleteChildren();

        cardList.sort(function(a, b){return a.value.CrystalCost - b.value.CrystalCost}); 

        for(var i in cardList){
            var cardName = cardList[i].name;
            var cardInfo = cardList[i].value;
            var targetPanel = cardList[i].name.indexOf("ability_custom_call_summon_") === 0 ? petCardsPanel : spellCardsPanel;
            var panel = $.CreatePanel("Panel", targetPanel, cardName);
            panel.classify = cardInfo.Classify;
            panel.BLoadLayoutSnippet("CardPoolCard");
            panel.FindChild("CardImage").SetHasClass("ForSell", cardInfo.ForSell == 1);
            panel.FindChild("CrystalImg").SetHasClass("ForSell", cardInfo.ForSell == 1);
            panel.FindChild("CardImage").abilityname = cardName;
            panel.FindChild("AbilityName").text = $.Localize("#DOTA_Tooltip_ability_" + cardName);
            panel.FindChildTraverse("CrystalCost").text = cardInfo.CrystalCost;
            panel.SetPanelEvent("onactivate", function(_card){
                return function(){
                    if(_card.value.ForSell == 1) {
                        ShowMessage(["xxwar_for_sell"]);
                        return;
                    }
                    AddCard(_card.name); 
                }
            }(cardList[i]));
            panel.SetPanelEvent("onmouseover", function(_pnl, _cardName){
                return function(){ $.DispatchEvent("DOTAShowAbilityTooltip", _pnl, _cardName); }
            }(panel, cardName));
            panel.SetPanelEvent("onmouseout", function() { $.DispatchEvent("DOTAHideAbilityTooltip");});
        }
    });

    GameEvents.Subscribe("xxwar_card_group_msg", function(data) {
        if(data && data.msg) ShowMessage([data.msg]);
    });

    GameEvents.Subscribe("xxwar_card_group_saved", function(data) {
        if(data && data.msg) ShowMessage([data.msg]);
        if(data.groupIndex && ClientData[data.groupIndex] != null) {
            ClientData[data.groupIndex].IsModified = false;
        }
    });

    GameEvents.Subscribe("xxwar_load_card_group_res", function(data) {
        if(!data) return;
        $("#CardGroupContent").RemoveAndDeleteChildren();
        ClientData = data;
        var displayGroupIndex = -1;
        var firstGroupIndex = -1;
        for(var groupIndex in data) {
            InitCardGroupPanel(groupIndex);
            if(data[groupIndex].IsDefault == 1) {
                displayGroupIndex = groupIndex;
            }
            if(firstGroupIndex == -1) {
                firstGroupIndex = groupIndex;
            }
        }

        if(displayGroupIndex == -1) {
            displayGroupIndex = firstGroupIndex;
        }

        if(displayGroupIndex >= 0) {
            SelectCardGroup(displayGroupIndex);
        } else {
            CreateCardGroup();
        }
    });

    GameEvents.Subscribe("xxwar_del_card_group_refresh", function(data) {
        if(data && data.msg) ShowMessage([data.msg]);
        GameEvents.SendCustomGameEventToServer('xxwar_load_card_group', GetPostSchema());
    });

})()

var setFinish = false;
function HideDefaultSelectionPage() {
    if(Game.GameStateIs(DOTA_GameState.DOTA_GAMERULES_STATE_HERO_SELECTION)){
        var pregameRoot = $.GetContextPanel().GetParent().GetParent().GetParent().FindChildTraverse("PreGame");
        if(pregameRoot) {
            var pickScreen = pregameRoot.FindChildTraverse("HeroPickScreen");
            if(pickScreen) {
                pickScreen.visible = false;    
            } else {
                pregameRoot.visible = false; 
            }
            setFinish = true;
        }
    }

    if(!setFinish) {
        $.Schedule(0.25, HideDefaultSelectionPage)
    }
}

HideDefaultSelectionPage();
