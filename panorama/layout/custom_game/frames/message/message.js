"use strict";

function setMsgText(mainPanel, args) {
	for(var i in args){
		var value = args[i];
		if (typeof value === "string") {

			if (value.indexOf("item_") === 0) {
				value = "DOTA_Tooltip_ability_" + value;
			}
			else if (value.indexOf("quest_special_hunting_") === 0) {
				value = $.Localize("avalon_quest_special_hunting_prefix") + $.Localize(value.replace("quest_special_hunting_",""));
			}

			mainPanel.SetDialogVariable(i,$.Localize(value));
		}
		if (typeof value === "number") {
			mainPanel.SetDialogVariableInt(i,value);
		}
	}
}

var m_BottomMessageTime = 0;
function BottomMessage(data) {
	var BottomMsg = $("#BottomMsgPanel");
	BottomMsg.SetHasClass("info",false);
	BottomMsg.SetHasClass("error",false);
	BottomMsg.SetHasClass("success",false);
	BottomMsg.SetHasClass("warning",false);
	BottomMsg.SetHasClass("show",false);

	var classList = data.class.split(' ');

	classList.forEach(function (v) {
		BottomMsg.SetHasClass(v,true);
	})

	if (data.args) {
		setMsgText(BottomMsg, data.args);
	}
	if (data.msg) {
		$("#BottomMsg").text = CombinationText(data.msg);
	}
	else {
		$("#BottomMsg").text = "NOT MESSAGE";
	}

	BottomMsg.SetHasClass("show",true);
	data._time = Game.Time();
	m_BottomMessageTime = data._time;

	if (data.log) {
		CreateMessageLog(data);
	}

	$.Schedule(data.duration || 3, function () {
		if (m_BottomMessageTime !== data._time) return;
		BottomMsg.SetHasClass("show",false);
	})
}

function LeftMessage(data) {
	var mainPanel = $.CreatePanel("Panel",$("#LeftMsgPanel"),"");
	mainPanel.BLoadLayoutSnippet('icon_msg');
	
	if (!data.class) data.class = "";

	var classList = data.class.split(' ');

	classList.forEach(function (v) {
		mainPanel.SetHasClass(v,true);
	})

	var msg_text = mainPanel.FindChild("msg_text");
	if (data.args) {
		setMsgText(msg_text, data.args);
	}
	if (data.msg) {
		msg_text.text = CombinationText(data.msg);
	}
	else {
		msg_text.text = "NOT MESSAGE";
	}
	mainPanel.SetHasClass("show",true);

	if (data.log) {
		CreateMessageLog(data);
	}

	$.Schedule(data.duration || 3, function () {
		mainPanel.SetHasClass("show",false);
		mainPanel.DeleteAsync(0.4);
	})
}

var messageBoxIsShow = false;
function MessageBox(data) {
	var msgBox = GameUI.GetMessageBox();
	var messageBoxContent = msgBox.FindChild("MessageBoxContent")
	var mainPanel = $.CreatePanel("Panel",messageBoxContent,"");
	mainPanel.BLoadLayoutSnippet('message-box-msg');
	mainPanel.isShow = true;

	var role = mainPanel.FindChild("role");
	var list = mainPanel.FindChild("list");

	role.text = $.Localize(data.role) + ": ";

	for(var i in data.list) {
		var t = data.list[i];

		var label = $.CreatePanel("Label",list,"");
		label.html = true;

		if (t.args) {
			setMsgText(label, t.args);
		}
		if (t.text) {
			label.text = CombinationText(t.text);
		}
		else {
			label.text = "Invalid";
		}

		var styles = data.styles;
		if (styles) {
			for(var i in styles)
			{
				label.style[i] = styles[i];
			}
		}
	}
	$.Schedule(0.15, function (){
		messageBoxContent.ScrollToBottom();
	})

	$.Schedule(data.duration || 5, function () {
		mainPanel.isShow = false;
		if(!messageBoxIsShow){
			mainPanel.SetHasClass("invisible", true);
		}
	})
}

function CreateMessageLog(data) {
	// var MessageLog = $("#MessageLog");
	// var label = $.CreatePanel("Label",MessageLog,"");
	// label.html = true;

	// if (data.args) {
	// 	setMsgText(label, data.args);
	// }

	// label.text = CombinationText(data.msg);

	// var styles = data.styles;
	// if (styles) {
	// 	for(var i in styles)
	// 	{
	// 		label.style[i] = styles[i];
	// 	}
	// }

	// if (MessageLog.BHasClass("show")) {
	// 	$.Schedule(0.15,function () {
	// 		MessageLog.ScrollToBottom();
	// 	})
	// }
}

function CreateMessage(data) {
	switch(data.type)
	{
		case 'bottom':
			BottomMessage(data);
			break;
		case 'log':
			CreateMessageLog(data);
			break;
		case 'left':
			LeftMessage(data);
			break;
		case 'message-box':
			MessageBox(data);
			break;
	}
}

function ShowMessageLog(){
	var msgBox = GameUI.GetMessageBox();
	var messageBoxContent = msgBox.FindChild("MessageBoxContent");
	if(messageBoxIsShow){
		messageBoxIsShow = false;
		$("#Log").SetHasClass("muted", true);
	} else {
		messageBoxIsShow = true;
		$("#Log").SetHasClass("muted", false);
	}
	SetChildrenVisible(messageBoxContent, messageBoxIsShow);
	if(messageBoxIsShow){
		messageBoxContent.ScrollToBottom();
	}
}

function SetChildrenVisible(panel, bool){
	var messageCount = panel.GetChildCount();
	for(let i = 0; i<messageCount; i++){
		var message = panel.GetChild(i);
		if(bool || message.isShow == false){
			message.SetHasClass("invisible", !bool);
		}
	}
}

function OnThrowError(data) {
	data.msg = data.text;
	data.log = true;
	data.class = "error";
	BottomMessage(data);
}

function CombinationText(textList){
	var content = "";
	for(let j in textList){
		let text = textList[j];
		content += $.Localize(text);
	}
	return content
}

function HideDOTATooltip(){
    $.DispatchEvent("DOTAHideTextTooltip");
    $.DispatchEvent("DOTAHideTitleTextTooltip");
}

function ShowDOTATooltip(targetId){
    switch(targetId){
        case "Log":
        	var panel = $("#" + targetId);
        	if(panel) {
        		if(panel.BHasClass("muted")){
        			$.DispatchEvent("DOTAShowTextTooltip", $("#" + targetId), $.Localize("#xxwar_message_button_show"));
        		} else {
        			$.DispatchEvent("DOTAShowTextTooltip", $("#" + targetId), $.Localize("#xxwar_message_button_hide"));
        		}
        	}            
            break;
    }
}

;(function(){
	GameUI.OnThrowError = OnThrowError;
	GameEvents.Subscribe("avalon_custom_message",CreateMessage);
	GameEvents.Subscribe("avalon_throw_error",OnThrowError)
})()
