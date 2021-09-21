GameUI.SetCameraDistance(1300);
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_HEROES, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_FLYOUT_SCOREBOARD, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_TEAMS, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_GAME_NAME, false )
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_HERO_SELECTION_CLOCK, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PROTECT, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ENDGAME, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_KILLCAM, false );
GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_TOP_BAR_BACKGROUND, false );

GameUI.CustomUIConfig().team_colors = {}
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_GOODGUYS] = "rgb(233, 160, 56)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_BADGUYS] = "rgb(52, 216, 144)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_1] = "rgb(0, 120, 60)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_2] = "rgb(220, 220, 50)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_3] = "rgb(110, 70, 180)"; 
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_4] = "rgb(0, 110, 210)"; 
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_5] = "rgb(245, 143, 152)"; 
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_6] = "rgb(101, 212, 19)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_7] = "rgb(27, 192, 216)";
GameUI.CustomUIConfig().team_colors[DOTATeam_t.DOTA_TEAM_CUSTOM_8] = "rgb(141, 208, 243)";

GameUI.GetHUDElements = function(){
	return $.GetContextPanel().GetParent().GetParent().FindChildTraverse("HUDElements");
}

var hudElements = $.GetContextPanel().GetParent().GetParent().FindChildTraverse("HUDElements");
var hideIdList = ["GlyphScanContainer","RoshanTimerContainer","ToggleScoreboardButton"];
hideIdList.forEach(function(id) {
	var ele = hudElements.FindChildTraverse(id);
	if(ele != null) ele.style.visibility = "collapse";
})

var combat_events = hudElements.FindChildTraverse("combat_events");
if(combat_events) {
	hudElements.FindChildTraverse("combat_events").style.marginTop = "420px";	
	hudElements.FindChildTraverse("combat_events").style.marginLeft = "280px";	
}

var orderContainer = $.GetContextPanel().GetParent().GetParent().FindChildTraverse("OrdersContainer");
if(orderContainer != null) {
	var queuedOrders = orderContainer.FindChildTraverse("QueuedOrders");
	if(queuedOrders != null) {
		queuedOrders.style.opacity = 0;
	}
}

var setFinish = false;
function SetTeamPanelHeight() {
	if(Game.GameStateIs(DOTA_GameState.DOTA_GAMERULES_STATE_CUSTOM_GAME_SETUP)){
		var teamsListRoot = $.GetContextPanel().GetParent().GetParent().FindChildTraverse("TeamsListRoot");
		if(teamsListRoot) {
			for(var i = 0; i < teamsListRoot.GetChildCount(); i++) {
				var panel = teamsListRoot.GetChild(i);
				panel.FindChildTraverse("JoinTeamLabel").style.height = "25px";
			}
			setFinish = true;
		}
	}

	if(!setFinish) {
		$.Schedule(0.25, SetTeamPanelHeight)
	}
}

SetTeamPanelHeight();
