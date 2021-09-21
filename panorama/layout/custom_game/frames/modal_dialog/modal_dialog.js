"use strict";

var m_LastModalDialog;
var m_LastModalDialogThink = -1;
var m_ModalDialogTypes = {};

function OnClose() {
	if (!m_LastModalDialog) return;

	m_LastModalDialog.SetHasClass("show", false);
	m_LastModalDialog.SetHasClass("close", true);

	m_LastModalDialogThink = $.Schedule(0.2, function () {
		$("#ModalDialogFrame").visible = false;
	});
}

function setting(key, value) {
	GameEvents.SendCustomGameEventToServer("avalon_player_setting",{key:key, value:value});
	OnClose();
}

function CommonDialog(data) {
	var CommonDialog = $("#CommonDialog");
	CommonDialog.SetHasClass("warning",false);

	$("#CommonDialogTitle").text = $.Localize(data.title);
	$("#CommonDialogText").text = $.Localize(data.text);

	switch(data.style)
	{
		case "warning":
			CommonDialog.SetHasClass("warning",true);
			break;
	}

	var CommonDialogButtonList = $("#CommonDialogButtonList");
	var CommonDialogButtonListIndex = 0;
	data.options.forEach(function (name, i) {
		var btn = CommonDialogButtonList.GetChild(CommonDialogButtonListIndex++);

		if (!btn) {
			btn = $.CreatePanel("Button",CommonDialogButtonList,"");
			btn.BLoadLayoutSnippet("NormalButton");
			btn.SetPanelEvent("onactivate",function () {
				btn.m_BindFunc(btn.m_BindName,btn.m_BindIndex);
				OnClose();
			});
		}

		btn.GetChild(0).text = $.Localize("xxwar_dialog_options_" + name);
		btn.m_BindName = name;
		btn.m_BindIndex = i;
		btn.m_BindFunc = data.response;
	})

	var max_count = CommonDialogButtonList.GetChildCount();
	for (var i = CommonDialogButtonListIndex; i < max_count; i++) {
		CommonDialogButtonList.GetChild(i).visible = false;
	}
}

function CommonForLuaDialog(data) {
	var CommonForLuaDialog = $("#CommonForLuaDialog");
	CommonForLuaDialog.SetHasClass("warning",false);

	$("#CommonForLuaDialogTitle").text = $.Localize(data.title);
	$("#CommonForLuaDialogText").text = $.Localize(data.text);

	switch(data.style)
	{
		case "warning":
			CommonForLuaDialog.SetHasClass("warning",true);
			break;
	}

	var CommonForLuaDialogButtonList = $("#CommonForLuaDialogButtonList");
	var CommonForLuaDialogButtonListIndex = 0;
	for(var i in data.options) {
		var btn = CommonForLuaDialogButtonList.GetChild(CommonForLuaDialogButtonListIndex++);

		if (!btn) {
			btn = $.CreatePanel("Button",CommonForLuaDialogButtonList,"");
			btn.BLoadLayoutSnippet("NormalButton");
			(function (btn, index) {
				btn.SetPanelEvent("onactivate",function () {
					GameEvents.SendCustomGameEventToServer("modal_dialog_response",{index:index});
					OnClose()
				});
			})(btn, parseInt(i));
		}

		btn.GetChild(0).text = $.Localize("xxwar_dialog_options_" + data.options[i]);
	}

	var max_count = CommonForLuaDialogButtonList.GetChildCount();
	for (var i = CommonForLuaDialogButtonListIndex; i < max_count; i++) {
		CommonForLuaDialogButtonList.GetChild(i).visible = false;
	}
}

function ShowDialog(type, data) {
	OnClose();

	var dialog = m_ModalDialogTypes[type];
	if (!dialog) return;

	try
	{
		$.CancelScheduled(m_LastModalDialogThink);
	}
	catch(e){}

	switch(type)
	{
		case "Common":
			CommonDialog(data);
			break;
		case "CommonForLua":
			CommonForLuaDialog(data);
			break;
	}

	m_LastModalDialog = dialog;
	m_LastModalDialog.SetHasClass("close", false);
	m_LastModalDialog.SetHasClass("show", true);

	$("#ModalDialogFrame").visible = true;
}

function ShowModalDialog(data) {
	ShowDialog(data.type, data)
}

;(function(){
	$("#ModalDialogFrame").visible = false;
	GameUI.ShowModalDialog = ShowDialog;

	GameEvents.Subscribe("show_modal_dialog", ShowModalDialog);

	m_ModalDialogTypes["Common"] = $("#CommonDialog");
	m_ModalDialogTypes["CommonForLua"] = $("#CommonForLuaDialog");

	for(var i in m_ModalDialogTypes) {
		m_ModalDialogTypes[i].SetHasClass("close", true);
	}
})()
