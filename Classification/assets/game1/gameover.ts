import { GameMgr } from "../manager/GameManager";
import { SDKMgr } from "../manager/SDKManager";
import { AudioMgr } from "../manager/AudioMgr";
import { MyUserDataMgr } from "../manager/MyUserData";


//游戏结束界面
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOver extends cc.Component {

    @property(cc.Node)
    bgImg: cc.Node = null;

    @property(cc.Node)
    touchNode: cc.Node = null;

    @property(cc.Label)
    descLabel: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:
    rewardsCount: number = 0;   //奖励积分数量

    onLoad () {
        //this.touchNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);

        this.descLabel.string = "";
    }

    start () {

    }

    // update (dt) {}

    touchEnd(event: cc.Touch){
        let pos1 = this.bgImg.convertToNodeSpace(event.getLocation());
        let rect1 = cc.rect(0, 0, this.bgImg.width, this.bgImg.height);
        if(!rect1.contains(pos1)){
            this.onCloseBtn();
        }
    }

    onVedioBtn(){
        AudioMgr.playEffect("effect/ui_click");
        SDKMgr.showVedioAd("ChapterVedioId", ()=>{
            //失败
        }, ()=>{
            //成功
            MyUserDataMgr.updateUserGold(this.rewardsCount*2);
            GameMgr.gotoSearchScene();
        }); 
    }

    onCloseBtn(){
        AudioMgr.playEffect("effect/ui_click");
        MyUserDataMgr.updateUserGold(this.rewardsCount);
        GameMgr.gotoSearchScene();
    }

    initGameOverData(gameTime: number, collectNum: number, rewardCount:number){
        this.rewardsCount = rewardCount;   //奖励积分数量

        let timeStr = Math.floor(gameTime/60)+"分"+(gameTime/60).toFixed(2);
        this.descLabel.string = "恭喜你，在"+timeStr+"秒的时间内成功回收/分拣"+collectNum+"件垃圾，获得"+this.rewardsCount+"金币。";
    }

}
