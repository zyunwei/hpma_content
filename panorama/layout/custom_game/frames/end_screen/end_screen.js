"use strict";

var logoRankSrc = "file://{resources}/images/custom_game/rank/";
var scoreLoaded = false;

function SetText(panel, childName, textValue) {
    if (panel === null)
        return;
    var childPanel = panel.FindChildInLayoutFile(childName)
    if (childPanel === null)
        return;

    childPanel.text = textValue;
}

function OnItemMouseOver(item) {
    item.FindChild('tooltip').ShowTooltip("itemname=" + item.FindChild("item-img").itemname);
}

function OnItemMouseOut(item) {
    item.FindChild('tooltip').HideTooltip();
}

function RegisterEvents(item) {
    item.SetPanelEvent("onmouseover",function() {
        OnItemMouseOver(item);
    });
    item.SetPanelEvent("onmouseout",function() {
        OnItemMouseOut(item);
    });
}

function UpdatePlayerPanel(playerInfo, scoreInfo, playersContainer) {
    var playerPanelName = "_dynamic_player_" + playerInfo.playerId;
    var playerPanel = playersContainer.FindChild(playerPanelName);
    if (playerPanel === null) {
        playerPanel = $.CreatePanel("Panel", playersContainer, playerPanelName);
        playerPanel.SetAttributeInt("player_id", playerInfo.playerId);
        playerPanel.BLoadLayout("file://{resources}/layout/custom_game/frames/end_screen/end_screen_player.xml", false, false);
    }

    playerPanel.SetHasClass("is_local_player", (playerInfo.playerId == Game.GetLocalPlayerID()));

    var playerInfoClient = Game.GetPlayerInfo(playerInfo.playerId);
    if (playerInfoClient) {
        SetText(playerPanel, "Rank", playerInfo.rank);
        SetText(playerPanel, "PlayerName", playerInfoClient.player_name);
        SetText(playerPanel, "Level", playerInfoClient.player_level);
        SetText(playerPanel, "Kills", playerInfoClient.player_kills);
        SetText(playerPanel, "Deaths", playerInfoClient.player_deaths);
        SetText(playerPanel, "Assists", playerInfoClient.player_assists);
        SetText(playerPanel, "PlayerRound", playerInfo.battleCount);
        SetText(playerPanel, "PlayerTime", playerInfo.lastTime);
        SetText(playerPanel, "Gold", playerInfo.goldTotal);
        SetText(playerPanel, "Bullion", playerInfo.savedBullion);
        SetText(playerPanel, "BullionJackpot", playerInfo.bullionJackpot);

        var logoGrade = playerPanel.FindChildInLayoutFile("logoGrade");

        if(scoreInfo == null){
            SetText(playerPanel, "lblScore", "..");   
            SetText(playerPanel, "lblScoreToUpgrade", "");
            SetText(playerPanel, "lblGrade", $.Localize("#UI_RANK_1"));
            if(logoGrade != null){
                logoGrade.SetImage(logoRankSrc + "1.png");
            }
        } else{
            SetText(playerPanel, "lblScore", scoreInfo.Score >= 0 ? "+ " + scoreInfo.Score : scoreInfo.Score );    
            SetText(playerPanel, "lblScoreToUpgrade", $.Localize("#UI_SCORE_TO_UPGRADE") + " " + scoreInfo.ScoreToUpgrade); 
            SetText(playerPanel, "lblGrade", $.Localize("#UI_RANK_" + scoreInfo.Grade));
            if(logoGrade != null){
                logoGrade.SetImage(logoRankSrc + scoreInfo.Grade + ".png");
            }
        }

        var playerAvatar = playerPanel.FindChildInLayoutFile("dotaUserAvatar");
        var botAvatar = playerPanel.FindChildInLayoutFile("imgBotAvatar");
        var botAvatarBackground = playerPanel.FindChildInLayoutFile("avatarBackground");

        if(playerAvatar != null) {
            playerAvatar.steamid = playerInfoClient.player_steamid;
            if (playerInfoClient.player_connection_state == 1) {
                playerAvatar.style.visibility = "collapse";
                botAvatar.style.visibility = "visible";
                botAvatarBackground.style.backgroundColor = GameUI.CustomUIConfig().team_colors[playerInfoClient.player_team_id];
            } else {
                playerAvatar.style.visibility = "visible";
                botAvatar.style.visibility = "collapse";
            }    
        }

        if (playerInfoClient.player_selected_hero_id == -1) {
            SetText(playerPanel, "HeroName", $.Localize("#DOTA_Scoreboard_Picking_Hero"));
        }
        else {
            SetText(playerPanel, "HeroName", $.Localize("#" + playerInfoClient.player_selected_hero));
        }

        var heroNameAndDescription = playerPanel.FindChildInLayoutFile("HeroNameAndDescription");
        if (heroNameAndDescription) {
            if (playerInfoClient.player_selected_hero_id == -1) {
                heroNameAndDescription.SetDialogVariable("hero_name", $.Localize("#DOTA_Scoreboard_Picking_Hero"));
            }
            else {
                heroNameAndDescription.SetDialogVariable("hero_name", $.Localize("#" + playerInfoClient.player_selected_hero));
            }
            heroNameAndDescription.SetDialogVariableInt("hero_level", playerInfoClient.player_level);
        }

        var playerColorBar = playerPanel.FindChildInLayoutFile("PlayerColorBar");
        if (playerColorBar !== null) {
            if (GameUI.CustomUIConfig().team_colors) {
                var teamColor = GameUI.CustomUIConfig().team_colors[playerInfoClient.player_team_id];
                if (teamColor) {
                    playerColorBar.style.backgroundColor = teamColor;
                }
            }
            else {
                var playerColor = "#000000";
                playerColorBar.style.backgroundColor = playerColor;
            }
        }

        var playerItemsContainer = playerPanel.FindChildInLayoutFile("PlayerItemsContainer");
        if (playerItemsContainer) {
            var playerItems = Game.GetPlayerItems(playerInfo.playerId);
            if (playerItems) {
                // $.Msg( "playerItems = ", playerItems );
                for (var i = playerItems.inventory_slot_min; i < playerItems.inventory_slot_max; ++i){
                    var itemPanelName = "_dynamic_item_" + i;
                    var itemPanel = playerItemsContainer.FindChild( itemPanelName );
                    var itemInfo = playerItems.inventory[i];
                    if ( itemPanel === null && !!itemInfo) {
                        itemPanel = $.CreatePanel( "Panel", playerItemsContainer, itemPanelName );
                        itemPanel.AddClass( "PlayerItem" );
                        itemPanel.BLoadLayoutSnippet('item');
                        itemPanel.FindChild("item-img").itemname = itemInfo.item_name;
                        // var tooltip = itemPanel.FindChild('tooltip');
                        // tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
                        // tooltip.Setup("item_for_kv");
                        // RegisterEvents(itemPanel);
                    }
                }
            }
        }
    }
}

function UpdateTeamPanel(playerInfo, scoreInfo, containerPanel) {
    if(playerInfo.isEmpty){
        containerPanel.style.visibility = "collapse";
        return;
    }
    var teamPanelName = "_dynamic_team_" + playerInfo.teamId;
    var teamPanel = containerPanel.FindChild(teamPanelName);
    if (teamPanel === null) {
        teamPanel = $.CreatePanel("Panel", containerPanel, teamPanelName);
        teamPanel.SetAttributeInt("team_id", playerInfo.teamId);
        teamPanel.BLoadLayout("file://{resources}/layout/custom_game/frames/end_screen/end_screen_team.xml", false, false);
    }

    var localPlayerTeamId = Game.GetLocalPlayerInfo().player_team_id;

    teamPanel.SetHasClass("local_player_team", localPlayerTeamId == playerInfo.teamId);

    var teamPlayers = Game.GetPlayerIDsOnTeam(playerInfo.teamId);
    var playersContainer = teamPanel.FindChildInLayoutFile("PlayersContainer");
	UpdatePlayerPanel(playerInfo, scoreInfo, playersContainer);

    SetText(teamPanel, "TeamName", $.Localize(playerInfo.teamInfo.team_name));

    if (GameUI.CustomUIConfig().team_colors) {
        var teamColor = GameUI.CustomUIConfig().team_colors[playerInfo.teamId];
        var teamColorPanel = teamPanel.FindChildInLayoutFile("TeamColor");

        teamColor = teamColor.replace(";", "");

        if (teamColorPanel) {
            teamNamePanel.style.backgroundColor = teamColor + ";";
        }

        var teamColor_GradentFromTransparentLeft = teamPanel.FindChildInLayoutFile("TeamColor_GradentFromTransparentLeft");
        if (teamColor_GradentFromTransparentLeft) {
            var gradientText = 'gradient( linear, 0% 0%, 250% 0%, from( #00000000 ), to( ' + teamColor + ' ) );';
            teamColor_GradentFromTransparentLeft.style.backgroundColor = gradientText;
        }
    }

    return teamPanel;
}

function AutoUpdateScoreInfo(){
    var data = CustomNetTables.GetTableValue("end_game_table", 'score_info');
    if(data){
        scoreLoaded = true;
        RefreshTable();
    } else if(scoreLoaded == false) {
        $.Schedule(1, AutoUpdateScoreInfo);
    }
}

function RefreshTable(){
    var data = CustomNetTables.GetTableValue("end_game_table", 'end_info');
    var scoreData = CustomNetTables.GetTableValue("end_game_table", 'score_info');
    if(scoreData){
        scoreLoaded = true;
    }
    var teamsContainer = $("#TeamsContainer")
    var teamInfoList = [];

    for(var index in data){
        var playerInfo = data[index];

        var scoreInfo = null;
        if(scoreData){
            for(var scoreIndex in scoreData){
                if(scoreData[scoreIndex].PlayerId == playerInfo.playerId){
                    scoreInfo = scoreData[scoreIndex];
                    break;
                }
            }
        }

        if(playerInfo.battleCount <= 0){
            continue;
        }
        var teamInfo = Game.GetTeamDetails(playerInfo.teamId);
        playerInfo.teamInfo = teamInfo;
        teamInfoList.push(teamInfo);
        UpdateTeamPanel(playerInfo, scoreInfo, teamsContainer);
    }
    
    $.GetContextPanel().SetHasClass("endgame", 1);

    var delay = 0.2;
    var delay_per_panel = 1 / teamInfoList.length;
    for (var teamInfo of teamInfoList) {
        var teamPanelName = "_dynamic_team_" + teamInfo.team_id;
        var teamPanel = teamsContainer.FindChild(teamPanelName);
        teamPanel.SetHasClass("team_endgame", false);
        var callback = function (panel) {
            return function () { panel.SetHasClass("team_endgame", 1); }
        }(teamPanel);
        $.Schedule(delay, callback)
        delay += delay_per_panel;
    }

    var winningTeamId = Game.GetGameWinner();
    var winningTeamDetails = Game.GetTeamDetails(winningTeamId);
    var endScreenVictory = $("#EndScreenVictory");
    endScreenVictory.SetDialogVariable("winning_team_name", $.Localize(winningTeamDetails.team_name));

    if (GameUI.CustomUIConfig().team_colors) {
        var teamColor = GameUI.CustomUIConfig().team_colors[winningTeamId];
        if(teamColor){
            teamColor = teamColor.replace(";", "");
            $("#EndScreenBackground").style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( " + teamColor + " ), color-stop( 0.12, #000000FF ), color-stop( 0.5, #00000022 ), to( #00000000 ) );"    
        }
    }
}

(function () {
    AutoUpdateScoreInfo();
	RefreshTable();
})();
