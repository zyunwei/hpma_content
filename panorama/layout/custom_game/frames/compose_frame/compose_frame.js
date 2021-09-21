"use strict";

GameUI.LoadFrame($("#ComposeFrame"),'compose_frame','right');

var m_CanComposeToItems = {};
var m_HasInit = false;

var ITEM_KIND_WEAPON=1
var ITEM_KIND_SHOES=2
var ITEM_KIND_CLOTHES=3
var ITEM_KIND_HAT=4
var ITEM_KIND_TRINKET=5
var ITEM_KIND_GLOVES=6
var ITEM_KIND_CONSUMABLE=7
var ITEM_KIND_GAME_UI=1100

var m_ItemKindTexts = [];
m_ItemKindTexts[ITEM_KIND_WEAPON] = "item_kind_weapon";
m_ItemKindTexts[ITEM_KIND_SHOES] = "item_kind_shoes";
m_ItemKindTexts[ITEM_KIND_CLOTHES] = "item_kind_clothes";
m_ItemKindTexts[ITEM_KIND_HAT] = "item_kind_hat";
m_ItemKindTexts[ITEM_KIND_TRINKET] = "item_kind_trinket";
m_ItemKindTexts[ITEM_KIND_GLOVES] = "item_kind_gloves";
m_ItemKindTexts[ITEM_KIND_CONSUMABLE] = "item_kind_consumable";

var m_ComposeItemPanel = [];
var m_ComposeItemTable = [];
var m_Page = 0;
var m_CurSelectComposeBtn;
var m_Kind;

function PreviousPage() {
	if (m_Kind<0 || m_Page === 0) return;
	m_Page -= 6;
	DisplayComposeItems(m_Kind);
}

function NextPage() {
	if (m_Kind<0) return;

	var list = m_ComposeItemTable[m_Kind];
	if (!list || !list[m_Page+6]) return;

	m_Page += 6;
	DisplayComposeItems(m_Kind);
}

function Purchase() {
	$("#PurchaseButton").checked = false;
	if (!m_CurSelectComposeBtn) return;
	if (!m_CurSelectComposeBtn.m_Data) return;
	var data = m_CurSelectComposeBtn.m_Data;
	GameEvents.SendCustomGameEventToServer("purchase_item",{index:data.ID,itemname:data.composeItem});
}

function OnBtnMouseOver(btn) {
	if (!btn.m_ItemName) return;
	btn.FindChild('tooltip').ShowTooltip("itemname=" + btn.m_ItemName);
}

function OnBtnMouseOut(btn) {
	btn.FindChild('tooltip').HideTooltip();
}

function RegisterItemEvents(item) {
	item.SetPanelEvent("onmouseover", function () {
		OnBtnMouseOver(item);
	})
	item.SetPanelEvent("onmouseout", function () {
		OnBtnMouseOut(item);
	})
}

function RegisterRequireItemEvents(item) {
	item.SetPanelEvent("onmouseover", function () {
		OnBtnMouseOver(item);
	})
	item.SetPanelEvent("onmouseout", function () {
		OnBtnMouseOut(item);
	})
	// item.SetPanelEvent("onactivate", function () {
	// 	GameUI.AddMiniMapIcon(item.m_ItemName);
	// })
}

function DisplayRequireItems(panel) {
    if (!panel.m_Data) return;
    if (m_CurSelectComposeBtn) {
        m_CurSelectComposeBtn.SetHasClass("selected",false);
    }
    m_CurSelectComposeBtn = panel;
    m_CurSelectComposeBtn.SetHasClass("selected",true);
}

function DisplayComposeItems(kind) {
	var list = m_ComposeItemTable[kind];
	if (!list) return;

	var btnIndex = 0;
	for (var i = m_Page; i < m_Page+6; i++) {
		var data = list[i];
		var btn = m_ComposeItemPanel[btnIndex++];
		if (!data) {
			btn.FindChildTraverse("item-img").itemname = "";
			btn.FindChildTraverse("item-name").text = "";
			btn.m_ItemName = null;
			continue;
		}
		
		btn.m_Data = data;
		btn.m_ItemName = data.composeItem;

		try {
			btn.SetHasClass("selected",false);
			btn.FindChildTraverse("item-img").itemname = data.composeItem;
			btn.FindChildTraverse("item-name").text = "#DOTA_Tooltip_ability_" + data.composeItem;	
		} catch(e)
		{

		}
	}
}

function ShowComposeItems(kind) {
	m_Page = 0;
	Clear();
	m_Kind = kind;
	DisplayComposeItems(kind);
}

function InitCompose() {
	if (m_HasInit) return;
	m_HasInit = true;

	var table = GameUI.GetComposeTable();

	for(var i in table)
	{
		var data = table[i];
		var composeItem = data["composeItem"];

		var conf = GameUI.GetItemConfig(composeItem);
		if (!conf) continue;

		var composeTable = m_ComposeItemTable[conf.kind];

		if (!composeTable) {
			composeTable = [];
			m_ComposeItemTable[conf.kind] = composeTable;
		}

		composeTable.push(data);
	}
}

function Clear() {
	m_ComposeItemPanel.forEach(function (btn) {
		try {
			delete btn.m_Data;
			btn.SetHasClass("selected",false);
			btn.FindChildTraverse("item-img").itemname = "";
			btn.FindChildTraverse("item-name").text = "";
			btn.m_ItemName = null;	
		} catch(e) {

		}

	})
}

function OnDragStart( slot, dragCallbacks ) {
	// var slot = $('#'+panelId);
	OnBtnMouseOut(slot);
	if (slot.m_ItemName) {

		slot.SetHasClass('drag_start',true);
		var hero = Players.GetLocalHero();
		var displayPanel = $.CreatePanel('DOTAItemImage',$.GetContextPanel(),'');
		displayPanel.m_Source = "compose";
		displayPanel.m_Data = slot.m_Data;
		// displayPanel.panelId = panelId;
		displayPanel.itemname = slot.m_ItemName;

		dragCallbacks.displayPanel = displayPanel;
		dragCallbacks.offsetX = 0;
		dragCallbacks.offsetY = 0;
	}
}
function OnDragEnter( panel, draggedPanel ) {
	// var panel = $('#'+panelId);
	panel.SetHasClass("drag_enter",true);
}
function OnDragLeave( panel, draggedPanel ) {
	// var panel = $('#'+panelId);
	panel.SetHasClass("drag_enter",false);
}
function OnDragEnd( slot, draggedPanel ) {
	draggedPanel.DeleteAsync(0);
	// var slot = $('#'+panelId);
	slot.SetHasClass('drag_start',false);
}

function CreateCompose(mainPanel, index) {
	var panel = $.CreatePanel("Button",mainPanel,"compose_item_"+index);
	panel.BLoadLayoutSnippet("compose-item");
	panel.SetDraggable(true);
	m_ComposeItemPanel.push(panel);

	var tooltip = panel.FindChild('tooltip');
	tooltip.BLoadLayout('file://{resources}/layout/custom_game/tooltips/tooltips_manager.xml',false,false);
	tooltip.Setup("item_for_kv");

	panel.SetPanelEvent("onactivate",function () {
		DisplayRequireItems(panel);
		// GameUI.AddMiniMapIcon(panel.m_ItemName);
	});

	$.RegisterEventHandler( 'DragEnter', panel, OnDragEnter );
	$.RegisterEventHandler( 'DragLeave', panel, OnDragLeave );
	$.RegisterEventHandler( 'DragStart', panel, OnDragStart );
	$.RegisterEventHandler( 'DragEnd', panel, OnDragEnd );

	RegisterItemEvents(panel)
}

GameUI.FrameEvent("compose_frame", function (frame_name,isOpen) {
	if (frame_name === 'compose_frame') {
		if (isOpen) {
			InitCompose();
		}
	}
});

function InitComposeData(){
    var table = GameUI.GetComposeTable();
    if(table.length > 0) {
        for(var i in table) {
            var data = table[i];
            var requestItem = data.requestItem;

            for(var j in requestItem) {
                var t = m_CanComposeToItems[requestItem[j].itemname];
                if (!t) {
                    t = {};
                    m_CanComposeToItems[requestItem[j].itemname] = t;
                }
                t[data.composeItem] = true;
            }
        }
        return
    }

    $.Schedule(1, InitComposeData);
}

;(function(){
	var KindList = $("#KindList");
	var KindListIndex = 1;
	m_ItemKindTexts.forEach(function (v, kind) {
		var btn = KindList.GetChild(KindListIndex++);

		if (!btn) {
			btn = $.CreatePanel("RadioButton",KindList,"");
			btn.BLoadLayoutSnippet("kind-btn");
			btn.FindChild("name").text = $.Localize(v);
		}

		btn.SetPanelEvent("onselect",function () {
			ShowComposeItems(kind);
		});
	});

    var ComposeItemList = $("#ComposeItemList");
    var line = $.CreatePanel("Panel", ComposeItemList, "");
    line.AddClass("line");
    for (var i = 1; i <= 6; i++) {
        CreateCompose(line, i)
        
        if(i % 2 === 0) {
            line = $.CreatePanel("Panel", ComposeItemList, "");
            line.AddClass("line");
        }
    }

    InitComposeData();

    if(Game.IsInToolsMode()) {
    	$("#PurchaseButton").visible = true;
    }
})()
