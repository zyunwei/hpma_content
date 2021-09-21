
var hotkeys = ['Q','W','E','R','G','F', 'T', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'D', 'Z',
				'M', 'N', 'L', 'O','P','V','F1', 'F2', 'F3', 'F5', 'H', 'Z', 'B', 'TAB', 'SPACE'];

var F1_PresssCount = 0;
var F1_PresssEndTime = 0;

function HotKeyPress(key) {
	switch(key)
	{
		case 'H':
		case 'F5':
			GameUI.CloseAllFrame();
			return;
		case 'F1':
			if (Game.Time()>=F1_PresssEndTime) {
				F1_PresssEndTime = Game.Time() + 0.5;
				F1_PresssCount = 1;
				GameUI.SelectUnit(Players.GetLocalHero(),false);
			}
			else{
				F1_PresssCount++
				if (F1_PresssCount===2) {
					Players.PlayerPortraitClicked( Players.GetLocalPlayer(), false, false );
				}
				if (F1_PresssCount===3) {
					GameUI.CloseAllFrame();
				}
			}
			return;
	}

	if (GameUI.HasShowFrame('hero_frame')) {
		GameUI.HeroFrame_OnKeyPress(key);
		return;
	}
	else if (GameUI.HasShowFrame('npc_task')) {
		GameUI.NPCTask_OnKeyPress(key);
		return;
	}
	else if (GameUI.HasShowFrame('courier_frame')) {
		GameUI.Courier_OnKeyPress(key);
		return;
	}
}

function Register() {
	hotkeys.forEach(function (v,i) {
		Game.AddCommand( "CustomKey_" + v, function () {
			HotKeyPress(v);
		}, "", 0 );
	})
}

;(function () {
	for (let i = 4; i <= 9; i++) {
		Game.CreateCustomKeyBind(i.toString(), "CustomKey_" + i);
	}
	// Game.CreateCustomKeyBind("SHIFT", "CustomKey_SHIFT");

	Register();
})()