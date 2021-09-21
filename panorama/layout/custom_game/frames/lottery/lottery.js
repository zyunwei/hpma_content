"use strict";

GameUI.LoadFrame($("#XXWarLotteryFrame"), 'xxwar_lottery', 'all');

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

function CloseAll() {
	$("#ContentTier1").SetHasClass("BeCovered", false);
	$("#ContentTier6").SetHasClass("show", false);

	$.Schedule(0.3, function(){
		if(tenDrawResult.length > 0){
			var giftIndex = tenDrawResult.pop();
			var res = LotteryTable.rateTable.filter(item => item.location == giftIndex);
			if(res.length > 0) {
				ShowMessage($.Localize("#xxwar_lottery_win") + " " + $.Localize(res[0].name));	
			}
		}
	})
}

GameUI.FrameEvent("xxwar_lottery", function (frame_name, isOpen) {
	if (frame_name === 'xxwar_lottery' && isOpen) {
		RefreshInfo();
	}
});

function RefreshInfo() {
	$("#lblRemaingCount").text = "..";
	LotteryPoint = 0;
	$("#btnTenDraw").SetSelected(false);
	$("#pnlTenDraw").visible = false;
	GameEvents.SendCustomGameEventToServer("store_get_lottery_point",{});
}

function StartRotate() {
	if(LotteryPoint < 1) {
		ShowErrorMessage("xxwar_lottery_not_enough_point");
		return;
	}

	if (LotteryTable.isGoing || IsRequesting) {
		ShowErrorMessage($.Localize("#xxwar_lottery_going"));
		return;
	}

	IsRequesting = true;

	var data = {tenDraw: isTenDraw};	
	GameEvents.SendCustomGameEventToServer("store_use_lottery_point", data);
}

var LotteryPoint = 0;
var LotteryGiftIndex = -1;
var IsRequesting = false;
var LotteryTable = {
    itemNum: 6,
    lightNum: 18,
    lightsContainner: null,
    turntable: null,
    bgContainner: null,
    giftContainner: null,
    rateTable: [],
    isGoing: false,
    makeupDeg: 0,
    Init() {
		this.lightsContainner.RemoveAndDeleteChildren();
		for (let i = 0; i < this.lightNum; i++) {
			let lightItem = $.CreatePanel("Panel", this.lightsContainner, "");
			lightItem.BLoadLayoutSnippet('lottery_light');
			if(i % 2 != 0){
				lightItem.SetHasClass("odd", true);	
			}
			let deg = (360 / this.lightNum) * i;
			lightItem.style.transform = 'rotateZ(' + deg + 'deg)';
		}

		this.bgContainner.RemoveAndDeleteChildren();
		this.giftContainner.RemoveAndDeleteChildren();
		for (let i = 0; i < this.itemNum; i++) {
			let fragmentItem = $.CreatePanel("Panel", this.bgContainner, "");
			fragmentItem.BLoadLayoutSnippet('lottery_fragment');
			let deg = (360 / this.itemNum) * i
			fragmentItem.style.transform = 'rotateZ(' + deg + 'deg)';

			let giftItem = $.CreatePanel("Panel", this.giftContainner, "");
			giftItem.BLoadLayoutSnippet('lottery_gift');
			if(this.rateTable[i].class != '') {
				giftItem.SetHasClass(this.rateTable[i].class, true);	
			}
			giftItem.FindChildTraverse("gift_name").text = $.Localize(this.rateTable[i].name);
			giftItem.style.transform = 'rotateZ(' + (deg - 120) + 'deg)';
		}
    },
	Rotate() {
		this.isGoing = true;

		let res = 0;
		if(LotteryGiftIndex >= 0) {
			res = this.rateTable[LotteryGiftIndex];
		} else {
			let randomRate = ~~(Math.random() * 100)
			let num = 0
			this.rateTable.forEach(item => {
				item.min = num;
				num += item.rate;
				item.max = num;
			})

			res = this.rateTable.filter(item => {
				return randomRate >= item.min && randomRate < item.max;
			})[0];
		}

		let rotateItemDeg = (res.location - 1) * (360 / this.rateTable.length);
		let rotate = this.makeupDeg + 5 * 360 - rotateItemDeg;
		let rotateDuration = (rotateItemDeg / 360 * 1 + 5).toFixed(2);

		this.makeupDeg = rotate + (360 - rotate % 360);
		this.turntable.style.transitionDuration = rotateDuration + "s";
		this.turntable.style.preTransformRotate2d = rotate + 'deg';

		$.Schedule(rotateDuration, function(){
			// $.Msg(res);
			LotteryTable.isGoing = false;
			IsRequesting = false;
			ShowMessage($.Localize("#xxwar_lottery_win") + " " + $.Localize(res.name));
		});
	}
}

function InitLottery() {
	var storeTable = CustomNetTables.GetTableValue("store_table", "lottery_table");
	if(storeTable == null) {
		$.Schedule(1.0, InitLottery);
		return;
	}

	var lotteryConfig = storeTable.LotteryGift;

	let rateTable = [];
	for(var i in storeTable) {
		var lotteryItem = storeTable[i];
		rateTable.push(
			{ location: i, type: lotteryItem.type, rate: lotteryItem.rate, name:lotteryItem.name, class:lotteryItem.class },
		);
	}

	LotteryTable.turntable = $("#turntable");
	LotteryTable.lightsContainner = $("#turntable_light");
	LotteryTable.bgContainner = $("#turntable_bg");
	LotteryTable.giftContainner = $("#turntable_gift");
	LotteryTable.rateTable = rateTable;
	LotteryTable.Init();
}

var isTenDraw = false;
var tenDrawResult = [];
function SwitchTenDraw(tenDraw) {
	isTenDraw = tenDraw;
}

;(function(){
	InitLottery();

	GameEvents.Subscribe("store_refresh_lottery_notify", function(data){
		if(data.isSuccess) {
			LotteryPoint = parseInt(data.tag);
			$("#pnlTenDraw").visible = LotteryPoint >= 10;
			$("#lblRemaingCount").text = data.tag;
		} else {
			LotteryPoint = 0;
			isTenDraw = false;
			$("#btnTenDraw").SetSelected(false);
			ShowErrorMessage(data.message);
		}
	});

	GameEvents.Subscribe("store_lottery_start_notify", function(data){
		if(data.isSuccess) {
			LotteryPoint = parseInt(data.tag);
			if(LotteryPoint < 10){
				isTenDraw = false;
				$("#btnTenDraw").SetSelected(false);
				$("#pnlTenDraw").visible = false;
			}
			$("#pnlTenDraw").visible = LotteryPoint >= 10;
			LotteryGiftIndex = parseInt(data.giftIndex);
			$("#lblRemaingCount").text = data.tag;

			if(LotteryTable) {
				LotteryTable.Rotate();
			}
		} else {
			LotteryPoint = 0;
			isTenDraw = false;
			$("#pnlTenDraw").visible = false;
			$("#btnTenDraw").SetSelected(false);
			ShowErrorMessage(data.message);
		}
	});

	GameEvents.Subscribe("store_lottery_ten_draw_notify", function(data){
		if(data.isSuccess) {
			LotteryPoint = parseInt(data.tag);
			if(LotteryPoint < 10){
				isTenDraw = false;
				$("#btnTenDraw").SetSelected(false);
				$("#pnlTenDraw").visible = false;
			}
			$("#pnlTenDraw").visible = LotteryPoint >= 10;
			$("#lblRemaingCount").text = data.tag;

			for(var i in data.giftIndexTable){
				tenDrawResult.push(data.giftIndexTable[i]);
			}

			LotteryTable.isGoing = false;
			IsRequesting = false;
			CloseAll();
		} else {
			LotteryPoint = 0;
			isTenDraw = false;
			$("#pnlTenDraw").visible = false;
			$("#btnTenDraw").SetSelected(false);
			ShowErrorMessage(data.message);
		}
	});
})()
