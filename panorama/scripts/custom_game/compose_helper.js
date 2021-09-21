var ITEM_KIND_MATERIAL = 0;
var ITEM_KIND_WEAPON = 1;
var ITEM_KIND_SHOES = 2;
var ITEM_KIND_CLOTHES = 3;
var ITEM_KIND_HAT = 4;
var ITEM_KIND_TRINKET = 5;
var ITEM_KIND_GLOVES = 6;
var ITEM_KIND_CONSUMABLE = 7;

GameUI.GetHeroAllItems = function() {
    var itemList = [];
    GameUI.Bag_EachItems(function (_itemname, charges, index, itemIndex) {
        itemList.push({ItemName: _itemname, Count: charges, IsEquipment: false, Index: itemIndex});
    });

    for(var i = 0; i <= 5; i++) {
        var item = Entities.GetItemInSlot(Players.GetLocalHero(), i);
        if(item > 0) {
            var itemName = Abilities.GetAbilityName(item)
            if(itemName && itemName != ""){
                itemList.push({ItemName: itemName, Count: 1, IsEquipment: true, Index: item});
            }
        }
    }

    return itemList;
}

// 装备合成
GameUI.GetCanComposeRandomlyItems = function(useEquipment) {
    let composeDisplayList = [];
    let composeNeedCount = 3; // 合成所需数量
    let maxComposeLevel = 5; // 最高装备等级
    let targetKinds = [ITEM_KIND_WEAPON, ITEM_KIND_SHOES, ITEM_KIND_CLOTHES, ITEM_KIND_HAT, ITEM_KIND_TRINKET, ITEM_KIND_GLOVES];
    let ownItems = GameUI.GetHeroAllItems();
    let candidateItems = [];

    for(let item of ownItems) {
        if(useEquipment == false && item.IsEquipment) {
            continue;
        }
        
        let itemName = item.ItemName;
        let itemConfig = GameUI.GetItemConfig(itemName);
        if(itemConfig) {
            let itemKind = itemConfig["kind"];
            let itemQuality = itemConfig["quality"];
            if(itemKind && targetKinds.indexOf(itemKind) > -1) {
                for (let i = 0; i < item.Count; i++) {
                    candidateItems.push({item_name:itemName, kind:itemKind, quality:itemQuality});
                }
            }
        }
    }

    // 相同类型装备合成
    for(let targetKind of targetKinds) {
        let levelLowerItems = {};
        for(let quality = 1; quality < maxComposeLevel; quality++) {
            levelLowerItems[quality] = [];
        }
        for(let item of candidateItems) {
            let quality = item.quality;
            if(quality < maxComposeLevel) {
                if(item.kind == targetKind) {
                    levelLowerItems[quality].push(item.item_name);
                }
                if(levelLowerItems[quality].length >= composeNeedCount) {
                    composeDisplayList.push({
                        TargetKind: targetKind,
                        TargetQuality: quality + 1,
                        ItemList: levelLowerItems[quality],
                    });
                    break;
                }
            }
        }
    }

    // 不同类型装备合成
    let composeLevelInfo = [];
    for(let targetLevel = 2; targetLevel <= maxComposeLevel; targetLevel++) {
        let lowerItemLevel = targetLevel - 1;
        let lowerItems = [];
        for(let item of candidateItems) {
            let quality = item.quality;
            if(quality == lowerItemLevel) {
                lowerItems.push(item.item_name);
            }
            if(lowerItems.length >= composeNeedCount) {
                composeDisplayList.push({
                    TargetKind: -1,
                    TargetQuality: quality + 1,
                    ItemList: lowerItems,
                });
                break;
            }
        }
    }

    return composeDisplayList;
}

// 消耗品合成
GameUI.GetCanComposeConsumableItems = function() {
    let composeNeedCount = 3; // 合成所需数量
    let maxComposeLevel = 4; // 最高合成等级
    let ownItems = GameUI.GetHeroAllItems();
    let candidateItems = [];
    let levelLowerItems = {};

    for(let quality = 1; quality <= maxComposeLevel; quality++) {
        levelLowerItems[quality] = [];
    }

    for(let item of ownItems) {
        if(item.IsEquipment) {
            continue;
        }

        let itemName = item.ItemName;
        let itemConfig = GameUI.GetItemConfig(itemName);
        if(itemConfig) {
            let itemKind = itemConfig["kind"];
            let itemQuality = itemConfig["quality"];
            if(itemKind == ITEM_KIND_CONSUMABLE && itemQuality < maxComposeLevel) {
                for (let i = 0; i < item.Count; i++) {
                    candidateItems.push({item_name:itemName, kind:itemKind, quality:itemQuality});
                    levelLowerItems[itemQuality].push(itemName);
                }
            }
        }
    }

    let composeDisplayList = [];
    for(let quality = 1; quality < maxComposeLevel; quality++) {
        if (levelLowerItems[quality].length >= composeNeedCount) {
            let itemList = [];
            for(let itemName of levelLowerItems[quality]) {
                itemList.push(itemName);
                if(itemList.length >= composeNeedCount) {
                    composeDisplayList.push({
                        TargetKind:ITEM_KIND_CONSUMABLE,
                        TargetQuality: quality + 1,
                        ItemList: itemList
                    });
                    break;
                }
            }
        }
    }
    
    return composeDisplayList;
}
