function AddEventButton(){
    // var hudElements = GameUI.GetHUDElements();
    // var buttonBar = hudElements.FindChildTraverse("ButtonBar")
    // var eventButton =  $.CreatePanel("Button", buttonBar, "EventButton");
    // eventButton.style.backgroundImage = "url(\"file://{images}/custom_game/event.png\")";
    // eventButton.style.backgroundSize = "30px";
    var eventButton = GameUI.AddLeftMenu("file://{images}/custom_game/event.png");
    RegisterEvents(eventButton);
}

function RegisterEvents(btn){
    btn.SetPanelEvent("onactivate",function() {
		OnBtnClick();
	});
	btn.SetPanelEvent("onmouseover",function() {
		$.DispatchEvent("DOTAShowTextTooltip", btn, "#xxwar_event");
	});
	btn.SetPanelEvent("onmouseout",function() {
		$.DispatchEvent("DOTAHideTextTooltip");
	});
}

function OnBtnClick(){
    $.GetContextPanel().ToggleClass("show");
}

function GetAward(){
	GameEvents.SendCustomGameEventToServer('xxwar_get_img_item_award',{});
}

function SetData(){
    if(!$.GetContextPanel().BHasClass("show")){ return $.Schedule(0.1, SetData); }
    var data = CustomNetTables.GetTableValue("PlayerImgItem", String(Players.GetLocalPlayer()));
    if(!data) { return $.Schedule(0.1, SetData); }
    for(let i = 1; i <= 9; i++){
        $("#imageItem_" + i).SetImage("");
        $("#imageItem_" + i).ClearPanelEvent("onactivate");
    }
    var buttonStatus = false;
    var count = 0;
    for(let key in data){
        let value = data[key];
        let imgPath = "file://{images}/custom_game/event/" + key + ".png";
        for(let i = 1; i <= value; i++){
            count++;
            $("#imageItem_" + count).SetImage(imgPath);
            if(key == "Changeable"){
                $("#imageItem_" + count).SetPanelEvent("onactivate",function() {
                    OpenSelectImgPanel();
                });
            }
        }
        if(value >= 3 && key != "Changeable"){
            buttonStatus = true;
        }
    }
    $("#button").enabled = buttonStatus;
    $("#button").SetHasClass("actived", buttonStatus);
    $.Schedule(0.1, SetData);
}

function OpenSelectImgPanel(){
    $("#selectImgPanel").ToggleClass("show");
}

function OpenTips(){
    $("#tipsRoot").ToggleClass("show");
}

function SelectImg(name){
    GameEvents.SendCustomGameEventToServer('xxwar_select_img_item',{name : name});
    OpenSelectImgPanel();
}

(function(){
    AddEventButton();
    SetData();
})()

