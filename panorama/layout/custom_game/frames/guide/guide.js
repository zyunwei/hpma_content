function AddGuideButton(){
    // $.Msg("guide")
    var hudElements = GameUI.GetHUDElements();
    var buttonBar = hudElements.FindChildTraverse("ButtonBar")
    var guideButton =  $.CreatePanel("Button", buttonBar, "GuideButton");
    guideButton.style.backgroundImage = "url(\"file://{images}/custom_game/guide.png\")";
    guideButton.style.backgroundSize = "30px";
    RegisterEvents(guideButton);
}

function RegisterEvents(btn){
    btn.SetPanelEvent("onactivate",function() {
		OnBtnClick();
	});
	btn.SetPanelEvent("onmouseover",function() {
		$.DispatchEvent("DOTAShowTextTooltip", btn, "#xxwar_guide");
	});
	btn.SetPanelEvent("onmouseout",function() {
		$.DispatchEvent("DOTAHideTextTooltip");
	});
}

function OnBtnClick(){
    $.DispatchEvent("DOTAHideTextTooltip");
    Close();
}

function Close(){
    $("#Guide").Close()
}

(function(){
    $("#Guide").BLoadLayout("file://{resources}/layout/custom_game/templates/guide/guide.xml",false,false);
    AddGuideButton();
})()