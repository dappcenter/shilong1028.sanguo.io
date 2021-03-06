import { SkillInfo, GeneralInfo } from "../manager/Enum";
import SkillLayer from "./skillLayer";
import { MyUserMgr, MyUserData } from "../manager/MyUserData";
import { ROOT_NODE } from "../common/rootNode";
import { GameMgr } from "../manager/GameManager";
import { SDKMgr } from "../manager/SDKManager";


//技能展示卡
const {ccclass, property} = cc._decorator;

@ccclass
export default class SkillCard extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;

    @property(cc.Node)
    addBtn: cc.Node = null;
    @property(cc.Node)
    delBtn: cc.Node = null;

    @property(cc.SpriteAtlas)
    skillAtlas: cc.SpriteAtlas = null;

    // LIFE-CYCLE CALLBACKS:
    skillInfo: SkillInfo = null;
    generalInfo: GeneralInfo = null;
    targetSc: SkillLayer = null;

    onLoad () {
        this.clearUI();
    }

    clearUI(){
        this.nameLabel.string = "";
        this.iconSpr.spriteFrame = null;
        this.addBtn.active = false;
        this.delBtn.active = false;
    }

    start () {

    }

    // update (dt) {}

    //武将技能
    initGeneralSkill(skillInfo: SkillInfo, targetSc: SkillLayer, generalInfo: GeneralInfo){
        this.skillInfo = skillInfo;
        this.targetSc = targetSc;
        this.generalInfo = generalInfo;

        this.clearUI();

        if(skillInfo){
            this.delBtn.active = true;

            this.iconSpr.spriteFrame = this.targetSc.skillAtlas.getSpriteFrame(skillInfo.skillId.toString());
            this.nameLabel.string = skillInfo.skillCfg.name;
        }else{
            this.addBtn.active = true;

        }
    }

    //添加或删除武将技能
    handleChangeGeneralSkill(skillInfo: SkillInfo, bAdd:boolean){
        if(this.generalInfo){
            if(bAdd == true && this.generalInfo.skills.length < 3){   //添加
                for(let i=0; i<this.generalInfo.skills.length; ++i){
                    if(skillInfo.skillId == this.generalInfo.skills[i].skillId){
                        ROOT_NODE.showTipsText("该武将已经拥有技能"+skillInfo.skillCfg.name);
                        return false;  
                    }
                }

                MyUserMgr.updateUserDiamond(-skillInfo.skillCfg.cost);  //修改用户背包物品列表
                this.generalInfo.skills.push(skillInfo);
            }else if(bAdd == false){    //删除
                for(let i=0; i<this.generalInfo.skills.length; ++i){
                    if(skillInfo.skillId == this.generalInfo.skills[i].skillId){
                        this.generalInfo.skills.splice(i, 1);
                        break;
                    }
                }
            }
            MyUserMgr.updateGeneralList(this.generalInfo);
            return true;
        }
        return false;
    }

    onAddBtn(){
        let skillInfo = this.targetSc.selSkillInfo;
        if(skillInfo && skillInfo.skillCfg){
            if(MyUserData.DiamondCount >= skillInfo.skillCfg.cost){
                let tipsStr = "是否观看视频来来学习技能"+skillInfo.skillCfg.name+", 或者点击取消花费"+skillInfo.skillCfg.cost+"金锭学习技能。";
                ROOT_NODE.showTipsDialog(tipsStr, ()=>{
                    SDKMgr.showVedioAd("JiNengVedioId", ()=>{
                        //失败
                  }, ()=>{
                    this.handelLearnSkill();
                  }); 
                }, ()=>{
                    this.handelLearnSkill();
                });
            }else{
                GameMgr.showGoldAddDialog();  //获取金币提示框
            }
        }
    }

    handelLearnSkill(){
        let skillInfo = this.targetSc.selSkillInfo;
        if(skillInfo && skillInfo.skillCfg){
            let optOK = this.handleChangeGeneralSkill(skillInfo, true);
            if(optOK == true){
                this.initGeneralSkill(skillInfo, this.targetSc, this.generalInfo);

                if(GameMgr.curTaskConf.type == 6){   //任务类型 1 视频剧情 2主城建设 3招募士兵 4组建部曲 5参加战斗 6学习技能 7攻城掠地
                    GameMgr.handleStoryShowOver(GameMgr.curTaskConf);  //任务宣读(第一阶段）完毕处理
                }
            }
        }
    }

    onDelBtn(){
        if(this.skillInfo && this.skillInfo.skillCfg){
            ROOT_NODE.showTipsDialog("是否删除技能"+this.skillInfo.skillCfg.name, ()=>{
                this.handleChangeGeneralSkill(this.skillInfo, false);
                this.initGeneralSkill(null, this.targetSc, this.generalInfo);
            });
        }
    }
}
