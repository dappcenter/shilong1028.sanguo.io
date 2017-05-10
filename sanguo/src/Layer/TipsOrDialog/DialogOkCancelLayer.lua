
--OKCacel提示框
local DialogOkCancelLayer = class("DialogOkCancelLayer", CCLayerEx)

function DialogOkCancelLayer:create()   --自定义的create()创建方法
    --G_Log_Info("DialogOkCancelLayer:create()")
    local layer = DialogOkCancelLayer.new()
    return layer
end

function DialogOkCancelLayer:onExit()
    --G_Log_Info("DialogOkCancelLayer:onExit()")
end

--初始化UI界面
function DialogOkCancelLayer:init()  
    --G_Log_Info("DialogOkCancelLayer:init()")
    local csb = cc.CSLoader:createNode("csd/DialogOkCancelLayer.csb")
    self:addChild(csb)
    csb:setContentSize(g_WinSize)
    ccui.Helper:doLayout(csb)
    --self:showInTheMiddle(csb)

    self.Image_bg = csb:getChildByName("Image_bg")
    self.titleBg = self.Image_bg:getChildByName("titleBg")
    self.Text_title = self.Image_bg:getChildByName("Text_title")

    self.Button_cancel = self.Image_bg:getChildByName("Button_cancel")
    self.Button_cancel:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_ok = self.Image_bg:getChildByName("Button_ok")
    self.Button_ok:addTouchEventListener(handler(self,self.touchEvent))
    self.Button_close = self.Image_bg:getChildByName("Button_close")   
    self.Button_close:addTouchEventListener(handler(self,self.touchEvent))

    self.ListView = self.Image_bg:getChildByName("ListView")
    self.ListView:setBounceEnabled(true)
    self.ListView:setScrollBarEnabled(false)   --屏蔽列表滚动条
    self.ListView_Size = self.ListView:getContentSize()
end

function DialogOkCancelLayer:bindingData(titleStr, infoStr, okCallBack, cancelBack, style)  
    self.Text_title:setString(titleStr)
    local bgWidth = 150
    if self.Text_title:getContentSize().width > 130 then
        bgWidth = self.Text_title:getContentSize().width + 20
    end
    self.titleBg:setContentSize(cc.size(bgWidth, self.Text_title:getContentSize().height + 10))

    local textSize = cc.size(self.ListView:getContentSize().width - 10, 0)
    self.Text_content = cc.Label:createWithTTF(infoStr, g_sDefaultTTFpath, g_defaultTipsFontSize, textSize, cc.TEXT_ALIGNMENT_LEFT, cc.VERTICAL_TEXT_ALIGNMENT_CENTER)
    self.Text_content:setColor(g_ColorDef.Yellow)
    --self.Text_content:enableBold()   --加粗
    --self.Text_content:enableShadow()   --阴影
    self.Text_content:enableOutline(g_ColorDef.DarkRed, 1)   --描边

    self.Text_content:setAnchorPoint(cc.p(0, 0))
    --self.Text_content:setPosition(cc.p(self.ListView:getContentSize().width/2, self.ListView:getContentSize().height - 5))

    local cur_item = ccui.Layout:create()
    cur_item:setContentSize(self.Text_content:getContentSize())
    cur_item:addChild(self.Text_content)
    self.ListView:addChild(cur_item)

    local InnerHeight = self.Text_content:getContentSize().height
    if InnerHeight < self.ListView_Size.height then
        --self.ListView:setContentSize(cc.size(self.ListView_Size.width, InnerHeight))
        self.ListView:setBounceEnabled(false)
    else
        --self.ListView:setContentSize(self.ListView_Size)
        self.ListView:setBounceEnabled(true)
    end

    self.okCallBack = okCallBack
    self.cancelBack = cancelBack

    --默认显示Ok, cancel,close
    if style == 1 then   
        self.Button_cancel:setVisible(false)   --1显示Ok,close
    elseif style == 2 then
        self.Button_ok:setVisible(false)   --2显示cancel,close
    elseif style == 3 then
        self.Button_cancel:setVisible(false)   --3显示Ok
        self.Button_close:setVisible(false)
    elseif style == 4 then
        self.Button_cancel:setVisible(false)   --4显示close
        self.Button_ok:setVisible(false)
    end
end

function DialogOkCancelLayer:touchEvent(sender, eventType)
    if eventType == ccui.TouchEventType.ended then  
        if sender == self.Button_close then  
            --不能使用g_pGameLayer:RemoveChildByUId()，因为okcancel对话框公用Tag  
            self:removeFromParent(true)
        elseif sender == self.Button_ok then  
            if self.okCallBack then self.okCallBack() end
        elseif sender == self.Button_cancel then  
            if self.cancelBack then self.cancelBack() end
            self:removeFromParent(true)
        end
    end
end


return DialogOkCancelLayer
