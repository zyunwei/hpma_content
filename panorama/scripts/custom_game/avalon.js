/*
--------------------------------------------------------------------------------
面板控制系统

面板统一放在layout/custom_game/frames/下面，面板名称既是文件夹名称，入口文件为main.xml
js和css文件可随意，但是如果是面板的js和css文件，推荐放到layout/custom_game/frames/下面，跟main.xml一起
这种做法类似avalon库中的模块

面板的显示控制通过css中的"show" class，例如 .Root{visibility: collapse;} .Root.show{visibility:visible;}
为了统一控制，都必须写成上面例子所示的写法

在m_Frames中定义要载入的面板
{
	frame_name: "面板名称"	// 需要跟文件夹名称对应

	// 相同标签的面板只允许同时显示一个,当label没有定义的时候面板始终显示
	label: "标签"

	// 是否默认显示，可选项，如果你不想面板一开始就显示
	// 如果为true，默认给予"show"，当然同一个label只显示一个
	open: boolean or function
}
*/

GameUI.m_LoadedFrames = {}
GameUI.m_LastOpenFrame = {}

// 获取面板
GameUI.GetFrame = function(frame_name) {
	return this.m_LoadedFrames[frame_name];
}

// 设置面板
GameUI.SetFrame = function(frame_name,context_panel) {
	if (context_panel && context_panel.paneltype === "Panel") {this.m_LoadedFrames[frame_name] = context_panel;}
}

// 判断是否有面板
GameUI.HasFrame = function(frame_name) {
	return this.m_LoadedFrames[frame_name] !== undefined;
}

// 判断面板是否打开
GameUI.HasShowFrame = function (frame_name) {
	if(GameUI.HasFrame(frame_name) == false){
		return false;
	}
	return this.m_LoadedFrames[frame_name].BHasClass("show");
}

// 删除面板
GameUI.RemoveFrame = function(frame_name) {
	var frame = this.m_LoadedFrames[frame_name];
	frame.visible = false;
	delete this.m_LoadedFrames[frame_name];
}

GameUI.CloseFrame = function(frame_name) {
	var frame = this.m_LoadedFrames[frame_name];
	if(frame){
		frame.RemoveClass("show");
		var label = frame.m_Framelabel;
		this.m_LastOpenFrame[label] = null;
		TouchFrameEvent(frame_name,false);
	}
}

var m_FrameEvents = {};
GameUI.FrameEvent = function(str,func) {
	m_FrameEvents[str] = func;
}

function TouchFrameEvent(frame_name, isOpen) {
	for(var i in m_FrameEvents) {
		m_FrameEvents[i](frame_name,isOpen);
	}
}

// 加载面板
GameUI.LoadFrame = function(panel,frame_name,label,open,hold) {
	label = label || "";

	$.Msg("[Frame]: ", frame_name);
	// var panel = $.CreatePanel("Panel",$("#FrameList"),"frame_"+frame_name);
	// panel.LoadLayoutAsync("file://{resources}/layout/custom_game/frames/" + frame_name + "/" + frame_name + ".xml",false,false);
	panel.m_Framelabel = label;
	panel.m_FrameName = frame_name;
	panel.m_IsHold = hold;
	this.SetFrame(frame_name,panel);

	if (typeof open === "boolean"){
		panel.SetHasClass("show",open);
		if (open) {
			this.m_LastOpenFrame[label] = panel;
		}
	}
	else if (label === ""){
		panel.SetHasClass("show",true);
	}
}

// 切换面板
GameUI.SwapFrame = function(frame_name, isForce) {
	var newFrame = this.GetFrame(frame_name);
	if (!newFrame) return;

	var label = newFrame.m_Framelabel;
	if (label) {
		var oldFrame = this.m_LastOpenFrame[label];
	
		// 相同面板
		if (oldFrame && oldFrame.m_FrameName == newFrame.m_FrameName) {
			isForce = isForce === true;
			if (!isForce)
				this.m_LastOpenFrame[label] = null;

			oldFrame.SetHasClass('show',isForce);
			TouchFrameEvent(frame_name,isForce);
			return;
		}

		// 关闭所有面板
		if (label === "all") {
			this.CloseAllFrame();
		}

		// 切换面板
		if (oldFrame && oldFrame.paneltype === "Panel")
		{
			oldFrame.RemoveClass("show");
			TouchFrameEvent(oldFrame.m_FrameName,false);
		}

		// 打开新面板
		newFrame.AddClass("show");
		TouchFrameEvent(frame_name,true);
		this.m_LastOpenFrame[label] = newFrame;
	}
	else if(label === '') {
		newFrame.AddClass("show");
	}
}

// 关闭所有面板
GameUI.CloseAllFrame = function() {
	for( var i in this.m_LoadedFrames ){
		var frame = this.m_LoadedFrames[i];
		if (frame && !frame.m_IsHold) {
			frame.SetHasClass("show",false);
			TouchFrameEvent(frame.m_FrameName,false);
		}
	}
	for( var i in this.m_LastOpenFrame){
		var frame = this.m_LastOpenFrame[i];
		if (frame && !frame.m_IsHold) {
			this.m_LastOpenFrame[i] = null;
		}
	}
}

//--------------------------------------------------------------------------------
// 与Lua的AvalonGeneral模块交互
GameUI.AvalonGeneral = function(tag,key){
	var net_table_key_name;
	if(key === undefined || key === null) {
		key = tag;
		tag = null;
	}

	if(tag === undefined || tag === null || typeof tag !== 'string')
		net_table_key_name = 'avalon_module_general_net_table___default__';
	else
		net_table_key_name = 'avalon_module_general_net_table_' + tag;

	var table = CustomNetTables.GetTableValue('General',net_table_key_name);
	if (table) {
		return table[key];
	}
}

//--------------------------------------------------------------------------------
// 获取steamid
var m_SteamID = null;
GameUI.GetSteamID = function() {
	if (!m_SteamID) {
		m_SteamID = Game.GetLocalPlayerInfo().player_steamid;
	}
	return m_SteamID;
}

//--------------------------------------------------------------------------------
GameUI.Print = function(obj,tab) {
	if (typeof obj !== 'object') return;
	tab = tab || '';

	$.Msg(tab+'{');
	for(var i in obj) {
		var v = obj[i];
		if (typeof v === 'object') {
			$.Msg(tab+'    '+i);
			this.Print(v,tab+'    ');
		}
		else {
			$.Msg(tab+'    '+i+'\t\t\t'+v+' ('+typeof(v)+')');
		}
	}
	$.Msg(tab+'}');
}

//--------------------------------------------------------------------------------
Players.GetLocalHero = function() {
	return Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
}

GameUI.m_TooltipManagerResetFuncs={};

//--------------------------------------------------------------------------------
GameUI.SimplifyAbilitySpecial = function (special) {
	for (var i in special) {
		for(var name in special[i]) {
			if (name !== "var_type") {
				if (special[i]["var_type"] == "FIELD_FLOAT") {
					// $.Msg(special[i][name].toFixed(2))
					special[name] = parseFloat(special[i][name]).toFixed(2)
					special[name] = parseInt(special[i][name]*100)/100
				} else {
					special[name] = special[i][name]
				}
			}
		}
	}
}

//--------------------------------------------------------------------------------
GameEvents.Subscribe("avalon_http_request", function (request) {
	$.AsyncWebRequest(
	request.url,
	{
		type: request.method,
		headers:request.headers || {},
		data: request.data || {},
		complete: function(result) {

			if (result.responseText) {
				result.responseText = result.responseText.replace("\u0000","")
			}
			
			GameEvents.SendCustomGameEventToServer("avalon_http_response",{
				url: request.url,
				unique: request.unique,
				result: result,
			})
		},
		timeout: request.timeout || 5000
	});
});