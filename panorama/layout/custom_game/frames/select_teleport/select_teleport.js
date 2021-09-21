function Init(){
    var parent = $("#SelectRegionButtonList");
    for(var i = 0; i < parent.GetChildCount(); i++){
        var button = parent.GetChild(i);
        button.SetPanelEvent(
            "onmouseover", 
            (function(index){
                return function(){
                    $("#select_region_" + index).visible = true;
                };
            })(i+1)
        )
        
        button.SetPanelEvent(
            "onmouseout", 
            (function(index){
                return function(){
                    $("#select_region_" + index).visible = false;
                };
            })(i+1)
        )

        button.SetPanelEvent(
            "onactivate", 
            (function(index){
                return function(){
                    SelectRegion(index);
                    CloseTeleport();
                };
                
            })(i+1)
        )
    }
}

function SelectRegion(regionId){
    GameEvents.SendCustomGameEventToServer("select_region", {RegionId: regionId});
}

function TouchTeleport(){
    $("#btnClose").visible = true;
    $("#SelectRegionPanel").visible = true;
    UpdateMiniMapRegionState();
}

function CloseTeleport(){
    $("#btnClose").visible = false;
    $("#SelectRegionPanel").visible = false;
}

function UpdateMiniMapRegionState(){
	var regionInfo = CustomNetTables.GetTableValue("Common", "BlockadeInfoTable");
	
	for(var regionId in regionInfo){
		var imgpath = "file://{resources}/images/custom_game/";
		if(regionInfo[regionId].IsBlockade){
			imgpath += "minimap_region_state_red/" + regionId +".png";
		} else if(regionInfo[regionId].WillBeBlockade){
			imgpath += "minimap_region_state_yellow/" + regionId +".png";
		}

		var imgRegion = $("#region_" + regionId);
		if(imgRegion){
			if(imgpath == ""){
				imgRegion.style.visibility = "collapse";
			} else {
				imgRegion.style.visibility = "visible";
			}
			imgRegion.SetImage(imgpath);
		}
	}
}

function btnClose_Click(){
    $("#btnClose").visible = false;
    $("#SelectRegionPanel").visible = false;
}

;(function(){
    Init();
    GameEvents.Subscribe("xxwar_touch_teleport", TouchTeleport);
    GameEvents.Subscribe("xxwar_close_teleport", CloseTeleport);
    GameEvents.Subscribe("update_minimap_region_state", UpdateMiniMapRegionState);
})()
