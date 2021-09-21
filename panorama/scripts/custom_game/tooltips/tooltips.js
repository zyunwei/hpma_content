var m_Type = "";
var m_Path = "";
var m_UnqiueStr = "TooltipManager" + (Math.random() * 9999 + Game.Time()).toString();
var m_IsHide = true;

function Setup(type, path) {
	m_Type = "CustomTooltip_" + type;
	m_Path = (!path)? "file://{resources}/layout/custom_game/tooltips/" + type + "/" + type + ".xml" : path;
}

function ShowTooltip(params) {
	if (m_IsHide) {
		m_IsHide = false;
		$.DispatchEvent("UIShowCustomLayoutParametersTooltip", m_Type, m_Path,params + "&ResetKey=" + m_UnqiueStr);
	}
}

function HideTooltip() {
	m_IsHide = true;
	$.DispatchEvent("UIHideCustomLayoutTooltip", m_Type);
}

GameUI.m_TooltipManagerResetFuncs[m_UnqiueStr] = function() {
	if(m_IsHide)return;
	$.DispatchEvent("UIShowCustomLayoutTooltip", m_Type, m_Path);
}

$.GetContextPanel().ShowTooltip = ShowTooltip;
$.GetContextPanel().HideTooltip = HideTooltip;
$.GetContextPanel().Setup = Setup;
