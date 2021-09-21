var LastCloseTime = -1;

function Close(){
    $("#DeathPanelRoot").visible = false;
    LastCloseTime = Game.GetGameTime();
    GameEvents.SendCustomGameEventToServer("check_team_state",{})
}

function ShowRankPanel(data){
    if(!data) return
    if(data.state === 0){
        $("#RankRoot").visible = true;
        InitRankRoot();
    }
}

function Respawn(){
    LastCloseTime = Game.GetGameTime();

    var playerInfo = CustomNetTables.GetTableValue("PlayerInfo", String(Players.GetLocalPlayer()));
    if(playerInfo != null) {
        if(isNaN(playerInfo.XXCoin) == false) {
            GameEvents.SendCustomGameEventToServer('xxwar_respawn', {});
        } else {
            GameEvents.SendCustomGameEventToServer('store_update_coin_info', {});
        }
    }
}

function UpdateDeathFrame(){
    var playerInfo = CustomNetTables.GetTableValue("PlayerInfo", String(Players.GetLocalPlayer()));
    if(playerInfo != null) {
        if(playerInfo.ShowDeathFrame == 1) {
            var countdown = Players.GetRespawnSeconds(Players.GetLocalPlayer());
            if(countdown < 0){
                countdown = 0;
            }
            $("#txtCountdown").text = countdown;
            $("#txtXXCoin").text = playerInfo.XXCoin;
            $("#txtRespawnCoin").text = playerInfo.RespawnCoin;
            $("#btnRespawn").text = $.Localize("#xxwar_respawn");

            if(isNaN(playerInfo.XXCoin) == false && playerInfo.XXCoin > 0){
                $("#btnRespawn").visible = true;
            } else {
                $("#btnRespawn").visible = false;
            }

            if(LastCloseTime + 2.5 < Game.GetGameTime()){
                if(countdown > 0) {
                    $("#DeathPanelRoot").visible = true;    
                } else {
                    $("#DeathPanelRoot").visible = false;    
                }
            } else {
                $("#DeathPanelRoot").visible = false;
            }
        } else {
            $("#DeathPanelRoot").visible = false;
        }
    }
    $.Schedule(0.5, UpdateDeathFrame);
}

function CloseRank(){
    $("#RankRoot").visible = false;
}

function InitRankRoot(){
    var topbarInfo = CustomNetTables.GetTableValue("Common", "TopbarInfo");
    var alivePlayers = 0;
    var maxPlayers = 0;
	if(topbarInfo){
		alivePlayers = topbarInfo.AlivePlayerCount;
        maxPlayers = topbarInfo.TotalPlayerCount;
	}
    // $("#rank").text = String(alivePlayers + 1) + " / " + String(maxPlayers);
}

;(function(){
    GameEvents.Subscribe("check_team_state_response", ShowRankPanel);
    UpdateDeathFrame();
})()