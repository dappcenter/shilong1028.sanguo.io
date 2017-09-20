
--阵型Node界面
local ZhenXingNode = class("ZhenXingNode", CCLayerEx)

function ZhenXingNode:create()   --自定义的create()创建方法
    --G_Log_Info("ZhenXingLayer:create()")
    local layer = ZhenXingNode.new()
    return layer
end

function ZhenXingNode:onExit()
    --G_Log_Info("ZhenXingNode:onExit()")
end

--初始化UI界面
function ZhenXingNode:init()  
    --G_Log_Info("ZhenXingLayer:init()")
    local csb = cc.CSLoader:createNode("csd/ZhenXingNode.csb")
    self:addChild(csb)

    self.Image_Bg = csb:getChildByName("Image_Bg")

    self.headVec = {}
    for i=1, 7 do
        local headBg = csb:getChildByName("Image_head"..i)
        headBg:setTag(5000 + i)
        headBg:addTouchEventListener(handler(self,self.touchEvent))
        local optImg = headBg:getChildByName("Image_Opt")
        --local Text_desc = headBg:getChildByName("Text_desc")
        table.insert(self.headVec, {["headBg"] = headBg, ["optImg"] = optImg})
    end

    self.Button_help = csb:getChildByName("Button_help")
    self.Button_help:addTouchEventListener(handler(self,self.touchEvent))

    self.Button_sel = csb:getChildByName("Button_sel")
    self.Button_sel:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_sel:setVisible(false)
    self.Button_edit = csb:getChildByName("Button_edit")
    self.Button_edit:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_edit:setVisible(false)

    self.Text_bing = csb:getChildByName("Text_bing")   --总兵力
    self.Text_val = csb:getChildByName("Text_val")    --总战力

    self.parentLayer = nil
end

function ZhenXingNode:touchEvent(sender, eventType)
    if eventType == ccui.TouchEventType.ended then  
        if sender == self.Button_help then  

        elseif sender == self.Button_sel then     --选中
            if self.parentLayer then
                self.parentLayer:setRadioPanel(1)
            end
        elseif sender == self.Button_edit then     --编辑
            if self.parentLayer then
                self.parentLayer:setRadioPanel(1)
            end
        else
            local idx = sender:getTag() - 5000
            if idx >=1 and idx <= 7 then
                local headBg = self.headVec[idx].headBg
                local optImg = self.headVec[idx].optImg
            end
        end
    end
end

--设置选中或编辑按钮是否显示
function ZhenXingNode:setSelAndEditVisible(nType)  --0都显示，1选中显示，2编辑显示，其他都不显示
    if nType == 0 then
        self.Button_sel:setVisible(true)
        self.Button_edit:setVisible(true)
    elseif nType == 1 then
        self.Button_sel:setVisible(true)
        self.Button_edit:setVisible(false)
    elseif bType == 2 then
        self.Button_sel:setVisible(false)
        self.Button_edit:setVisible(true)
    else
        self.Button_sel:setVisible(false)
        self.Button_edit:setVisible(false)
    end
end

--设置头像上添加等图片是否显示
function ZhenXingNode:setOptImgVisible(bShow)
    for i=1, 7 do
        self.headVec[i].optImg:setVisible(bShow)
    end
end

function ZhenXingNode:setParentLayer(parent)
    self.parentLayer = parent
end


return ZhenXingNode