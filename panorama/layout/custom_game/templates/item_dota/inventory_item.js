"use strict";

var m_Item = -1;
var m_ItemSlot = -1;
var m_QueryUnit = -1;

function UpdateItem() {
    var itemName = Abilities.GetAbilityName(m_Item);
    var isPassive = Abilities.IsPassive(m_Item);
    var chargeCount = 0;
    var hasCharges = false;
    var altChargeCount = 0;
    var hasAltCharges = false;

    if (Items.ShowSecondaryCharges(m_Item)) {
        hasCharges = true;
        hasAltCharges = true;
        if (Abilities.GetToggleState(m_Item)) {
            chargeCount = Items.GetCurrentCharges(m_Item);
            altChargeCount = Items.GetSecondaryCharges(m_Item);
        }
        else {
            altChargeCount = Items.GetCurrentCharges(m_Item);
            chargeCount = Items.GetSecondaryCharges(m_Item);
        }
    }
    else if (Items.ShouldDisplayCharges(m_Item)) {
        hasCharges = true;
        chargeCount = Items.GetCurrentCharges(m_Item);
    }

    $.GetContextPanel().SetHasClass("no_item", (m_Item == -1));
    $.GetContextPanel().SetHasClass("show_charges", hasCharges);
    $.GetContextPanel().SetHasClass("show_alt_charges", hasAltCharges);
    $.GetContextPanel().SetHasClass("is_passive", isPassive);

    $("#ItemImage").itemname = itemName;
    $("#ItemImage").contextEntityIndex = m_Item;
    $("#ChargeCount").text = chargeCount;
    $("#AltChargeCount").text = altChargeCount;

    if (m_Item == -1 || Abilities.IsCooldownReady(m_Item)) {
        $.GetContextPanel().SetHasClass("cooldown_ready", true);
        $.GetContextPanel().SetHasClass("in_cooldown", false);
    }
    else {
        $.GetContextPanel().SetHasClass("cooldown_ready", false);
        $.GetContextPanel().SetHasClass("in_cooldown", true);

        var cooldownLength = Abilities.GetCooldownLength(m_Item);
        var cooldownRemaining = Abilities.GetCooldownTimeRemaining(m_Item);
        $("#CooldownTimer").text = Math.ceil(cooldownRemaining);

        var deg = -360 * (cooldownRemaining / cooldownLength);
        deg = (isFinite(deg)) ? deg : 0;
        $("#CooldownOverlay").style.clip = "radial(50% 50%,0deg," + deg.toFixed(2) + "deg)";
    }

    $.Schedule(0.1, UpdateItem);
}

function ItemShowTooltip() {
    if (m_Item == -1)
        return;

    var itemName = Abilities.GetAbilityName(m_Item);
    // $.DispatchEvent("DOTAShowAbilityTooltipForEntityIndex", $.GetContextPanel(), itemName, m_QueryUnit);
    $.DispatchEvent("DOTAShowAbilityInventoryItemTooltip", $.GetContextPanel(), m_QueryUnit, m_ItemSlot);
}

function ItemHideTooltip() {
    $.DispatchEvent("DOTAHideAbilityTooltip", $.GetContextPanel());
}

var DOTA_ITEM_STASH_MIN = 6;

function IsInStash() {
    return (m_ItemSlot >= DOTA_ITEM_STASH_MIN);
}

function OnDragEnter(a, draggedPanel) {
    var draggedItem = draggedPanel.m_DragItem;
    if (draggedItem === null || draggedItem == m_Item)
        return true;

    $.GetContextPanel().AddClass("potential_drop_target");
    return true;
}

function OnDragDrop(panelId, draggedPanel) {
    if (draggedPanel.m_Source !== 'pet_items') return;

    var draggedItem = draggedPanel.m_DragItem;
    if (draggedItem === null)
        return true;

    draggedPanel.m_DragCompleted = true;
    if (draggedItem == m_Item)
        return true;

    var petItemSwapData = {
        source_entity: draggedPanel.m_UnitEntindex,
        source_item: draggedItem,
        target_entity: m_QueryUnit,
        target_slot: m_ItemSlot,
    };

    GameEvents.SendCustomGameEventToServer('xxwar_custom_pet_item_swap', petItemSwapData);

    return true;
}

function OnDragLeave(panelId, draggedPanel) {
    var draggedItem = draggedPanel.m_DragItem;
    if (draggedItem === null || draggedItem == m_Item)
        return false;

    $.GetContextPanel().RemoveClass("potential_drop_target");
    return true;
}

function OnDragStart(panelId, dragCallbacks) {
    if (m_Item == -1) {
        return true;
    }

    var itemName = Abilities.GetAbilityName(m_Item);

    ItemHideTooltip();

    var displayPanel = $.CreatePanel("DOTAItemImage", $.GetContextPanel(), "dragImage");
    displayPanel.itemname = itemName;
    displayPanel.contextEntityIndex = m_Item;
    displayPanel.m_DragItem = m_Item;
    displayPanel.m_UnitEntindex = m_QueryUnit;
    displayPanel.m_DragCompleted = false;
    displayPanel.m_Source = 'pet_items';

    dragCallbacks.displayPanel = displayPanel;
    dragCallbacks.offsetX = 0;
    dragCallbacks.offsetY = 0;

    $.GetContextPanel().AddClass("dragging_from");

    var handyButtonPanel = GetHandyButtonPanel();
    if(handyButtonPanel){
        handyButtonPanel.SetHasClass('drag_start', true);
    }

    return true;
}

function OnDragEnd(panelId, draggedPanel) {
    draggedPanel.DeleteAsync(0);
    $.GetContextPanel().RemoveClass("dragging_from");

    var handyButtonPanel = GetHandyButtonPanel();
    if(handyButtonPanel){
        handyButtonPanel.SetHasClass('drag_start', false);
    }
    return true;
}

function GetHandyButtonPanel() {
    var parentPanel = $.GetContextPanel().GetParent();
    for(var i = 1; i <= 5; i++){
        var handyPanel = parentPanel.FindChildTraverse("BagHandyButtons");
        if(handyPanel != null) {
            return handyPanel;
        } else {
            parentPanel = parentPanel.GetParent();
            if(parentPanel == null){
                break;
            }
        }
    }
    return null;
}

function SetItemSlot(itemSlot) {
    m_ItemSlot = itemSlot;
}

function SetItem(queryUnit, iItem) {
    m_Item = iItem;
    m_QueryUnit = queryUnit;
}

(function () {
    $.GetContextPanel().SetItem = SetItem;
    $.GetContextPanel().SetItemSlot = SetItemSlot;

    $.RegisterEventHandler('DragEnter', $.GetContextPanel(), OnDragEnter);
    $.RegisterEventHandler('DragDrop', $.GetContextPanel(), OnDragDrop);
    $.RegisterEventHandler('DragLeave', $.GetContextPanel(), OnDragLeave);
    $.RegisterEventHandler('DragStart', $.GetContextPanel(), OnDragStart);
    $.RegisterEventHandler('DragEnd', $.GetContextPanel(), OnDragEnd);

    UpdateItem();
})();
