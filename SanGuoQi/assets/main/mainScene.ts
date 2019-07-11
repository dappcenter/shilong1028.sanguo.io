import { NoticeMgr } from "../manager/NoticeManager";
import { NoticeType } from "../manager/Enum";
import { GameMgr } from "../manager/GameManager";
import { MyUserData, MyUserMgr } from "../manager/MyUserData";

//全国地图场景
const {ccclass, property} = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    @property(cc.Label)
    goldLabel: cc.Label = null;
    @property(cc.Label)
    diamondLabel: cc.Label = null;
    @property(cc.Label)
    foodLabel: cc.Label = null;

    @property(cc.Node)
    mapNode: cc.Node = null;   //地图总节点

    @property(cc.Node)
    taskNode: cc.Node = null;  //任务总节点
    @property(cc.Node)
    taskOptNode: cc.Node = null;  //任务伸缩按钮节点
    @property(cc.Prefab)
    pfTask: cc.Prefab = null;  

    @property(cc.Prefab)
    pfBag: cc.Prefab = null;   //背包界面
    @property(cc.Prefab)
    pfRecruit: cc.Prefab = null;  //招募界面

    @property(cc.SpriteAtlas)
    cicleAtlas: cc.SpriteAtlas = null;   //转圈序列帧

    // LIFE-CYCLE CALLBACKS:

    MapLimitPos: cc.Vec2 = cc.v2(2884, 2632);  //地图位置限制
    touchBeginPos: cc.Vec2 = null;  //触摸起点
    bTaskUp: boolean = false;  //任务是否拉伸出来了

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);

        cc.game.on(cc.game.EVENT_SHOW, this.onShow, this);
        cc.game.on(cc.game.EVENT_HIDE, this.onHide, this);

        NoticeMgr.on(NoticeType.UpdateGold, this.UpdateGoldCount, this); 
        NoticeMgr.on(NoticeType.UpdateDiamond, this.UpdateDiamondCount, this); 
        NoticeMgr.on(NoticeType.UpdateFood, this.UpdateFoodCount, this); 
        
        NoticeMgr.on(NoticeType.MapMoveByCity, this.handleMapMoveByCityPos, this);   //话本目标通知（地图移动）

        this.mapNode.position = cc.v2(0, -900);   //初始显示洛阳  5768*5264   2884*2632
        this.MapLimitPos = cc.v2(this.MapLimitPos.x - cc.winSize.width/2, this.MapLimitPos.y - cc.winSize.height/2);
    }

    start () {
        this.UpdateGoldCount();
        this.UpdateDiamondCount();
        this.UpdateFoodCount();

        this.setTaskInfo();   //初始化任务
    }

    // update (dt) {}

    onDestroy(){
        this.node.targetOff(this);
        NoticeMgr.offAll(this);
    }

    UpdateGoldCount(){
        this.goldLabel.string = MyUserData.GoldCount.toString();
    }

    UpdateDiamondCount(){
        this.diamondLabel.string = MyUserData.DiamondCount.toString();
    }

    UpdateFoodCount(){
        this.foodLabel.string = MyUserData.FoodCount.toString();
    }

    setTaskInfo(){
        let task = cc.instantiate(this.pfTask)
        task.name = "TaskInfo";
        task.y = -95;
        this.taskNode.addChild(task, 10);

        this.bTaskUp = false;
        this.onTaskOptBtn();
    }

    /**预处理地图将要移动的目标坐标，放置移动过大地图出现黑边 */
    preCheckMapDestPos(offset: cc.Vec2){
        let destPos = this.mapNode.position.add(offset);
        if(destPos.x > this.MapLimitPos.x){
            destPos.x = this.MapLimitPos.x;
        }else if(destPos.x < -this.MapLimitPos.x){
            destPos.x = -this.MapLimitPos.x;
        }
        if(destPos.y > this.MapLimitPos.y){
            destPos.y = this.MapLimitPos.y;
        }else if(destPos.y < -this.MapLimitPos.y){
            destPos.y = -this.MapLimitPos.y;
        }
        return destPos;
    }


    //*******************  以下为各种事件处理方法  ************ */
    
    /** 将地图移动到指定目标点
     *  @param talkType 故事类型，0默认（摇旗）1起义暴乱（火） 2 战斗（双刀）
    */
    handleMapMoveByCityPos(cityPos: cc.Vec2, talkType:number=0){
        this.mapNode.stopAllActions();

        let midPos = this.mapNode.position.neg();    //当前视图中心在地图上的坐标
        let offset = midPos.sub(cityPos);
        let destPos = this.preCheckMapDestPos(offset);   //预处理地图将要移动的目标坐标，放置移动过大地图出现黑边

        let moveTime = destPos.sub(midPos).mag()/1000;
        this.mapNode.runAction(cc.sequence(cc.moveTo(moveTime, destPos), cc.callFunc(function(){
            let aniNode = GameMgr.createAtlasAniNode(this.cicleAtlas, 12, cc.WrapMode.Default);
            aniNode.position = cityPos;
            this.mapNode.addChild(aniNode, 100);
        }.bind(this))));
    }


    /************************  以下为各种按钮事件 ***************/

    /**后台切回前台 */
    onShow() {
        cc.log("************* onShow() 后台切回前台 ***********************")
    }

    /**游戏切入后台 */
    onHide() {
        cc.log("_____________  onHide()游戏切入后台  _____________________")
        //NotificationMy.emit(NoticeType.GAME_ON_HIDE, null);
    }

    touchStart(event: cc.Touch){
        this.touchBeginPos = event.getLocation();
    }

    touchMove(event: cc.Touch){
        if(this.touchBeginPos){
            let pos = event.getLocation();
            let offset = pos.sub(this.touchBeginPos);
            this.touchBeginPos = pos;

            this.mapNode.stopAllActions();
            
            let mapPos = this.preCheckMapDestPos(offset);   //预处理地图将要移动的目标坐标，放置移动过大地图出现黑边
            this.mapNode.position = mapPos;
        }
    }

    touchEnd(event: cc.Touch){
        this.touchBeginPos = null;
    }

    onHomeBtn(){
        cc.director.loadScene("capitalScene");
    }

    onTaskOptBtn(){
        this.taskNode.stopAllActions();
        this.bTaskUp = !this.bTaskUp;
        if(this.bTaskUp == true){
            this.taskOptNode.scaleY = -1;
            let destY = 150 - this.taskNode.y;
            this.taskNode.runAction(cc.moveTo(destY/500, cc.v2(0, 150)));
        }else{
            this.taskOptNode.scaleY = 1;
            let destY = this.taskNode.y - 45;
            this.taskNode.runAction(cc.moveTo(destY/500, cc.v2(0, 45)));
        }
    }

    onBagBtn(){
        GameMgr.showLayer(this.pfBag);
    }

    onShopBtn(){

    }

    onSignBtn(){

    }

    onRankBtn(){

    }

    onMoreBtn(){

    }

    onSetBtn(){

    }

    onSoldierBtn(){
        GameMgr.showLayer(this.pfRecruit);   //招募界面
    }

    onGeneralBtn(){

    }

}