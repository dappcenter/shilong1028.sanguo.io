
import TableView from "../tableView/tableView";
import { GeneralInfo, ItemInfo, NoticeType } from "../manager/Enum";
import { MyUserMgr, MyUserData } from "../manager/MyUserData";
import { ROOT_NODE } from "../common/rootNode";
import Item from "../common/item";
import { GameMgr } from "../manager/GameManager";
import { NoticeMgr } from "../manager/NoticeManager";

//武将来投
const {ccclass, property} = cc._decorator;

@ccclass
export default class GeneralUnit extends cc.Component {

    @property(TableView)
    tableView: TableView = null;

    @property(cc.Label)
    descLabel: cc.Label = null;   //武将描述

    @property(cc.Node)
    bagItemNode: cc.Node = null;

    @property(cc.Label)
    bagNumLabel: cc.Label = null;  //背包数量

    @property(cc.Label)
    buyNumLabel: cc.Label = null;   //钻石（金锭）数量

    @property(cc.Button)
    bagBtn: cc.Button = null;

    @property(cc.Button)
    buyBtn: cc.Button = null;

    // LIFE-CYCLE CALLBACKS:
    selCellIdx: number = -1;   //选中的Cell索引
    selBingItem: ItemInfo = null;  //选中武将对应的士兵道具信息

    bBuying: boolean = false;   //正在购买中


    onLoad () {
        NoticeMgr.on(NoticeType.UpdateGeneral, this.handleUpdateGeneral, this);   //更新单个武将

        this.clearShowInfo();

        ROOT_NODE.showLayerMoney(this.node, cc.v2(0, 385));    //一级界面上的金币钻石粮草公用控件

        this.initGeneralList();
    }

    onDestroy(){
        //this.node.targetOff(this);
        NoticeMgr.offAll(this);
    }

    start () {
    }

    // update (dt) {}

    onCloseBtn(){
        this.node.removeFromParent(true);
    }

    clearShowInfo(){
        this.descLabel.string = "";
        this.bagNumLabel.string = "x0";
        this.buyNumLabel.string = "";
        this.bagItemNode.removeAllChildren();

        this.bagBtn.interactable = false;
        this.buyBtn.interactable = false;
        
    }

    //刷新武将列表
    initGeneralList(){
        this.tableView.openListCellSelEffect(true);   //是否开启Cell选中状态变换
        this.tableView.initTableView(MyUserData.GeneralList.length, { array: MyUserData.GeneralList, target: this, bClick: true}); 
        this.handleGeneralCellClick(0);   //点击武将
    }

    //单个武将数据更新
    handleUpdateGeneral(info: GeneralInfo){
        //cc.log("handleUpdateGeneral(), 单个武将数据更新, info = "+JSON.stringify(info));

        this.selCellIdx = -1;
        this.selBingItem = null;
        
        this.tableView.clear();
        this.initGeneralList();  //刷新武将列表

        this.bBuying = false;  //正在购买中
    }

    /**点击武将 */
    handleGeneralCellClick(clickIdx: number, bUpdate:boolean=false){
        if(bUpdate == false && this.selCellIdx == clickIdx){
            return;
        }
        this.selCellIdx = clickIdx;   //选中的Cell索引
        this.clearShowInfo();

        let selGeneralInfo: GeneralInfo = MyUserData.GeneralList[this.selCellIdx];
        this.descLabel.string = selGeneralInfo.generalCfg.desc;

        let bingId = selGeneralInfo.generalCfg.bingzhong;
        this.selBingItem = MyUserMgr.getItemFromList(bingId);  //选中武将对应的士兵道具信息
        if(this.selBingItem){
            let itemNode = cc.instantiate(ROOT_NODE.pfItem);
            this.bagItemNode.addChild(itemNode, 10);
            itemNode.getComponent(Item).initItemData(this.selBingItem);

            this.bagNumLabel.string = "x"+this.selBingItem.count;
            if(this.selBingItem.count > 0){
                this.bagBtn.interactable = true;
            }

            let cost = Math.ceil(this.selBingItem.itemCfg.cost*2/1000);
            this.buyNumLabel.string = cost.toString();
            if(MyUserData.DiamondCount >= cost){
                this.buyBtn.interactable = true;
            }
        }

        if(selGeneralInfo.bingCount >= GameMgr.getMaxBingCountByLv(selGeneralInfo.generalLv)){   //部曲满员
            this.bagBtn.interactable = false;
            this.buyBtn.interactable = false;
        }
    }

    onBagBtn(){
        if(this.bBuying == true){  //正在购买中
            return;
        } 

        if(this.selBingItem.count > 0){  //选中武将对应的士兵道具信息
            MyUserMgr.updateItemByCount(this.selBingItem.itemId, -1, true);  //修改用户背包物品列表

            this.updateGeneralBingCount();   //更新武将部曲士兵数量
        }
    }

    onBuyBtn(){
        if(this.bBuying == true){  //正在购买中
            return;
        } 

        let cost = Math.ceil(this.selBingItem.itemCfg.cost*2/1000);
        if(MyUserData.DiamondCount >= cost){  //选中武将对应的士兵道具信息
            MyUserMgr.updateUserDiamond(-cost, true);  //修改用户背包物品列表

            this.updateGeneralBingCount();   //更新武将部曲士兵数量
        }
    }

    //更新武将部曲士兵数量
    updateGeneralBingCount(){
        let selGeneralInfo: GeneralInfo = MyUserData.GeneralList[this.selCellIdx];
        selGeneralInfo.updateBingCount(1000);
        //cc.log("updateGeneralBingCount(), this.selCellIdx = "+this.selCellIdx+"; selGeneralInfo = "+JSON.stringify(selGeneralInfo));
        MyUserMgr.updateGeneralList(selGeneralInfo, true);   //修改用户武将列表

        if(GameMgr.curTaskConf.type == 4){   //任务类型 1 视频剧情 2主城建设 3招募士兵 4组建部曲 5参加战斗
            GameMgr.handleStoryShowOver(GameMgr.curTaskConf);  //任务宣读(第一阶段）完毕处理
        }
    }
}