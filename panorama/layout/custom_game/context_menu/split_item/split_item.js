"use strict";

var m_SplitItemTextEntry;
var m_BagSlot = -1;

function OnCancel() {
	GameUI.HideContextMenu();
}

// 加
function OnAdd() {
	var num = parseInt(m_SplitItemTextEntry.text);
	m_SplitItemTextEntry.text = num+1;
}

// 减
function OnMinus() {
	var num = parseInt(m_SplitItemTextEntry.text);
	if (num-1<1) return;
	m_SplitItemTextEntry.text = num-1;
}

// 文本改变
function OnTextChange() {
	var text = m_SplitItemTextEntry.text;
	if (text.replace(/\d+/g,'') !== '') {
		m_SplitItemTextEntry.text = 1;
	}
}

// 提交
function OnSubmitted() {
	var num = parseInt(m_SplitItemTextEntry.text);
	if (!num || num <= 0) return;
	GameEvents.SendCustomGameEventToServer('xxwar_bag_split_item',{'slot':m_BagSlot,'num':num});
	GameUI.HideContextMenu();
}

// 显示
function OnContextMenuSetup(data) {
	m_SplitItemTextEntry.text = 1;
	m_SplitItemTextEntry.SetFocus();
	m_BagSlot = data.slot;
}

;(function(){
	m_SplitItemTextEntry = $("#SplitItemTextEntry");

	$.GetContextPanel().OnContextMenuSetup = OnContextMenuSetup;
})()
