var HeroOverlayContainer = $("#HeroOverlayContainer");

function SetPanelPosition(unitEntIndex, panel) {
    var origin = Entities.GetAbsOrigin(unitEntIndex);
    var ratio = 1080 / Game.GetScreenHeight();

    if(origin){
        var x = Game.WorldToScreenX(origin[0], origin[1], origin[2] + 220);
        var y = Game.WorldToScreenY(origin[0], origin[1], origin[2] + 220);    
        panel.SetPositionInPixels(ratio * (x - panel.actuallayoutwidth / 2), ratio * (y - panel.actuallayoutheight), 0);
    }
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
        if(panel && panel.deleted != true) {
            panel.used = false;    
        }
    }

    var entities = Entities.GetAllHeroEntities();
    for (var index in entities) {
        var unitEntIndex = entities[index];

        if(Entities.IsRealHero(unitEntIndex)){
            var sayTable = CustomNetTables.GetTableValue("pet_say_words", String(unitEntIndex));
            if(sayTable != null){
                var sIndex = "pet_bubble_" + unitEntIndex.toString();
                var panel = HeroOverlayContainer.FindChildTraverse(sIndex);
                if (!panel) {
                    panel = $.CreatePanel("Panel", HeroOverlayContainer, sIndex);
                    panel.BLoadLayoutSnippet("HeroOverlay");
                }

                var sayWords = "";
                for(var i in sayTable){
                    if(sayTable[i].expireTime > Game.GetGameTime()) {
                        sayWords = sayTable[i].words;
                        break;    
                    }
                }

                panel.used = true;
                panel.unitEntIndex = unitEntIndex;

                if(sayWords != "") {
                    panel.FindChildTraverse("lblBubbleText").text = $.Localize(sayWords);
                    panel.SetHasClass("show", true);
                    $.Schedule(3, function() {
                        if(panel && panel.deleted != true) {
                            panel.deleted = true;
                            panel.DeleteAsync(-1);    
                        }
                    })
                } else {
                    panel.SetHasClass("show", false);
                }

                SetPanelPosition(unitEntIndex, panel);
            }
        }
    }
    $.Schedule(Game.GetGameFrameTime(), UpdateHeroOverlay);

    for (var index = HeroOverlayContainer.GetChildCount() - 1; index >= 0; index--) {
        var panel = HeroOverlayContainer.GetChild(index);
        if (panel && panel.used == false && panel.deleted != true){
            panel.deleted = true;
            panel.DeleteAsync(-1);
        }
    }
}

;(function(){
    UpdateHeroOverlay();
})()
