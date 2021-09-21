# xxwar_content





## Avalon道具系统

#### 添加道具流程

```lua
GameRules:GetGameModeEntity():SetItemAddedToInventoryFilter(Dynamic_Wrap(Filter, "ItemAddedToInventory"),Filter)

Filter:ItemAddedToInventory

BagCtrl:InventoryFilter

-- check item types and add item to bag
```



#### 添加材料

1. 在文件"scripts/npc/items/item_material.kv" 中添加道具配置。

2. 在文件"scripts/vscripts/config/itemconfig.lua"中，会将"item_material.kv"中的道具自动加载到配置中，如果道具不加在"item_material.kv"中，需要在该lua文件中添加配置。

#### 添加消耗品

1. 在文件"scripts/npc/items/item_consumable.kv" 中添加道具配置。
2. 在文件"scripts/vscripts/config/itemconfig.lua"中，会将"item_consumable.kv"中的道具自动加载到配置中，如果道具不加在"item_consumable.kv"中，需要在该lua文件中添加配置。
3. 在"scripts/npc/abilities/custom_spell_items.kv"中，添加一个技能，名字为"custom_消耗品名字"，调用的lua文件添加在"scripts/vscripts/abilities/lua/"目录下。



#### 添加装备

	1. 在文件"item_equip_**.kv"中添加道具配置
 	2.  ……



#### 合成道具（装备）

1. 在game目录下的"scripts/vscripts/config/compose_table.lua"中添加合成信息， 如：

   ```lua
   item_compose_table = {
       {
           ["composeItem"] = "item_test_clothes",
           ["requestItem"] = {
               [1] = { itemname = "item_material_fur", count = 1},
               [2] = { itemname = "item_material_fibre", count = 1},
           }
       }
   }
   ```

2. 更新content目录啊下的"panorama/scripts/custom_game/copy_from_lua_config.js"文件，主要是更新ItemConfig和ComposeTable变量。