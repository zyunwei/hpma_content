"use strict";

var m_TypePanels = {};
var m_Target;
var m_Pos;
var m_Type;
var m_Data;
var TopArrow = $("#TopArrow");
var LeftArrow = $("#LeftArrow");
var RightArrow = $("#RightArrow");
var BottomArrow = $("#BottomArrow");
var m_IsShow = false;

function SetContextMenuPosition() {
	var ContextMenuFrame = $("#ContextMenuFrame");
	TopArrow.visible = false;
	LeftArrow.visible = false;
	RightArrow.visible = false;
	BottomArrow.visible = false;

	var w = Game.GetScreenWidth();
	var h = Game.GetScreenHeight();
	var targetPos = m_Target.GetPositionWithinWindow();
	var targetPosX = targetPos.x;
	var targetPosY = targetPos.y;
	var targetWidth = m_Target.actuallayoutwidth;
	var targetHeight = m_Target.actuallayoutheight;
	var frameWidth = ContextMenuFrame.actuallayoutwidth;
	var frameHeight = ContextMenuFrame.actuallayoutheight;
	if (frameWidth == 0 || frameHeight == 0) return true;

	if (m_Pos === "top") {
		BottomArrow.visible = true;
		var arrowWidth = BottomArrow.actuallayoutwidth;
		if (targetPosY >= frameHeight) {
			var y = targetPosY - frameHeight;
			var x = targetPosX - (frameWidth/2-targetWidth/2)
			if (x < 0) x = 0;
			if (x+frameWidth > w) x -= frameWidth-(w-x);
			ContextMenuFrame.style.transform = "translate3d( " + ((x/w) * (w/h)*1080) + "px, " + (y/h*1080) + "px, 0px)"

			var arrowX = ((frameWidth/2/w) * (w/h)*1080) - arrowWidth/2;
			BottomArrow.style.transform = "translateX(" + Math.floor(arrowX) + "px)";
			return true;
		}
	}
	else if(m_Pos === "bottom")
	{
		TopArrow.visible = true;
		var arrowWidth = TopArrow.actuallayoutwidth;
		if ((h - targetPosY - targetHeight) >= frameHeight) {
			var y = targetPosY + targetHeight;
			var x = targetPosX - (frameWidth/2-targetWidth/2)
			if (x < 0) x = 0;
			if (x+frameWidth > w) x -= frameWidth-(w-x);
			ContextMenuFrame.style.transform = "translate3d( " + ((x/w) * (w/h)*1080) + "px, " + (y/h*1080) + "px, 0px)"

			var arrowX = ((frameWidth/2/w) * (w/h)*1080) - arrowWidth/2;
			TopArrow.style.transform = "translateX(" + Math.floor(arrowX) + "px)";
			return true
		}
	}
	else if(m_Pos === "right")
	{
		LeftArrow.visible = true;
		var arrowHeight = LeftArrow.actuallayoutheight;
		if ((w-targetPosX-targetWidth) >= frameWidth) {
			var y = targetPosY - (frameHeight/2-targetHeight/2)
			var x = targetPosX+targetWidth
			if (y < 0) y = 0;
			if (y+frameHeight > h) y -= frameHeight-(h-y);
			ContextMenuFrame.style.transform = "translate3d( " + ((x/w) * (w/h)*1080) + "px, " + (y/h*1080) + "px, 0px)"

			var arrowY = ((frameHeight/2/w) * (w/h)*1080) - arrowHeight/2;
			LeftArrow.style.transform = "translateY(" + Math.floor(arrowY) + "px)";
			return true
		}
	}
	else if(m_Pos === "left")
	{
		RightArrow.visible = true;
		var arrowHeight = RightArrow.actuallayoutheight;
		if (targetPosX >= frameWidth) {
			var y = targetPosY - (frameHeight/2-targetHeight/2)
			var x = targetPosX - frameWidth
			if (y < 0) y = 0;
			if (y+frameHeight > h) y -= frameHeight-(h-y);
			ContextMenuFrame.style.transform = "translate3d( " + ((x/w) * (w/h)*1080) + "px, " + (y/h*1080) + "px, 0px)"

			var arrowY = ((frameHeight/2/w) * (w/h)*1080) - arrowHeight/2;
			RightArrow.style.transform = "translateY(" + Math.floor(arrowY) + "px)";
			return true
		}
	}

	return false;
}

function Setup() {
	for (var i = 0; i < 4; i++) {
		if (SetContextMenuPosition()) {
			break;
		}
		if (m_Pos === "top") {
			m_Pos = "bottom";
			continue;
		}
		if (m_Pos === "bottom") {
			m_Pos = "top";
			continue;
		}
		if (m_Pos === "left") {
			m_Pos = "right";
			continue;
		}
		if (m_Pos === "right") {
			m_Pos = "left";
			continue;
		}
	}

	$("#CustomContextMenuBg").visible = true;

	if (!m_IsShow) {
		m_IsShow = true;
		$.Schedule(0.06,Setup);
	}
}

/*
 * Show context menu
 * 
 */
function ShowContextMenu(target, pos, type, data) {

	m_Type = m_TypePanels[type];
	if (!m_Type) return;
	m_IsShow = false;

	m_Target = target;
	m_Pos = pos;

	if (m_Type.OnContextMenuSetup) {
		m_Type.OnContextMenuSetup(data);
	}
	m_Type.visible = true;
	
	$.Schedule(0.1,Setup);
}

function HideContextMenu() {
	$("#CustomContextMenuBg").visible = false;
	for(var i in m_TypePanels)
	{
		m_TypePanels[i].visible = false;
	}
	m_Type = null;
}

/*
 * Register a context menu type
 *
 * for example: GameUI.RegisterContextMenuType('test','file://{resources}/layout/custom_game/context_menu_test.xml')
 *
 */
function RegisterContextMenuType(typename, path) {
	var panel = $.CreatePanel('Panel',$("#Contents"),"");
	panel.BLoadLayout(path,false,false);
	panel.visible = false;
	m_TypePanels[typename] = panel;
}

function ShowBaseContextMenu(target, pos, list, width) {
	if (!list.forEach) return;

	ShowContextMenu(target, pos, 'base', {list:list, width:width})
}

;(function(){
	GameUI.ShowContextMenu = ShowContextMenu;
	GameUI.HideContextMenu = HideContextMenu;
	GameUI.RegisterContextMenuType = RegisterContextMenuType;
	GameUI.ShowBaseContextMenu = ShowBaseContextMenu;
	HideContextMenu();

	RegisterContextMenuType("base", "file://{resources}/layout/custom_game/context_menu/base/base.xml");
	RegisterContextMenuType("split_item", "file://{resources}/layout/custom_game/context_menu/split_item/split_item.xml");
})()
