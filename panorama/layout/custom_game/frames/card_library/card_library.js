function OpenCardLibrary(){
    $("#CardLibrary").ToggleClass("show");
}

function Update() {
	if (!$("#CardLibrary").BHasClass("show")) return $.Schedule(0.2, Update);

	var cardList = GetCardGroupsTable();
	if (!cardList) return $.Schedule(0.2, Update);

	var CardPoolContent = $("#CardLibrary");
	for (let i = 0; i < cardList.length; ++i) {
		let data = cardList[i];
		let panel = CardPoolContent.GetChild(i);
		if (!panel) {
			panel = $.CreatePanel("Panel", CardPoolContent, "");
			panel.BLoadLayoutSnippet("Tower");
			panel.abilityName = data.AbilityName;
			RegisterEvents(panel);
		}
		panel.abilityName = data.AbilityName;
		let maskPanel = panel.FindChild("mask");
		maskPanel.FindChild("Item").abilityname = data.AbilityName;
		maskPanel.SetHasClass( "in_hands", data.State == 0 );
		maskPanel.SetHasClass( "fold_cards", data.State == 2 );
		panel.FindChild("CrystalCost").text = data.CrystalCost;
		panel.visible = true;
	}

	var max = CardPoolContent.GetChildCount();
	for (var i = cardList.length; i < max; i++) {
		CardPoolContent.GetChild(i).visible = false;
	}

	$.Schedule(0.2, Update);
}

function GetCardGroupsTable() {
	let hero = Players.GetLocalHero();
	let cardGroupDatas = CustomNetTables.GetTableValue("PlayerCardGroup", "UsingCardGroup_" + hero.toString());

	let results = [];
	for (let key in cardGroupDatas) {
		let info = cardGroupDatas[key];
		results.push({
			AbilityName : info.AbilityName,
			CrystalCost : info.CrystalCost,
			State: info.State
		});
	}
	return results;
}

function RegisterEvents(btn){
	btn.SetPanelEvent("onmouseover",function() {
		$.DispatchEvent("DOTAShowAbilityTooltip", btn, btn.abilityName);
	});
	btn.SetPanelEvent("onmouseout",function() {
		$.DispatchEvent("DOTAHideAbilityTooltip");
	});
}

(function(){
	GetCardGroupsTable();
    Update();
})()