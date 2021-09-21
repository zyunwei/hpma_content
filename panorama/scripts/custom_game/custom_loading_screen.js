"use strict";

function add_bot_click(){
    Game.AutoAssignPlayersToTeams();
    GameEvents.SendCustomGameEventToServer("ADD_BOT", {});
}

function GetPlayerCount(){
    var count = 0;
    for (var i=0; i<=9; i++){
        var playerInfo = Game.GetPlayerInfo(i);
        if (playerInfo){
            count++;
        }
    }
    return count;
}

function OnUpdateBotCount(data){
    $("#lblBotCount").text = data.count;
    var connectedPlayerCount = GetPlayerCount();
    if(connectedPlayerCount != Game.GetAllPlayerIDs().length){
        $("#setting_box").style.visibility = "collapse";
    } else {
        var localPlayer = Game.GetLocalPlayerInfo();
        var maxPlayerCount = 2;
        if(localPlayer){
            if(localPlayer.player_has_host_privileges && connectedPlayerCount < maxPlayerCount){
                $("#setting_box").style.visibility = "visible";
            } else{
                $("#setting_box").style.visibility = "collapse";
            }
        }
    }
}

function OnScreenLoad() {
	$.DispatchEvent( 'DOTAGlobalSceneSetCameraEntity', 'LoadingScreenMap', 'camera002', 40.0 );
}

(function(){
    if(Game.IsInToolsMode()){
        GameEvents.Subscribe("UPDATE_BOT_COUNT", OnUpdateBotCount);    
    }
})()
