function OnBtnClick(){
    $.DispatchEvent("DOTAHideTextTooltip");
    Close();
}

function Close(){
    var guideRootPanel = $("#GuideRootPanel");
    guideRootPanel.ToggleClass("show");
}

function Init(){
    var count = 0;
    var guideNavigation = $("#GuideNavigation");
    for(let index in GuideStep){
        let info = GuideStep[index];
        let step = guideNavigation.GetChild(count++);
		if (!step) {
			step = $.CreatePanel("Button", guideNavigation, "");
			step.BLoadLayoutSnippet("GuideStep");
			step.FindChild("GuideStepImg").SetImage(info.ImagePath); 
            step.FindChild("GuideStepText").text = $.Localize(info.Title);
            step.index = index;
            RegisterGuideEvents(step);
		}
    }

    var info = GuideStep["1"];
    $("#GuideTitle").text = info.Title;
    $("#GuideDes").text = info.Des;
    $("#GuideMovie").SetMovie(info.MoviePath);
    guideNavigation.GetChild(1).SetHasClass("selected", true);
}

function SelectGuide(guide){
    var guideNavigation = $("#GuideNavigation");
    for(let i = 0; i < guideNavigation.GetChildCount(); i++){
        guideNavigation.GetChild(i).SetHasClass("selected", false);
    }
    guide.SetHasClass("selected", true)
    var index = guide.index;
    var info = GuideStep[index];
    $("#GuideTitle").text = info.Title;
    $("#GuideDes").text = info.Des;
    $("#GuideMovie").SetMovie(info.MoviePath);
    $("#GuideMovie").FindChild("MoviePanel").repeat = "true";
}

function RegisterGuideEvents(panel){
    if(!panel) return;
    panel.SetPanelEvent("onactivate", function(){
        SelectGuide(panel);
    });
}


;(function(){
    $.GetContextPanel().Close = Close;
    Init();
})()