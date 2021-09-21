"use strict";

GameUI.HideEnemyInfo = function(){}

function OnSelectUnit() {
	var unit = Players.GetQueryUnit(Players.GetLocalPlayer());

	if (Entities.IsEnemy(unit)) {
		// GameUI.ShowEnemyInfo(unit);
	}
	else{
		GameUI.HideEnemyInfo();
	}

	if (unit > 0) {
		var unit_name = Entities.GetUnitName(unit);
		return;
	}
	
	GameUI.SwapFrame('hero_frame', true);
}

function OnPlaySound(data) {
	Game.EmitSound(data.sound);
}

var _ForceAutoSelectFate = true;
GameUI.ForceAutoSelectFate = function () {
	return _ForceAutoSelectFate;
}

;(function(){
	// VGUI
	GameUI.SetRenderTopInsetOverride( 0 );
	GameUI.SetRenderBottomInsetOverride( 0 );
	
	var showUI = false;
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_PANEL, showUI );
	// GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_ACTION_MINIMAP, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PANEL, showUI );

	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_SHOP, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_ITEMS, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_QUICKBUY, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_COURIER, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_PROTECT, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_INVENTORY_GOLD, showUI );
	GameUI.SetDefaultUIEnabled( DotaDefaultUIElement_t.DOTA_DEFAULT_UI_SHOP_SUGGESTEDITEMS, showUI );

	GameEvents.Subscribe("dota_player_update_selected_unit", OnSelectUnit);
	GameEvents.Subscribe("dota_player_update_query_unit", OnSelectUnit);
	GameEvents.Subscribe("play_sound", OnPlaySound);
})()
