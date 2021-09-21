"use strict";

function OnActive(item) {
	var args = item.m_Args;
	item.m_Func(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
}

function OnContextMenuSetup(data) {
	var list = data.list;
	var ContextPanel = $.GetContextPanel();
	var ContextPanelIndex = 0;
	ContextPanel.style.width = (data.width || 100) + "px";

	var lastIndex = -1;
	list.forEach(function (t,i) {
		var panel = ContextPanel.GetChild(ContextPanelIndex++);
		lastIndex = i;

		if (!panel) {
			panel = $.CreatePanel('Button',ContextPanel,'');
			panel.BLoadLayoutSnippet('item');
			panel.SetHasClass('first',i === 0);
			panel.SetPanelEvent('onactivate', function () {
				OnActive(panel);
				GameUI.HideContextMenu();
			})
		}

		panel.FindChild('text').text = $.Localize(t.name);
		panel.m_Func = t.func;
		panel.m_Args = t.args;
		panel.visible = true;
		
	})

	var max = ContextPanel.GetChildCount();
	for (var i = lastIndex+1; i < max; i++) {
		ContextPanel.GetChild(i).visible = false;
	}
}

;(function(){
	$.GetContextPanel().OnContextMenuSetup = OnContextMenuSetup;
})()
