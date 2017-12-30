
--武将信息大界面
local GeneralLayer = class("GeneralLayer", CCLayerEx)  --填入类名

local SmallOfficerCell = require("Layer.Role.SmallOfficerCell")
local ItemCell = require("Layer.Item.ItemCell")

function GeneralLayer:create()   --自定义的create()创建方法
    --G_Log_Info("GeneralLayer:create()")
    local layer = GeneralLayer.new()
    return layer
end

function GeneralLayer:onExit()
    --G_Log_Info("GeneralLayer:onExit()")
end

--初始化UI界面
function GeneralLayer:init()  
    --G_Log_Info("GeneralLayer:init()")
    --self:setTouchEnabled(true)
    self:setSwallowTouches(true)

    local csb = cc.CSLoader:createNode("csd/GeneralInfoLayer.csb")
    csb:setContentSize(g_WinSize)
    ccui.Helper:doLayout(csb)
    self:addChild(csb)

    self.Image_bg = csb:getChildByName("Image_bg")
    self.titleBg = self.Image_bg:getChildByName("titleBg")
    self.Text_title = self.Image_bg:getChildByName("Text_title")
    self.Text_title:setString(lua_general_Str1)

    self.Button_close = self.Image_bg:getChildByName("Button_close")   
    self.Button_close:addTouchEventListener(handler(self,self.touchEvent))
    --武将列表
    self.ListView_general = self.Image_bg:getChildByName("ListView_general")
    self.ListView_general:setTouchEnabled(true)
    self.ListView_general:setBounceEnabled(true)
    self.ListView_general:setScrollBarEnabled(false)   --屏蔽列表滚动条
    self.ListView_general:setItemsMargin(10.0)
    self.ListView_generalSize = self.ListView_general:getContentSize()

    --武将信息
    self.Button_InfoRadio = self.Image_bg:getChildByName("Button_InfoRadio")
    self.Button_InfoRadio:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_InfoRadio_Text = self.Button_InfoRadio:getChildByName("Text_btn")
    --武将部曲
    self.Button_armyRadio = self.Image_bg:getChildByName("Button_armyRadio")
    self.Button_armyRadio:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_armyRadio_Text = self.Button_armyRadio:getChildByName("Text_btn")
    --武将技能
    self.Button_skillRadio = self.Image_bg:getChildByName("Button_skillRadio")
    self.Button_skillRadio:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_skillRadio_Text = self.Button_skillRadio:getChildByName("Text_btn")

    self.Panel_Info = self.Image_bg:getChildByName("Panel_Info")
    --武将信息层
    local generalInfoNode = self.Panel_Info:getChildByName("generalInfoNode")
    self.generalInfoNode = generalInfoNode

    self.info_Image_headBg = generalInfoNode:getChildByName("Image_headBg")    --头像背景
    self.info_Image_color = generalInfoNode:getChildByName("Image_color")   --品质颜色

    self.info_Image_toukui = generalInfoNode:getChildByName("Image_toukui")  --头盔
    self.info_Image_wuqi = generalInfoNode:getChildByName("Image_wuqi")      --武器
    self.info_Image_hujia = generalInfoNode:getChildByName("Image_hujia")    --护甲
    self.info_Image_zuoqi = generalInfoNode:getChildByName("Image_zuoqi")    --坐骑
    self.info_Image_daoju = generalInfoNode:getChildByName("Image_daoju")    --道具

    self.info_Text_name = generalInfoNode:getChildByName("Text_name")    --名称
    self.info_Text_lv = generalInfoNode:getChildByName("Text_lv")    --等级
    self.info_Text_offical = generalInfoNode:getChildByName("Text_offical")   --官职
    self.info_Text_zhongcheng = generalInfoNode:getChildByName("Text_zhongcheng")   --忠诚度

    self.info_Text_hp = generalInfoNode:getChildByName("Text_hp")    --血量
    self.info_Text_mp = generalInfoNode:getChildByName("Text_mp")    --智力
    self.info_Text_att = generalInfoNode:getChildByName("Text_att")   --攻击
    self.info_Text_def = generalInfoNode:getChildByName("Text_def")   --防御

    self.info_Text_desc = generalInfoNode:getChildByName("Text_desc")   --武将类型，英雄，武将，文官
    self.info_Text_attr = generalInfoNode:getChildByName("Text_attr")   --属性描述（+装备加成）
    self.info_Text_generalDesc = generalInfoNode:getChildByName("Text_generalDesc")  --武将简介

    --部曲层
    local generalUnitNode = self.Panel_Info:getChildByName("generalUnitNode")
    self.generalUnitNode = generalUnitNode

    self.unit_Image_headBg = generalUnitNode:getChildByName("Image_headBg")    --头像背景
    self.unit_Image_color = generalUnitNode:getChildByName("Image_color")   --品质颜色

    self.unit_Image_qibing = generalUnitNode:getChildByName("Image_qibing")  --骑兵
    self.unit_Image_qiangbing = generalUnitNode:getChildByName("Image_qiangbing") --枪兵
    self.unit_Image_daobing = generalUnitNode:getChildByName("Image_daobing")  --刀兵
    self.unit_Image_gongbing = generalUnitNode:getChildByName("Image_gongbing") --弓兵

    self.unit_Text_name = generalUnitNode:getChildByName("Text_name")    --武将名称
    self.unit_Text_UnitName = generalUnitNode:getChildByName("Text_unit_name")    --部曲名称
    self.unit_Text_UnitLv = generalUnitNode:getChildByName("Text_unit_lv")    --部曲等级

    self.unit_Text_bingCount = generalUnitNode:getChildByName("Text_bingCount")   --预备兵数量
    self.unit_Text_bingjia = generalUnitNode:getChildByName("Text_bingjia")   --兵甲数量
    self.unit_Text_bingqi = generalUnitNode:getChildByName("Text_bingqi")   --兵器数量
    self.unit_Text_mapi = generalUnitNode:getChildByName("Text_mapi")   --马匹数量

    self.unit_Text_cost = generalUnitNode:getChildByName("Text_cost")    --花费金币
    self.unit_Text_cost_gold = generalUnitNode:getChildByName("Text_cost_gold")   --花费金币数量

    self.unit_Text_numCount = generalUnitNode:getChildByName("Text_numCount")   --选中部曲的数量
    self.unit_Slider_num = generalUnitNode:getChildByName("Slider_num")   --滑动条

    --[[
    local slider = ccui.Slider:create()
    slider:setTouchEnabled(true)
    slider:loadBarTexture("cocosui/sliderTrack.png")
    slider:loadProgressBarTexture("cocosui/sliderProgress.png")
    slider:loadSlidBallTextures("cocosui/sliderThumb.png", "cocosui/sliderThumb.png", "")  
    slider:setPosition(cc.p(size.width / 2.0, size.height * 0.15 + slider:getSize().height * 2.0))
    slider:setPercent(52)
    slider:addEventListenerSlider(sliderEvent)
    layer:addChild(slider)
    ]]
    local function sliderEvent(sender, eventType)
        if eventType == ccui.SliderEventType.percentChanged then
            --print("SliderPercent = ", sender:getPercent() / 100.0)
        end
    end
    self.unit_Slider_num:addEventListenerSlider(sliderEvent)

    self.Button_save = generalUnitNode:getChildByName("Button_save")   --部曲保存
    self.Button_save:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_update = generalUnitNode:getChildByName("Button_update")    --部曲升阶
    self.Button_update:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_useItem = generalUnitNode:getChildByName("Button_useItem")   --使用背包士兵Item
    self.Button_useItem:addTouchEventListener(handler(self,self.touchEvent))

    --背包士兵Item列表
    self.ListView_Item = generalUnitNode:getChildByName("ListView_Item")
    self.ListView_Item:setTouchEnabled(true)
    self.ListView_Item:setBounceEnabled(true)
    self.ListView_Item:setScrollBarEnabled(false)   --屏蔽列表滚动条
    self.ListView_Item:setItemsMargin(10.0)
    self.ListView_ItemSize = self.ListView_Item:getContentSize()


    self:LoadGeneralList()

    self:setRadioPanel(1)
end

function GeneralLayer:setRadioPanel(idx)
    if idx < 0 or idx > 3 then
        return
    end
    if self.selRadioIdx and self.selRadioIdx == idx then
        return
    end
    self.selRadioIdx = idx

    if idx == 1 then   --武将信息
        self.Button_InfoRadio:loadTextureNormal("public_radio2.png", ccui.TextureResType.plistType)
        self.Button_armyRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)
        self.Button_skillRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)

        self.Button_InfoRadio_Text:enableOutline(g_ColorDef.DarkRed, 1)
        self.Button_armyRadio_Text:disableEffect()
        self.Button_skillRadio_Text:disableEffect()

        self.generalInfoNode:setVisible(true)
        self.generalUnitNode:setVisible(false)
    elseif idx == 2 then   --武将部曲
        self.Button_InfoRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)
        self.Button_armyRadio:loadTextureNormal("public_radio2.png", ccui.TextureResType.plistType)
        self.Button_skillRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)

        self.Button_armyRadio_Text:enableOutline(g_ColorDef.DarkRed, 1)
        self.Button_InfoRadio_Text:disableEffect()
        self.Button_skillRadio_Text:disableEffect()

        self.generalInfoNode:setVisible(false)
        self.generalUnitNode:setVisible(true)
    elseif idx == 3 then   --武将技能
        self.Button_InfoRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)
        self.Button_armyRadio:loadTextureNormal("public_radio1.png", ccui.TextureResType.plistType)
        self.Button_skillRadio:loadTextureNormal("public_radio2.png", ccui.TextureResType.plistType)

        self.Button_skillRadio_Text:enableOutline(g_ColorDef.DarkRed, 1)
        self.Button_InfoRadio_Text:disableEffect()
        self.Button_armyRadio_Text:disableEffect()

        self.generalInfoNode:setVisible(false)
        self.generalUnitNode:setVisible(false)
    end
end

function GeneralLayer:LoadGeneralList()
    self.generalVec = {}
    self.generalCellVec = {}

    local function callFunc(target, tagIdx)
        self:ListCellCallBack(target, tagIdx)
    end

    self.HeroCampData = g_HeroDataMgr:GetHeroCampData()
    if self.HeroCampData then
        local generalIdVec = self.HeroCampData.generalIdVec
        for k, generalId in pairs(generalIdVec) do
            local generalData = g_pTBLMgr:getGeneralConfigTBLDataById(generalId) 
            if generalData then
                table.insert(self.generalVec, generalData)
                local officerCell = SmallOfficerCell:new()
                officerCell:initData(generalData, k) 
                officerCell:setSelCallBack(callFunc)
                table.insert(self.generalCellVec, officerCell)

                local cur_item = ccui.Layout:create()
                cur_item:setContentSize(officerCell:getContentSize())
                cur_item:addChild(officerCell)
                --cur_item:setEnabled(true)

                self.ListView_general:addChild(cur_item)
                local pos = cc.p(cur_item:getPosition())
            end
        end
        local len = #self.generalCellVec
        local InnerWidth = len*90 + 10*(len-1)
        if InnerWidth < self.ListView_generalSize.width then
            self.ListView_general:setContentSize(cc.size(InnerWidth, self.ListView_generalSize.height))
            self.ListView_general:setBounceEnabled(false)
        else
            self.ListView_general:setContentSize(self.ListView_generalSize)
            self.ListView_general:setBounceEnabled(true)
        end
        self.ListView_general:refreshView()
    end

    self.lastSelOfficalCell = self.generalCellVec[1]
    self.lastSelOfficalCell:showSelEffect(true)
    self:initGeneralData(self.generalVec[1])
end

function GeneralLayer:ListCellCallBack(target, tagIdx)
    G_Log_Info("GeneralLayer:ListCellCallBack(), tagIdx = %d", tagIdx)
    if self.lastSelOfficalCell and target ~= self.lastSelOfficalCell then
        self.lastSelOfficalCell:showSelEffect(false)
    end
    self.lastSelOfficalCell = target
    self.lastSelOfficalCell:showSelEffect(true)

    self:initGeneralData(self.generalVec[tagIdx]) 
end

function GeneralLayer:initGeneralData(generalData)  
    --G_Log_Dump(generalData, "generalData = ")
    self.GeneralData = generalData
    if generalData == nil then
        G_Log_Error("GeneralLayer:initGeneralData(), generalData = nil")
        return
    end
    --[[
    self.id_str = ""   --武将ID字符串(xml保存)
    self.name = ""     --武将名称
    self.level = 0     --武将等级(xml保存)
    self.type = 0    --将领类型，1英雄，2武将，3军师
    self.hp = 0    --初始血量值
    self.mp = 0        --初始智力值
    self.atk = 0     --初始攻击力
    self.def = 0     --初始防御力
    self.skillVec = {}    --初始技能，技能lv-ID字符串以;分割(xml保存)
    self.equipVec = {}    --初始装备，装备lv-ID字符串以;分割(xml保存)
    self.desc = ""    --描述
    --附加属性(xml保存)
    self.exp = 0   --战斗经验
    self.offical = ""    --官职ID字符串，官职可以提升武将血智攻防、额外带兵数（默认带1000兵）等属性
    self.zhongcheng = 100   --武将忠诚度
    self.bingTypeVec = {}    --轻装|重装|精锐|羽林品质的骑兵|枪戟兵|刀剑兵|弓弩兵等共16种（每个兵种仅可组建一支部曲）
    self.armyUnitVec = {}    --g_tbl_armyUnitConfig:new()   --武将部曲数据
    ]]

    --初始化信息界面UI
    self:initInfoUI()

    --部曲信息
    self:initUnitUI()

end

--初始化信息界面UI
function GeneralLayer:initInfoUI()
    --头像背景
    local bgHeadSize = self.info_Image_headBg:getContentSize()
    if not self.info_headImg then
        self.info_headImg =  ccui.ImageView:create(string.format("Head/%s.png", self.GeneralData.id_str), ccui.TextureResType.localType)
        self.info_headImg:setScale(bgHeadSize.width/self.info_headImg:getContentSize().width)
        self.info_headImg:setPosition(cc.p(bgHeadSize.width/2, bgHeadSize.height/2))
        self.info_Image_headBg:addChild(self.info_headImg)
    else
        self.info_headImg:loadTexture(string.format("Head/%d.png", self.GeneralData.id_str), ccui.TextureResType.localType)
    end
    --品质颜色
    local colorIdx = G_GetGeneralColorIdxByLv(self.GeneralData.level)
    if colorIdx > 0 and colorIdx <=5 then
        self.info_Image_color:setVisible(true)
        self.info_Image_color:loadTexture(string.format("public_colorBg%d.png", colorIdx), ccui.TextureResType.plistType)
        --self.info_Image_color:setScale(bgHeadSize.width/self.info_headImg:getContentSize().width)

        self.unit_Image_color:setVisible(true)
        self.unit_Image_color:loadTexture(string.format("public_colorBg%d.png", colorIdx), ccui.TextureResType.plistType)
        --self.unit_Image_color:setScale(bgHeadSize.width/self.info_headImg:getContentSize().width)
    else
        self.info_Image_color:setVisible(false)
        self.unit_Image_color:setVisible(false)
    end

    self.info_Text_name:setString(self.GeneralData.name)    --名称
    self.info_Text_lv:setString(string.format(lua_Role_String2, self.GeneralData.level))     --等级
    self.info_Text_generalDesc:setString(self.GeneralData.desc)  --武将简介

    self.info_Text_hp:setString(string.format(lua_Role_String3, self.GeneralData.hp))    --血量
    self.info_Text_mp:setString(string.format(lua_Role_String4, self.GeneralData.mp))    --智力
    self.info_Text_att:setString(string.format(lua_Role_String5, self.GeneralData.atk))   --攻击
    self.info_Text_def:setString(string.format(lua_Role_String6, self.GeneralData.def))   --防御

    local officalData = g_pTBLMgr:getOfficalConfigById(self.GeneralData.offical)
    local officalName = lua_Role_String_No
    if officalData then
        officalName = officalData.name
    end
    self.info_Text_offical:setString(string.format(lua_Role_String9, officalName))   --官职

    self.info_Text_desc:setString(lua_Role_TypeStrVec[self.GeneralData.type])   --武将类型，英雄，武将，文官

    self.info_Text_zhongcheng:setString(string.format(lua_Role_String10, self.GeneralData.zhongcheng))  --忠诚度

    for k, equip in pairs(self.GeneralData.equipVec) do
        local equipData = g_pTBLMgr:getItemConfigTBLDataById(equip.equipId) 
        if equipData then
            -- self.info_Image_toukui = generalInfoNode:getChildByName("Image_toukui")  --头盔
            -- self.info_Image_wuqi = generalInfoNode:getChildByName("Image_wuqi")      --武器
            -- self.info_Image_hujia = generalInfoNode:getChildByName("Image_hujia")    --护甲
            -- self.info_Image_zuoqi = generalInfoNode:getChildByName("Image_zuoqi")    --坐骑
            -- self.info_Image_daoju = generalInfoNode:getChildByName("Image_daoju")    --道具
        end
    end
end

--初始化部曲增兵界面显示
function GeneralLayer:initUnitUI()
    self.unit_Text_cost:setVisible(false)
    self.unit_Text_cost_gold:setString("")
    self.unit_Text_numCount:setString("0")
    self.unit_Slider_num:setPercent(0)

    if not self.unit_headImg then  --头像背景
        self.unit_headImg =  ccui.ImageView:create(string.format("Head/%s.png", self.GeneralData.id_str), ccui.TextureResType.localType)
        self.unit_headImg:setScale(bgHeadSize.width/self.unit_headImg:getContentSize().width)
        self.unit_headImg:setPosition(cc.p(bgHeadSize.width/2, bgHeadSize.height/2))
        self.unit_Image_headBg:addChild(self.unit_headImg)
    else
        self.unit_headImg:loadTexture(string.format("Head/%d.png", self.GeneralData.id_str), ccui.TextureResType.localType)
    end
    self.unit_Text_name:setString(self.GeneralData.name)    --武将名称

    local PrepTroops = g_HeroDataMgr:GetHeroPrepTroops()  --获取可用劳力（预备役）人数
    self.unit_Text_bingCount:setString(string.format(lua_Role_String11, PrepTroops) )  --预备兵数量

    local bingjiaItem = g_HeroDataMgr:GetBagItemDataById("504")
    self.unit_Text_bingjia:setString(string.format(lua_Role_String12, bingjiaItem and bingjiaItem.num or 0) )  --兵甲数量

    self.unit_Text_bingqi:setString("")   --兵器数量
    self.unit_Text_mapi:setString("")    --马匹数量
    self.unit_Text_UnitName:setString(string.format(lua_Role_String16, lua_Role_String_No))   --部曲名称
    self.unit_Text_UnitLv:setString(string.format(lua_Role_String17, 0))   --部曲等级

    -- self.unit_Image_qibing = generalUnitNode:getChildByName("Image_qibing")  --骑兵
    -- self.unit_Image_qiangbing = generalUnitNode:getChildByName("Image_qiangbing") --枪兵
    -- self.unit_Image_daobing = generalUnitNode:getChildByName("Image_daobing")  --刀兵
    -- self.unit_Image_gongbing = generalUnitNode:getChildByName("Image_gongbing") --弓兵
end



function GeneralLayer:touchEvent(sender, eventType)
    if eventType == ccui.TouchEventType.ended then  
        if sender == self.Button_close then 
            g_pGameLayer:RemoveChildByUId(g_GameLayerTag.LAYER_TAG_GeneralLayer)
        elseif sender == self.Button_InfoRadio then 
            self:setRadioPanel(1)
        elseif sender == self.Button_armyRadio then
            self:setRadioPanel(2)
        elseif sender == self.Button_skillRadio then
            self:setRadioPanel(3)
        elseif sender == self.Button_save then   --部曲保存
        elseif sender == self.Button_update then   --部曲升阶
        end
    end
end


return GeneralLayer