var HeroOverlayContainer = $("#HeroOverlayContainer");

function SetPanelPosition(unitEntIndex, panel) {
    var origin = Entities.GetAbsOrigin(unitEntIndex);
    var ratio = 1080 / Game.GetScreenHeight();

    if(origin){
        var offset = Entities.GetHealthBarOffset(unitEntIndex);
        offset = offset == -1 ? 100 : offset;
        var x = Game.WorldToScreenX(origin[0], origin[1], origin[2] + offset);
        var y = Game.WorldToScreenY(origin[0], origin[1], origin[2] + offset);    
        panel.SetPositionInPixels(ratio * (x - panel.actuallayoutwidth / 2), ratio * (y - panel.actuallayoutheight), 0);
    }
}

function UpdataCrystalPos(){
    if(!Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)){
        return $.Schedule(Game.GetGameFrameTime(), UpdataCrystalPos);
    }
    var panel = $("#CrystalBar");
    panel.style.opacity = 1;
    var hero = Players.GetLocalHero();
    var StatisticalAttributes = CustomNetTables.GetTableValue("CustomAttributes", "StatisticalAttributes_"+String(hero));
    if(StatisticalAttributes) {
        SetPanelPosition(hero, panel);
        var crystal = StatisticalAttributes["crystal"];
        for(var i = 0; i < 10; i++) {
            let crystalImg = $("#CrystalItem_" + i);
            if(crystal > i) {
                crystalImg.visible = true;
            } else {
                crystalImg.visible = false;
            }
        }
        panel.visible = Entities.IsAlive(hero);
    }
    
    $.Schedule(Game.GetGameFrameTime(), UpdataCrystalPos);
}

function UpdateHeroOverlay(){
    if(!HeroOverlayContainer){
        return;
    }

    if(!Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_PRE_GAME)){
        return $.Schedule(Game.GetGameFrameTime(), UpdateHeroOverlay);
    }

    for (var index = 0; index < HeroOverlayContainer.GetChildCount(); index++) {
        var panel = HeroOverlayContainer.GetChild(index);
        panel.used = false;
    }

    var entities = Entities.GetAllHeroEntities();
    for (var index in entities) {
        var unitEntIndex = entities[index];

        if(Entities.IsRealHero(unitEntIndex)){
            var customAttr = CustomNetTables.GetTableValue("CustomAttributes", "StatisticalAttributes_" + String(unitEntIndex));
            if(customAttr){
                var sIndex = unitEntIndex.toString();
                var panel = HeroOverlayContainer.FindChildTraverse(sIndex);
                if (!panel) {
                    panel = $.CreatePanel("Panel", HeroOverlayContainer, sIndex);
                    panel.BLoadLayoutSnippet("HeroOverlay");
                }

                panel.used = true;
                panel.unitEntIndex = unitEntIndex;

                var playerInfo = CustomNetTables.GetTableValue("PlayerInfo", Entities.GetPlayerOwnerID(unitEntIndex));
                if(playerInfo != null) {
                    if(playerInfo.BountyBullion > 0) {
                        panel.FindChildTraverse("txtBullion").text = playerInfo.BountyBullion;
                        panel.visible = Entities.IsAlive(unitEntIndex);
                    } else {
                        panel.visible = false;
                    }
                }

                SetPanelPosition(unitEntIndex, panel);
            }
        }
    }
    $.Schedule(Game.GetGameFrameTime(), UpdateHeroOverlay);

    for (var index = HeroOverlayContainer.GetChildCount() - 1; index >= 0; index--) {
        var panel = HeroOverlayContainer.GetChild(index);
        if (panel.used == false){
            panel.DeleteAsync(-1);
        }
    }
}

;(function(){
    UpdataCrystalPos();
    UpdateHeroOverlay();
})()
