"use strict";

GameUI.LoadFrame($("#XXWarStoreFrame"), 'xxwar_store', 'all');
var m_StoreItemList = [];
var m_InventoryList = [];
var isInventoryLoading = true;
var notifyInventoryLoading = false;
var isLoading = false;

function OpenSubWindow(name) {
	$("#ContentTier1").SetHasClass("BeCovered", true);
	$("#ContentTier2").SetHasClass("show", false);
	$("#ContentTier3").SetHasClass("show", false);
	$("#ContentTier4").SetHasClass("show", false);
	$("#ContentTier5").SetHasClass("show", false);
	$("#ContentTier6").SetHasClass("show", false);
	$("#ContentTier7").SetHasClass("show", false);

	$("#" + name).SetHasClass("show", true);

	if (name === "ContentTier5" && isLoading == false) {
		$("#TimeoutCloseAllButton").visible = false;
		isLoading = true;
		$.Schedule(5, function() {
			isLoading = false;
			$("#TimeoutCloseAllButton").visible = true;
		})
	}
}

function CloseAll() {
	$("#ContentTier1").SetHasClass("BeCovered", false);
	$("#ContentTier2").SetHasClass("show", false);
	$("#ContentTier3").SetHasClass("show", false);
	$("#ContentTier4").SetHasClass("show", false);
	$("#ContentTier5").SetHasClass("show", false);
	$("#ContentTier6").SetHasClass("show", false);
	$("#ContentTier7").SetHasClass("show", false);
	isLoading = false;

	$.Schedule(0.3, function(){
		if(openCardResult.length > 0){
			var cardName = openCardResult.pop();
			var imgPath = "file://{images}/custom_game/store_items/cards/" + cardName + ".png";
			ShowMessage($.Localize("OPEN_SUCCESS") + $.Localize("DOTA_Tooltip_Ability_" + cardName), imgPath);
		}
	})
}

function ShowMessage(msg, imgPath) {
	$("#Message").text = "<font color='#1CFF83'>" + $.Localize(msg) + "</font>";
	$("#ContentTier6").SetHasClass("show", true);
	if(imgPath) {
		$("#MessageImage").SetImage(imgPath);
		$("#MessageImage").visible = true;
	} else {
		$("#MessageImage").visible = false;
	}
}

function ShowErrorMessage(msg) {
	$("#Message").text = "<font color='#C72600'>" + $.Localize(msg) + "</font>";
	$("#ContentTier6").SetHasClass("show", true);
	$("#MessageImage").visible = false;
}

function RefreshInfo() {
	isInventoryLoading = true;
	GameEvents.SendCustomGameEventToServer("store_update_coin_info",{});
	GameEvents.SendCustomGameEventToServer("store_get_inventory",{});
}

GameUI.FrameEvent("xxwar_store", function (frame_name, isOpen) {
	if (frame_name === 'xxwar_store' && isOpen) {
		RefreshInfo();
	}
});

function AutoUpdateStoreInfo(){
    var playerInfo = CustomNetTables.GetTableValue("PlayerInfo", String(Players.GetLocalPlayer()));
    var storeItems = CustomNetTables.GetTableValue("PlayerStoreItems", String(Players.GetLocalPlayer()));
    if(playerInfo != null && storeItems != null) {
        $("#txtDiamond").text = playerInfo.XXCoin == undefined ? '..' : playerInfo.XXCoin;
        $("#txtBullion").text = playerInfo.Bullion == undefined ? '..' : playerInfo.Bullion;
        $("#txtRespawnCoin").text = playerInfo.RespawnCoin == undefined ? '..' : playerInfo.RespawnCoin;

        if(isInventoryLoading || notifyInventoryLoading) {
        	m_InventoryList = storeItems;
        	isInventoryLoading = false;

        	if(notifyInventoryLoading) {
        		notifyInventoryLoading = false;
        	}

        	CreateInventoryItems();
    	}
    }

    if(m_StoreItemList.length == 0){
    	var storeTable = CustomNetTables.GetTableValue("store_table", "store_table");
	    if(storeTable) {
	    	m_StoreItemList = storeTable;
    		CreateStoreList();
	    }
    }

    $.Schedule(0.5, AutoUpdateStoreInfo);
}

var LastSubFrameButton = null;
function SwitchSubFrame(id) {
	if (LastSubFrameButton) LastSubFrameButton.SetHasClass("checked", false);

	LastSubFrameButton = $("#" + id);
	LastSubFrameButton.SetHasClass("checked", true);

	if (id === "StoreHome") {
		$("#StoreItemContent").visible = true;
		$("#PlayerInventroy").visible = false;
	} else if (id === "MyInventroy") {
		$("#StoreItemContent").visible = false;
		$("#PlayerInventroy").visible = true;
		isInventoryLoading = true;
	}
}

var clickedGiftName = '';
function RedeemGift(){
	var text = $("#txtWechatNo").text;
	if (text.length > 0) {
		OpenSubWindow("ContentTier5");
		GameEvents.SendCustomGameEventToServer("store_redeem_gift", {'wechat': text, 'itemName': clickedGiftName});
	}
}

function PresentGift(){
	var text = $("#txtSteamAccount").text;
	if (text.length > 0) {
		OpenSubWindow("ContentTier5");
		GameEvents.SendCustomGameEventToServer("store_present_card", {'targetAccount': text, 'itemName': clickedGiftName});
	}
}

function RefreshInventoryNotify() {
	notifyInventoryLoading = true;
}

function StoreMessageResponse(data) {
	if(data) {
		if(data.isSuccess) {
			ShowMessage(data.message, null);
		} else {
			ShowErrorMessage(data.message);
		}

		CloseAll();
		OpenSubWindow("ContentTier6");
		RefreshInfo();
	}
}

function StoreMessageResponseOpenCard(data) {
	if(data) {
		if(data.isSuccess) {
			var imgPath = "file://{images}/custom_game/store_items/cards/" + data.tag + ".png";
			ShowMessage($.Localize(data.message) + $.Localize("DOTA_Tooltip_Ability_" + data.tag), imgPath);
		} else {
			ShowErrorMessage(data.message);
		}

		CloseAll();
		OpenSubWindow("ContentTier6");
		RefreshInfo();
	}
}

var openCardResult = [];
function StoreMessageResponseOpenCardTenTimes(data){
	if(data) {
		if(data.isSuccess) {
			for(var i in data.tag){
				openCardResult.push(data.tag[i]);
			}
		} else {
			ShowErrorMessage(data.message);
		}

		CloseAll();
		OpenSubWindow("ContentTier6");
		RefreshInfo();
	}
}

var SortLabelList = [];
var LastCheckedSortLabel = null;
function CreateStoreList() {
	var StoreSortList = $("#StoreSortList");
	StoreSortList.RemoveAndDeleteChildren();

	SortLabelList = [];

	var label = $.CreatePanel("Label", StoreSortList, "");
	label.text = $.Localize("xxwar_store_type");
	label.AddClass("title");

	var panel = $.CreatePanel("Panel", StoreSortList, "panel_sort_list");
	panel.AddClass("down");
	panel.AddClass("list");

	var labelFunc = function (panel) {
		panel.SetPanelEvent("onactivate", function(){
			ClickSortLabel(panel);
		})
	}

	var list = ["props", "vip"];
	for (var i = 0; i < list.length; i++) {
		label = $.CreatePanel("Label", panel, "");
		label.text = $.Localize("xxwar_store_type_" + list[i]);
		label.SetAttributeString("item-type", list[i]);
		labelFunc(label);

		SortLabelList.push(label);
	}

	LastCheckedSortLabel = SortLabelList[0];
	LastCheckedSortLabel.SetHasClass("checked", true);
	CreateStoreItems(LastCheckedSortLabel.GetAttributeString("item-type", ""));
}

function ClickSortLabel(label) {
	if(label) {
		if (LastCheckedSortLabel) {
			LastCheckedSortLabel.SetHasClass("checked", false);
		}

		LastCheckedSortLabel = label;
		LastCheckedSortLabel.SetHasClass("checked", true);
		CreateStoreItems(LastCheckedSortLabel.GetAttributeString("item-type",""));
	}	
}

function CreateStoreItems(typeName) {
	var StoreItemList = $("#StoreItemList");
	var StoreItemListIndex = 0;

	for (var i in m_StoreItemList){
		var itemData = m_StoreItemList[i];
		if (itemData.type == typeName){
			var item = StoreItemList.GetChild(StoreItemListIndex++);

			if (!item) {
				item = $.CreatePanel("Panel", StoreItemList, "");
				item.BLoadLayoutSnippet('store-item');
				StoreItemEvent(item);
			}	

			item.FindChild("StoreItemLogo").SetImage("file://{images}/custom_game/store_items/" + itemData.type + "/" + itemData.name + ".png");
			item.FindChild("StoreItemName").text = GetLocalizeName(itemData);
			item.FindChild("StoreItemPrice").text = itemData.price + $.Localize("xxwar_store_" + itemData.price_type);

			item.m_ItemData = itemData;
			item.visible = true;
		}
	}

	var max = StoreItemList.GetChildCount();
	for (var i = StoreItemListIndex; i < max; i++) {
		StoreItemList.GetChild(i).visible = false;
	}
}

function GetLocalizeName(data) {
	if(data.type == "cards" && data.name.indexOf("ability_custom_") === 0) {
		return $.Localize("DOTA_Tooltip_Ability_" + data.name);
	} else {
		return $.Localize(data.name);
	}
}

function StoreItemEvent(item) {
	var btn = item.FindChild("StoreItemButtons").GetChild(0);

	item.SetPanelEvent("onmouseover", function() {
		if(item.m_ItemData.type == "vip" && item.m_ItemData.name.indexOf("xxwar_vip_") === 0) {
			$.DispatchEvent("DOTAShowTitleTextTooltip", item, "#xxwar_vip_desc_title", "#xxwar_vip_desc_content");
		}
		if(item.m_ItemData.type == "props" && item.m_ItemData.name.indexOf("xxwar_store_exchange_accessories_") === 0) {
			$.DispatchEvent("DOTAShowTitleTextTooltip", item, "#" + item.m_ItemData.name, "#xxwar_store_exchange_accessories_content");
		}
	})

	item.SetPanelEvent("onmouseout", function() {
		$.DispatchEvent("DOTAHideTitleTextTooltip");
	})

	btn.SetPanelEvent("onactivate", function() {
		var data = item.m_ItemData;

		var dialog = $("#BuyItemDialog");
		dialog.SetDialogVariable("StoreItemName", GetLocalizeName(data));
		dialog.SetDialogVariable("StoreItemAmount", data.price);
		dialog.SetDialogVariable("StoreItemPriceType", $.Localize("xxwar_store_" + data.price_type));
		dialog.item_price = data.price;

		$("#txtStoreItemCount").text = "1";
		$("#BuyStoreItemButton").m_ItemData = item.m_ItemData;

		OpenSubWindow("ContentTier2");
	})
}

function BuyItemConfirm() {
	var data = $("#BuyStoreItemButton").m_ItemData;
	var amount = parseInt($("#txtStoreItemCount").text);
	if (!amount || amount < 0) amount = 0;

	if(amount > 0) {
		data.amount = amount;
		OpenSubWindow("ContentTier5");
		GameEvents.SendCustomGameEventToServer("store_buy_item", data);	
	}
}

function CreateInventoryItems() {
	var PlayerInventroy = $("#PlayerInventroy");
	PlayerInventroy.RemoveAndDeleteChildren();

	var PlayerInventroyIndex = 0;
	for(var i in m_InventoryList) {
		var item = PlayerInventroy.GetChild(PlayerInventroyIndex++);
		if (!item) {
			item = $.CreatePanel("Panel", PlayerInventroy, "");
			item.BLoadLayoutSnippet('inventroy-item');

			item.FindChildTraverse("UseItemButton").SetPanelEvent("onactivate", function(_btn){
		        return function(){
		        	if(_btn.itemData) {
						switch(_btn.itemData.type){
							case "vip":
								// 续费VIP
								SwitchSubFrame('StoreHome');
								var sortList = $("#panel_sort_list");
								for (var i = 0; i < sortList.GetChildCount(); i++) {
									var label = sortList.GetChild(i);
									if(label && label.GetAttributeString("item-type", "") == "vip") {
										ClickSortLabel(label);
										break;
									}
								}
								break;
							case "cards":
								if(_btn.itemData.name == "xxwar_random_card") {
									// 开卡牌
									OpenSubWindow("ContentTier5");
									GameEvents.SendCustomGameEventToServer("store_open_card", {'itemName': _btn.itemData.name});
								} else {
									// 回收卡牌
									if(_btn.itemData.count > 1 && _btn.itemData.accountBound != 1) {
										GameEvents.SendCustomGameEventToServer("store_recycle_card", {'itemName': _btn.itemData.name});
									}
								}
								break;
							case "props":
								if(_btn.itemData.name == "xxwar_lottery_point") {
									// 抽奖
									GameUI.SwapFrame('xxwar_lottery')
								} else {
									// 兑换
									clickedGiftName = _btn.itemData.name;
									OpenSubWindow("ContentTier4");
								}
								break;
						}
					}
		        }
		    }(item));

		    item.FindChildTraverse("UseItemButton2").SetPanelEvent("onactivate", function(_btn){
		        return function(){
		        	if(_btn.itemData) {
						switch(_btn.itemData.type){
							case "cards":
								if(_btn.itemData.name != "xxwar_random_card") {
									// 赠送卡牌
									if(_btn.itemData.count > 1 && _btn.itemData.accountBound != 1) {
										clickedGiftName = _btn.itemData.name;
										OpenSubWindow("ContentTier7");
									}
								}
								break;
						}
					}
		        }
		    }(item));
		}

		var itemData = {
			type: m_InventoryList[i].ItemType,
			name: m_InventoryList[i].ItemName,
			validTime: m_InventoryList[i].ValidTime.substring(0, 10),
			count: m_InventoryList[i].Count || 1,
			accountBound: m_InventoryList[i].AccountBound
		}

		item.itemData = itemData;
		item.FindChild("StoreItemLogo").SetImage("file://{images}/custom_game/store_items/" + itemData.type + "/" + itemData.name + ".png");
		var itemName = GetLocalizeName(itemData);
		var itemButton = item.FindChildTraverse("lblItemButton");
		var useButton = item.FindChildTraverse("UseItemButton");
		var presentButton = item.FindChildTraverse("UseItemButton2");
		presentButton.visible = false;
		useButton.SetHasClass("BigButton", true);
		if(useButton && itemButton && presentButton) {
			if(itemData.type == "vip") {
				itemName = $.Localize("#xxwar_store_type_vip") + " (" + itemData.validTime + ")";
				itemButton.text = $.Localize("xxwar_store_topup_vip");
				itemButton.visible = true;
			} else if(itemData.type == "cards") {
				if(itemData.name == "xxwar_random_card") {
					itemName = $.Localize("#xxwar_random_card") + " ×" + itemData.count;
					itemButton.text = $.Localize("xxwar_store_open_card");	
				} else {
					itemName = itemName + " ×" + itemData.count;
					itemButton.text = itemData.count == 1 ? $.Localize("#xxwar_store_owning_card") : $.Localize("#xxwar_store_recycle_card");
					if(itemData.accountBound == 1) {
						itemButton.text = $.Localize("#xxwar_store_account_bound");
					}
					if(itemData.count > 1 && itemData.accountBound != 1){
						presentButton.visible = true;
						useButton.style.marginLeft = "0px";
						useButton.SetHasClass("BigButton", false);
					}
				}
				itemButton.visible = true;
			} else if(itemData.type == "props") {
				itemName = itemName + " ×" + itemData.count;

				if(itemData.name == "xxwar_lottery_point") {
					itemButton.text = $.Localize("xxwar_lottery_point_use");
				} else {
					itemButton.text = $.Localize("xxwar_store_lottery_gift_redeem");
				}

				itemButton.visible = true;
			} else {
				itemButton.visible = false;
			}
		}

		item.FindChild("StoreItemName").text = itemName;
		item.m_ItemData = itemData;
	}
}

function AddAmount(num) {
	var txtAmount = $("#txtTopupAmount");
	var text = txtAmount.text;
	var amount = parseInt(text);
	if (!amount || amount < 0) amount = 0;
	txtAmount.text = (amount + num);
}

function OnTopupAmountChanged() {
	var txtAmount = $("#txtTopupAmount");
	var text = txtAmount.text;
	var m = text.replace(/\D+/g,"");
	var amount = parseInt(m);
	if (amount > 0) {
		txtAmount.text = parseInt(m);
	} else {
		amount = 0;
		txtAmount.text = "0";
	}

	$("#PrePayButton").SetDialogVariable("Amount", Math.floor(amount).toString());
}

function OnBuyAmountChanged() {
	var txtAmount = $("#txtStoreItemCount");
	var text = txtAmount.text;
	var m = text.replace(/\D+/g,"");
	var amount = parseInt(m);
	if (amount > 0) {
		txtAmount.text = parseInt(m);
	} else {
		amount = 0;
		txtAmount.text = "0";
	}

	var buyItemDialog = $("#BuyItemDialog");
	var itemPrice = $("#BuyItemDialog").item_price;
	if(itemPrice != null) {
		$("#BuyItemDialog").SetDialogVariable("StoreItemAmount", Math.floor(amount).toString() * itemPrice);	
	}
}

var lastTopupAmount = "";
var lastBuyAmount = "";
function UpdateTopupAmount(){
	var topupAmount = $("#txtTopupAmount").text;
	if(topupAmount != lastTopupAmount) {
		OnTopupAmountChanged();
		lastTopupAmount = topupAmount;
	}

	var buyAmount = $("#txtStoreItemCount").text;
	if(lastBuyAmount != buyAmount) {
		OnBuyAmountChanged();
		lastBuyAmount = buyAmount;
	}

    $.Schedule(Game.GetGameFrameTime(), UpdateTopupAmount);
}

function OnClickPay(topupPayType){
	OpenSubWindow("ContentTier5");
	GameEvents.SendCustomGameEventToServer("store_pay_request", { paytype: topupPayType, amount: Math.floor($("#txtTopupAmount").text) });	
}

function OnPayResponse(data){
	CloseAll();
    if(data && data.url){
    	var payFrame = GameUI.GetFrame("xxwar_pay_html");
    	if(payFrame) {
    		payFrame.GetParent().OpenLink(data.url);
    		GameUI.SwapFrame("xxwar_pay_html", true);
    	}
    }
}

;(function(){
	CloseAll();
	AutoUpdateStoreInfo();
	UpdateTopupAmount();
	$("#PlayerInventroy").visible = false;
	$("#StoreHome").SetHasClass("checked", true);
	$("#PrePayButton").SetDialogVariable("Amount", Math.floor($("#txtTopupAmount").text).toString());

	GameEvents.Subscribe("store_msg_response", StoreMessageResponse);
	GameEvents.Subscribe("store_msg_response_cancel", CloseAll);
	GameEvents.Subscribe("store_msg_response_opencard", StoreMessageResponseOpenCard);
	GameEvents.Subscribe("store_msg_response_opencard_ten_times", StoreMessageResponseOpenCardTenTimes);
	GameEvents.Subscribe("store_refresh_inventory_notify", RefreshInventoryNotify);
	GameEvents.Subscribe("store_msg_response_pay", OnPayResponse);
})()
