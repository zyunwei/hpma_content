GameUI.LoadFrame($("#main_panel"), 'xxwar_pay_html', 'all');

function btnClose_Click(){
	GameUI.CloseFrame("xxwar_pay_html");
	depositSuccess = true;
}

var checkDepositSchedule = null;
var depositSuccess = false;
function AutoCheckDeposit(){
	GameEvents.SendCustomGameEventToServer("check_last_deposit", {});
	if(depositSuccess == false){
		checkDepositSchedule = $.Schedule(5, AutoCheckDeposit);
	}	
}

function OnDepositSuccess(){
	GameUI.CloseFrame("xxwar_pay_html");
	depositSuccess = true;
}

function OpenLink(url){
	depositSuccess = false;
	$("#qrcode_iframe").SetURL(url);
	$.Schedule(3, AutoCheckDeposit);

	try{
	    if(checkDepositSchedule != null){
	        $.CancelScheduled(checkDepositSchedule);
	        checkDepositSchedule = null;
	    }
	} catch(e){
	}
}

(function () {
	GameEvents.Subscribe("last_deposit_success", OnDepositSuccess);
	$.GetContextPanel().OpenLink = OpenLink;
})();