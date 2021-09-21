function SetupTooltip() {
	var bossName = $.GetContextPanel().GetAttributeString("bossname","");
    $("#Loading").visible = true;
    $("#BossInfo").visible = false;
    var bossConfig = GameUI.GetBossConfig(bossName);
    if(!bossConfig){
        return;
    }

    $("#Loading").visible = false;
    $("#BossInfo").visible = true;
    $("#BossName").text = $.Localize(bossName);
    $("#BonusExp").text = bossConfig.BountyXP;
    $("#BonusGold").text = bossConfig.BountyGoldMin + " ~ " + bossConfig.BountyGoldMax;
    var itemList = $("#ItemList");
    var index = 0;
    for(var i in bossConfig.ItemList){
        var itemName = bossConfig.ItemList[i];
        var item = itemList.GetChild(index++);
        if(!item){
            item = $.CreatePanel("Panel",itemList,"");
            item.BLoadLayoutSnippet('item-name');
        }
        item.FindChildTraverse("item-img").itemname = itemName;
        item.visible = true;
    }
}

;(function(){
    $.GetContextPanel().SetupTooltip = SetupTooltip;
})()
