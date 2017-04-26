--小头像信息Cell

local SmallOfficerCell = class("SmallOfficerCell", CCLayerEx)

function SmallOfficerCell:create()   --自定义的create()创建方法
    --G_Log_Info("SmallOfficerCell:create()")
    local layer = SmallOfficerCell.new()
    return layer
end

--初始化UI界面
function SmallOfficerCell:init()  
    --G_Log_Info("SmallOfficerCell:init()")
    local csb = cc.CSLoader:createNode("csd/SmallOfficerCell.csb")
    self:addChild(csb)
    self:setContentSize(cc.size(90, 90))

    self.Image_bg = csb:getChildByName("Image_bg")  
    self.Image_bg:setTouchEnabled(true)
    self.Image_bg:addTouchEventListener(handler(self,self.touchEvent))

    self.Image_color = csb:getChildByName("Image_color")   --品质，游击1-3/轻装4-10/重装11-25/精锐26-50/禁卫51-99
    self.Image_type = csb:getChildByName("Image_type")    --兵种

    self.Text_name = csb:getChildByName("Text_name")      --名称&Lv
    self.Text_num = csb:getChildByName("Text_num")   -- 兵力
    self.Text_type = csb:getChildByName("Text_type")   --熟练度S/A/B/C/D
end

function SmallOfficerCell:initData(generalData)  
    --G_Log_Info("SmallOfficerCell:initData()")
    local bgSize = self.Image_bg:getContentSize()
    if not self.headImg then
        self.headImg =  ccui.ImageView:create(string.format("Head/%s.png", generalData.id_str), ccui.TextureResType.localType)
        self.headImg:setScale(bgSize.width/self.headImg:getContentSize().width)
        self.headImg:setPosition(cc.p(bgSize.width/2, bgSize.height/2))
        self.Image_bg:addChild(self.headImg)
    end

    self.Text_name:setString(generalData.name.."Lv"..generalData.level)    --名称&Lv

    self.Text_num:setString(string.format(lua_Role_String1, 1000))    -- 兵力

    self.Text_type:setString("A")    --熟练度S/A/B/C/D

    local colorIdx = G_GetGeneralColorIdxByLv(generalData.level)
    if colorIdx > 0 and colorIdx <=5 then
        self.Image_color:setVisible(true)
        self.Image_color:loadTexture(string.format("public_colorBg%d.png", colorIdx), ccui.TextureResType.plistType)
    else
        self.Image_color:setVisible(false)
    end

    local typeStr = "public_daobing.png"
    if generalData.bingzhong[1] == "10001" then
        typeStr = "public_daobing.png"
    elseif generalData.bingzhong[1] == "10002" then
        typeStr = "public_qiangbing.png"
    elseif generalData.bingzhong[1] == "10003" then
        typeStr = "public_qibing.png"
    elseif generalData.bingzhong[1] == "10004" then
        typeStr = "public_gongbing.png"
    end

    self.Image_type:loadTexture(string.format("Head/%s.png", typeStr), ccui.TextureResType.localType)
end

function SmallOfficerCell:touchEvent(sender, eventType)
    if eventType == ccui.TouchEventType.ended then  
        if sender == self.Image_bg then   

        end
    end
end

return SmallOfficerCell