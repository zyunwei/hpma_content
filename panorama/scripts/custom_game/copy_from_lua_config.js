var ItemConfig = {};
var ComposeTable = [];
var ComposeClassifyTable = {};
var BossConfig = {};

GameUI.GetComposeTable = function () {
	return ComposeTable;
}

GameUI.GetItemConfig = function (name) {
	return ItemConfig[name];
}

GameUI.GetBossConfig = function (name) {
    return BossConfig[name];
}

function IsEmpty(data) {
    for (let k in data) {
        return false;
    }
    return true;
}

function LoadConfigs() {
    if (IsEmpty(ItemConfig)) {
        GameEvents.SendCustomGameEventToServer('event_get_item_config_table', {});
    }
    if (IsEmpty(ComposeTable)) {
        GameEvents.SendCustomGameEventToServer('event_get_compose_table', {});
    }
    if (IsEmpty(ComposeClassifyTable)) {
        GameEvents.SendCustomGameEventToServer('event_get_compose_classify_table', {});
    }
    if (IsEmpty(BossConfig)) {
        GameEvents.SendCustomGameEventToServer('event_get_boss_config_table', {});
    }
    $.Schedule(1, LoadConfigs);
}

function OnGetItemConfigTable(response) {
    let itemConfig = response.data;
    if (IsEmpty(itemConfig)) {
        return;
    }
    ItemConfig = itemConfig;
}

function OnGetComposeTable(response) {
    let composeTable = response.data;
    if (IsEmpty(composeTable)) {
        return;
    }
    ComposeTable = [];
    for (let key in composeTable) {
        let composeItem = composeTable[key];
        let requestItems = [];
        for (let index in composeItem["requestItem"]) {
            requestItems.push(composeItem["requestItem"][index])
        }
        composeItem["requestItem"] = requestItems;
        ComposeTable.push(composeItem);
    }
}

function OnGetComposeClassifyTable(response) {
    let composeClassifyTable = response.data;
    if (IsEmpty(composeClassifyTable)) {
        return;
    }
    ComposeClassifyTable = {};
    for (let quality in composeClassifyTable) {
        ComposeClassifyTable[quality] = {};
        for (let kind in composeClassifyTable[quality]) {
            let items = composeClassifyTable[quality][kind];
            ComposeClassifyTable[quality][kind] = [];
            for (let i in items) {
                ComposeClassifyTable[quality][kind].push(items[i]);
            }
        }
    }
}

function OnGetBossConfigTable(response) {
    let bossConfigTable = response.data;
    if (IsEmpty(bossConfigTable)) {
        return;
    }

    BossConfig = bossConfigTable;
}

GameEvents.Subscribe("event_get_item_config_table_response", OnGetItemConfigTable);
GameEvents.Subscribe("event_get_compose_table_response", OnGetComposeTable);
GameEvents.Subscribe("event_get_compose_classify_table_response", OnGetComposeClassifyTable);
GameEvents.Subscribe("event_get_boss_config_table_response", OnGetBossConfigTable);

LoadConfigs();
