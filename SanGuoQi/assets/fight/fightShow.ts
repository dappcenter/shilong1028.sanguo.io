import Block from "./block";
import { FightMgr } from "../manager/FightManager";
import Card from "./card";
import { CardInfo, SoliderType, SkillInfo } from "../manager/Enum";
import ShowLabel from "./showLabel";
import BingAni from "../animation/bingAni";
import { GameMgr } from "../manager/GameManager";

//战斗或合成展示层
const {ccclass, property} = cc._decorator;

@ccclass
export default class FightShow extends cc.Component {

    @property(cc.Label)
    leftName: cc.Label = null;
    @property(cc.Label)
    rightName: cc.Label = null;
    @property(cc.Label)
    leftHp: cc.Label = null;
    @property(cc.Label)
    rightHp: cc.Label = null;
    @property(cc.Label)
    leftMp: cc.Label = null;
    @property(cc.Label)
    rightMp: cc.Label = null;
    @property(cc.Label)
    leftAtk: cc.Label = null;
    @property(cc.Label)
    rightAtk: cc.Label = null;
    @property(cc.Label)
    leftDef: cc.Label = null;
    @property(cc.Label)
    rightDef: cc.Label = null;
    @property(cc.Node)
    leftHead: cc.Node = null;
    @property(cc.Node)
    rightHead: cc.Node = null;

    @property(cc.Node)
    leftGenNode: cc.Node = null;
    @property(cc.Node)
    rightGenNode: cc.Node = null;
    @property(cc.Node)
    soldiersNode: cc.Node = null;

    @property(cc.Sprite)
    fightIcon: cc.Sprite = null;
    @property(cc.Label)
    typeLabel: cc.Label = null;
    @property(cc.SpriteFrame)
    hechengIcon: cc.SpriteFrame = null;

    @property(cc.SpriteAtlas)
    attackAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    hechengAtlas: cc.SpriteAtlas = null;

    @property([cc.SpriteAtlas])
    effectAtlas: cc.SpriteAtlas[] = new Array(8);  //攻击升降，防御升降，血量升降，士气升降特效

    @property(cc.Prefab)
    pfCard: cc.Prefab = null;
    @property(cc.Prefab)
    pfTips: cc.Prefab = null;  //提示文本
    @property([cc.Prefab])
    pfBings: cc.Prefab[] = new Array(4);  //骑刀枪弓四种兵种节点

    nShowType: number = 0;   //1合成2战斗
    srcBlock: Block = null;  // 主动方
    destBlock: Block = null;   //被动方(被攻击者或被合成吸收者)
    leftCardInfo: CardInfo = null;
    rightCardInfo: CardInfo = null;

    bLeftUsedSkill: boolean = false;    //一次对战只能使用一次技能
    bRightUsedSkill: boolean = false;

    leftBingArr: BingAni[] = new Array();   //左侧士兵节点集合
    rightBingArr: BingAni[] = new Array();   //右侧士兵节点集合

    tipsArr: any[] = new Array();
    tipTimes: number = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        FightMgr.bStopTouch = true;   //是否停止触摸反应
    }

    start () {

    }

    update (dt) {
        if(this.tipTimes > 0){
            this.tipTimes -= dt;
        }
        if(this.tipsArr.length > 0){
            if(this.tipTimes <= 0){
                this.tipTimes = 0.5;

                let tips = this.tipsArr.shift();
                this.createTips(tips);
            }
        }
    }

    createTips(tips: any){
        let tipNode = cc.instantiate(this.pfTips);
        tipNode.getComponent(ShowLabel).showTips(tips.str, tips.col, cc.v2(0, 80));
        this.node.addChild(tipNode, 100);
    }

    showTipsLable(str: string, col: cc.Color = cc.Color.WHITE){
        cc.log("showTipsLable(), str = "+str);
        this.tipsArr.push({"str":str, "col":col});
    }

    /**显示战斗或合成 
     * @param nType 1合成2战斗
     * @param srcBlock 主动方
     * @param destBlock 被动方(被攻击者或被合成吸收者)
    */
    initFightShowData(nType: number, srcBlock: Block, destBlock: Block){
        this.nShowType = nType;
        this.srcBlock = srcBlock;
        this.destBlock = destBlock;
        this.leftCardInfo = srcBlock.cardInfo.clone();
        this.rightCardInfo = destBlock.cardInfo.clone();
        cc.log("initFightShowData(), this.leftCardInfo = "+JSON.stringify(this.leftCardInfo));
        cc.log("initFightShowData(), this.rightCardInfo = "+JSON.stringify(this.rightCardInfo));

        if(this.nShowType == 1){   //合成
            this.fightIcon.spriteFrame = this.hechengIcon;
            this.typeLabel.string = "合成";
            this.showTipsLable("合成", cc.Color.YELLOW);
        }else if(this.nShowType == 2){   //战斗
            this.typeLabel.string = "战斗";
            this.showTipsLable("战斗", cc.Color.RED);
        }
        
        this.showLeftUI();
        this.showRightUI();
        this.showAniUI();

        this.node.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(function(){
            this.showEffectAni();
        }.bind(this))));
    }

    showAniUI(){
        this.leftGenNode.getComponent(BingAni).changeAniByType(1, 1);  //1站在左侧，面向右侧, 1默认动作，2攻击动作
        this.rightGenNode.getComponent(BingAni).changeAniByType(2, 1);  //1站在左侧，面向右侧, 1默认动作，2攻击动作

        //每个士兵节点标识200兵
        let leftBingCount = Math.ceil((this.leftCardInfo.generalInfo.bingCount-50)/200);
        let rightBingCount = Math.ceil((this.rightCardInfo.generalInfo.bingCount-50)/200);
        let maxCount = Math.max(leftBingCount, rightBingCount);

        let leftOffPosX = 200/(Math.ceil(leftBingCount/3)+1);
        let rightOffPosX = 200/(Math.ceil(rightBingCount/3)+1);
        let posYArr = new Array(65, 0, -65);

        let leftBingPf = this.pfBings[this.leftCardInfo.generalInfo.generalCfg.bingzhong-401];
        let rightBingPf = this.pfBings[this.rightCardInfo.generalInfo.generalCfg.bingzhong-401];

        let yIdx = 0;
        let leftBeginX = -200 + leftOffPosX;
        let rightBeginX = 200 - rightOffPosX;
        for(let i=0; i<maxCount; ++i){
            if(i < leftBingCount){
                let leftBing = cc.instantiate(leftBingPf);
                let leftBingAni = leftBing.getComponent(BingAni);
                leftBingAni.changeAniByType(1, 1); 
                this.leftBingArr.push(leftBingAni);
                
                leftBing.position = cc.v2(leftBeginX, posYArr[yIdx]);
                this.soldiersNode.addChild(leftBing);
            }
            if(i < rightBingCount){
                let rightBing = cc.instantiate(rightBingPf);
                let rightBingAni = rightBing.getComponent(BingAni);
                rightBingAni.changeAniByType(2, 1); 
                this.rightBingArr.push(rightBingAni);

                rightBing.position = cc.v2(rightBeginX, posYArr[yIdx]);
                this.soldiersNode.addChild(rightBing);
            }
            yIdx++;
            if(yIdx > 2){
                yIdx = 0;
                leftBeginX += leftOffPosX;
                rightBeginX -= rightOffPosX;
            }
        }
    }

    showLeftAniUi(optType: number){
        this.leftGenNode.getComponent(BingAni).changeAniByType(1, optType);  //1站在左侧，面向右侧, 1默认动作，2攻击动作
        for(let i=0; i<this.leftBingArr.length; ++i){
            let leftBingAni = this.leftBingArr[i];
            leftBingAni.changeAniByType(1, optType); 
        }
    }

    showRightAniUi(optType: number){
        this.rightGenNode.getComponent(BingAni).changeAniByType(2, optType);  //1站在左侧，面向右侧, 1默认动作，2攻击动作
        for(let i=0; i<this.rightBingArr.length; ++i){
            let rightBingAni = this.rightBingArr[i];
            rightBingAni.changeAniByType(2, optType); 
        }
    }

    updateBingAniCount(posType: number){
        if(posType == 1){  //1站在左侧，面向右侧
            let leftBingCount = Math.ceil((this.leftCardInfo.generalInfo.bingCount-50)/200);
            let off = this.leftBingArr.length - leftBingCount;
            if(off > 0){
                this.leftBingArr.splice(leftBingCount-1, off);
            }
        }else if(posType == 2){
            let rightBingCount = Math.ceil((this.rightCardInfo.generalInfo.bingCount-50)/200);
            let off = this.rightBingArr.length - rightBingCount;
            if(off > 0){
                this.rightBingArr.splice(rightBingCount-1, off);
            }
        }
    }

    showLeftUI(){
        let cardNode_left = this.leftHead.getChildByName("cardNode_left");
        if(cardNode_left == null){
            cardNode_left = cc.instantiate(FightMgr.getFightScene().pfCard);
            cardNode_left.name = "cardNode_left";
            this.leftHead.addChild(cardNode_left);
        }
        cardNode_left.getComponent(Card).setCardData(this.leftCardInfo);

        let cardCfg = this.leftCardInfo.generalInfo.generalCfg;
        this.leftName.string = cardCfg.name;
        this.leftHp.string = "血量：" + cardCfg.hp;
        this.leftMp.string = "智力：" + cardCfg.mp;
        this.leftAtk.string = "攻击：" + cardCfg.atk;
        this.leftDef.string = "防御：" + cardCfg.def;
    }

    showRightUI(){
        let cardNode_right = this.rightHead.getChildByName("cardNode_right");
        if(cardNode_right == null){
            cardNode_right = cc.instantiate(FightMgr.getFightScene().pfCard);
            cardNode_right.name = "cardNode_right";
            this.rightHead.addChild(cardNode_right);
        }
        cardNode_right.getComponent(Card).setCardData(this.rightCardInfo);

        let cardCfg = this.rightCardInfo.generalInfo.generalCfg;
        this.rightName.string = cardCfg.name;
        this.rightHp.string = "血量：" + cardCfg.hp;
        this.rightMp.string = "智力：" + cardCfg.mp;
        this.rightAtk.string = "攻击：" + cardCfg.atk;
        this.rightDef.string = "防御：" + cardCfg.def;
    }


    showFightProgress(attackCardInfo: CardInfo, defendCardInfo: CardInfo, atkArrowTown:number=0, defArrowTown:number=0){
        let atkCardCfg = attackCardInfo.generalInfo.generalCfg;
        let defCardCfg = defendCardInfo.generalInfo.generalCfg;

        if(atkCardCfg.hp <= 0 || defCardCfg.hp <= 0){
            return [attackCardInfo, defendCardInfo];
        }

        this.showTipsLable("开始攻击，攻击方："+atkCardCfg.name+"; 防御方： "+defCardCfg.name);
        let attack = atkCardCfg.atk;
        let defend = defCardCfg.def;

        if(atkCardCfg.bingzhong == SoliderType.gongbing){   //弓兵攻击翻倍
            this.showTipsLable("攻击方为弓兵抛射，攻击力翻倍！", cc.Color.RED);
            attack += atkCardCfg.atk * 0.5;
        }

        //兵种相克，401骑兵克制402刀兵， 402刀兵克制403枪兵，403枪兵克制401骑兵， 404弓兵为不克制兵种
        let restriction = FightMgr.checkBingRestriction(atkCardCfg.bingzhong, defCardCfg.bingzhong);
        if(restriction == 1){
            this.showTipsLable("攻击方兵种克制防御方，攻击方攻击力增加30%！", cc.Color.RED);
            attack += atkCardCfg.atk * 0.3;
        }else if(restriction == -1){
            this.showTipsLable("攻击方兵种被防御方克制，防御方防御力增加30%！", cc.Color.BLUE);
            defend += defCardCfg.def * 0.3;
        }

        //攻击方在箭塔下
        if(atkArrowTown == 1){
            this.showTipsLable("箭塔辅助攻击，攻击方攻击力增加20%！", cc.Color.RED);
            attack += atkCardCfg.atk * 0.2;
        }
        //防御方在城池下
        if(defArrowTown == 2){
            this.showTipsLable("城池辅助防御，防御方防御力增加30%！", cc.Color.BLUE);
            defend += defCardCfg.def * 0.3;
        }

        let atkSoliderCount = attackCardInfo.generalInfo.bingCount;
        // if(atkSoliderCount > 200){
        //     this.showTipsLable("攻击方攻击力随兵力变化！", cc.Color.BLUE);
        //     attack = attack * ((atkSoliderCount*0.8+200)/1000);
        //     attack = parseFloat(attack.toFixed(2)); 
        // }else{
        //     this.showTipsLable("攻击方兵力严重不足，攻击方攻击力骤减！", cc.Color.BLUE);
        //     attack *= 0.2;
        // }

        let defSoldierCount = defendCardInfo.generalInfo.bingCount;
        // if(defSoldierCount > 200){
        //     this.showTipsLable("防御方防御力随兵力变化！", cc.Color.RED);
        //     defend = defend * ((defSoldierCount*0.8+200)/1000);
        //     defend = parseFloat(defend.toFixed(2)); 
        // }else{
        //     this.showTipsLable("防御方兵力严重不足，防御方防御力骤减！", cc.Color.RED);
        //     defend *= 0.2;
        // }
        
        let atkBingScale = atkSoliderCount/(defSoldierCount+1);
        if(atkBingScale > 1.5){
            this.showTipsLable("攻击方兵力远大于防御方，攻击方攻击力提升！", cc.Color.BLUE);
            attack += attack*atkBingScale/2;
        }

        let defBingScale = defSoldierCount/(atkSoliderCount+1);
        if(defBingScale > 1.5){
            this.showTipsLable("防御方兵力远大于攻击方，防御方防御力提升！", cc.Color.RED);
            defend += defend*defBingScale/3;
        }

        attack = attack * (attackCardInfo.shiqi/100);
        defend = defend * (defendCardInfo.shiqi/100);
        this.showTipsLable("攻击方士气"+attackCardInfo.shiqi+" 防御方士气"+defendCardInfo.shiqi, cc.Color.WHITE);

        let harm = Math.floor(attack - defend*0.5)*3;
        let minHarm = attack*0.1;
        minHarm = parseFloat(minHarm.toFixed(2)); 
        if(harm <= minHarm){
            harm = minHarm;
            this.showTipsLable("攻击方太弱，防御方收到伤害："+minHarm, cc.Color.GREEN);
        }else{
            this.showTipsLable("防御方收到伤害："+harm);
        }
        harm = Math.ceil(harm);   //伤害取整

        let generalHarm = Math.ceil(harm/2);
        let soldierHarm = harm - generalHarm;
        cc.log("攻击 "+attack+"; 防御 "+defend+"; 伤害 "+harm+"; 武将伤害 "+generalHarm+"; 士兵伤害 "+soldierHarm);

        let blood = defCardCfg.hp - generalHarm;
        if(blood <= 0){
            blood = 0;
            this.showTipsLable("攻击方击败防御方，防御方武将阵亡！"+defCardCfg.name, cc.Color.GREEN);
        }
        defCardCfg.hp = blood;

        let bingCount = defSoldierCount - soldierHarm;
        if(bingCount <= 0){
            bingCount = 0;
            attackCardInfo.generalInfo.killCount += defSoldierCount;
            this.showTipsLable("攻击方击败防御方，防御方武将麾下无士兵，部曲解散！"+defCardCfg.name, cc.Color.GREEN);
        }else{
            attackCardInfo.generalInfo.killCount += soldierHarm;
        }
        defendCardInfo.generalInfo.bingCount = bingCount;

        return [attackCardInfo, defendCardInfo];
    }

    handleFightSkill(attackCardInfo: CardInfo, defendCardInfo: CardInfo, atkNode: cc.Node, defNode: cc.Node, bLeftIsAtk:boolean){
        let atkCardCfg = attackCardInfo.generalInfo.generalCfg;
        let defCardCfg = defendCardInfo.generalInfo.generalCfg;

        if((bLeftIsAtk == true && this.bLeftUsedSkill == false) || (bLeftIsAtk == false && this.bRightUsedSkill == false)){   //攻击方未使用过技能
            let atkSkills = attackCardInfo.generalInfo.skills;
            if(atkCardCfg.mp >= 20 && atkSkills.length > 0 && Math.random() > 0.7){   //攻击方随机释放技能
                if(bLeftIsAtk == true){
                    this.bLeftUsedSkill = true;
                }else{
                    this.bRightUsedSkill = true;
                }

                let randIdx = Math.floor(Math.random()*(atkSkills.length-0.01));
                let randSkill: SkillInfo = atkSkills[randIdx];
                if(randSkill && randSkill.skillCfg){
                    if(randSkill.skillCfg.atk > 0){
                        atkCardCfg.atk += randSkill.skillCfg.atk;
                        if(atkCardCfg.atk > 100){
                            atkCardCfg.atk = 100;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[0], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，攻击方提升攻击力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.atk < 0){
                        defCardCfg.atk += randSkill.skillCfg.atk;
                        if(defCardCfg.atk < 0){
                            atkCardCfg.atk = 0;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[1], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，防御方降低攻击力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.def > 0){
                        atkCardCfg.def += randSkill.skillCfg.def;
                        if(atkCardCfg.def > 100){
                            atkCardCfg.def = 100;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[2], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，攻击方提升防御力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.def < 0){
                        defCardCfg.def += randSkill.skillCfg.def;
                        if(defCardCfg.def < 0){
                            atkCardCfg.def = 0;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[3], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，防御方降低防御力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.hp > 0){
                        atkCardCfg.hp += randSkill.skillCfg.hp;
                        if(atkCardCfg.hp > 1000){
                            atkCardCfg.hp = 1000;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[4], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，攻击方提升生命值"+randSkill.skillCfg.hp, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.hp < 0){
                        defCardCfg.hp += randSkill.skillCfg.hp;
                        if(defCardCfg.hp < 0){
                            atkCardCfg.hp = 0;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[5], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，防御方降低生命值"+randSkill.skillCfg.hp, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.shiqi > 0){
                        attackCardInfo.shiqi += randSkill.skillCfg.shiqi;
                        if(attackCardInfo.shiqi> 100){
                            attackCardInfo.shiqi = 100;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[6], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，攻击方提升士气"+randSkill.skillCfg.shiqi, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.shiqi < 0){
                        defendCardInfo.shiqi += randSkill.skillCfg.shiqi;
                        if(defendCardInfo.shiqi < 0){
                            defendCardInfo.shiqi = 0;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[7], true);
                        this.showTipsLable("攻击方使用技能"+randSkill.skillCfg.name+"，防御方降低士气"+randSkill.skillCfg.shiqi, cc.Color.YELLOW);
                    }
                }
                atkCardCfg.mp -= 20;
                if(atkCardCfg.mp < 0){
                    atkCardCfg.mp = 0;
                }
            }
        }

        if((bLeftIsAtk == true && this.bRightUsedSkill == false) || (bLeftIsAtk == false && this.bLeftUsedSkill == false)){   //防御方未使用过技能
            let defSkills = defendCardInfo.generalInfo.skills;
            if(defCardCfg.mp >= 20 && defSkills.length > 0 && Math.random() > 0.7){   //防御方随机释放技能
                if(bLeftIsAtk == true){
                    this.bRightUsedSkill = true;
                }else{
                    this.bLeftUsedSkill = true;
                }

                let randIdx = Math.floor(Math.random()*(defSkills.length-0.01));
                let randSkill: SkillInfo = defSkills[randIdx];
                if(randSkill && randSkill.skillCfg){
                    if(randSkill.skillCfg.atk > 0){
                        defCardCfg.atk += randSkill.skillCfg.atk;
                        if(defCardCfg.atk > 100){
                            defCardCfg.atk = 100;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[0], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，防御方提升攻击力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.atk < 0){
                        atkCardCfg.atk += randSkill.skillCfg.atk;
                        if(atkCardCfg.atk < 0){
                            atkCardCfg.atk = 0;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[1], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，攻击方降低攻击力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.def > 0){
                        defCardCfg.def += randSkill.skillCfg.def;
                        if(defCardCfg.def > 100){
                            defCardCfg.def = 100;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[2], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，防御方提升防御力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.def < 0){
                        atkCardCfg.def += randSkill.skillCfg.def;
                        if(atkCardCfg.def < 0){
                            atkCardCfg.def = 0;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[3], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，攻击方降低防御力"+randSkill.skillCfg.atk, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.hp > 0){
                        defCardCfg.hp += randSkill.skillCfg.hp;
                        if(defCardCfg.hp > 1000){
                            defCardCfg.hp = 1000;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[4], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，防御方提升生命值"+randSkill.skillCfg.hp, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.hp < 0){
                        atkCardCfg.hp += randSkill.skillCfg.hp;
                        if(atkCardCfg.hp < 0){
                            atkCardCfg.hp = 0;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[5], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，攻击方降低生命值"+randSkill.skillCfg.hp, cc.Color.YELLOW);
                    }
                    else if(randSkill.skillCfg.shiqi > 0){
                        defendCardInfo.shiqi += randSkill.skillCfg.shiqi;
                        if(defendCardInfo.shiqi < 0){
                            defendCardInfo.shiqi = 0;
                        }
                        FightMgr.showFramesAniAndRemove(defNode, cc.v2(0, 0), this.effectAtlas[6], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，防御方提升士气"+randSkill.skillCfg.shiqi, cc.Color.YELLOW);
                    }else if(randSkill.skillCfg.shiqi < 0){
                        attackCardInfo.shiqi += randSkill.skillCfg.shiqi;
                        if(attackCardInfo.shiqi < 0){
                            attackCardInfo.shiqi = 0;
                        }
                        FightMgr.showFramesAniAndRemove(atkNode, cc.v2(0, 0), this.effectAtlas[7], true);
                        this.showTipsLable("防御方使用技能"+randSkill.skillCfg.name+"，攻击方降低士气"+randSkill.skillCfg.shiqi, cc.Color.YELLOW);
                    }
                }
                defCardCfg.mp -= 20;
                if(defCardCfg.mp < 0){
                    defCardCfg.mp = 0;
                }
            }
        }

        return [attackCardInfo, defendCardInfo];
    }

    showEffectAni(){
        let effectAtlas = null;
        if(this.nShowType == 1){   //合成
            effectAtlas = this.hechengAtlas;
        }else if(this.nShowType == 2){   //战斗
            effectAtlas = this.attackAtlas;
        }
        let effNode = FightMgr.showFramesAniAndRemove(this.node, cc.v2(0, 0), effectAtlas, false);
        let stepDelay = 0.5;

        let rightCardCfg = this.rightCardInfo.generalInfo.generalCfg;
        let leftCardCfg = this.leftCardInfo.generalInfo.generalCfg;

        ////////////////////////// 战斗 ////////////////////////////////////////
        if(this.nShowType == 2){
            this.node.runAction(cc.sequence(
                cc.repeat(cc.sequence(cc.delayTime(stepDelay), cc.callFunc(function(){
                    //攻击方技能进攻
                    let skillAtt = this.handleFightSkill(this.leftCardInfo, this.rightCardInfo, this.leftGenNode, this.rightGenNode, true);
                    this.leftCardInfo = skillAtt[0];
                    this.rightCardInfo = skillAtt[1];
                    //攻击方物理进攻
                    this.showLeftAniUi(2);
                    this.showRightAniUi(1);
                    let arr = this.showFightProgress(this.leftCardInfo, this.rightCardInfo, this.srcBlock.ArrowOrTown, this.destBlock.ArrowOrTown);
                    this.leftCardInfo = arr[0];
                    this.rightCardInfo = arr[1];
                    this.showLeftUI();
                    this.showRightUI();
                    this.updateBingAniCount(2);
                }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                    //防御方技能反击
                    let skillAtt = this.handleFightSkill(this.rightCardInfo, this.leftCardInfo, this.rightGenNode, this.leftGenNode, false);
                    this.rightCardInfo = skillAtt[0];
                    this.leftCardInfo = skillAtt[1];
                    //防御方物理反击
                    this.showLeftAniUi(1);
                    let bDefenderAtk: boolean = true;   //防御方反击
                    if(this.leftCardInfo.generalInfo.generalCfg.bingzhong == SoliderType.gongbing){   //弓兵攻击两格
                        if(this.rightCardInfo.generalInfo.generalCfg.bingzhong != SoliderType.gongbing){ 
                            let defPos = this.srcBlock.node.position;
                            let atkPos = this.destBlock.node.position;
                            if(defPos.sub(atkPos).mag() >= 250 ){
                                bDefenderAtk = false;  //两格且防御非弓兵
                            }
                        }
                    }
                    if(bDefenderAtk == true){
                        this.showRightAniUi(2);
                        let arr = this.showFightProgress(this.rightCardInfo, this.leftCardInfo, this.srcBlock.ArrowOrTown, this.destBlock.ArrowOrTown);
                        this.rightCardInfo = arr[0];
                        this.leftCardInfo = arr[1];
                        this.showLeftUI();
                        this.showRightUI();
                        this.updateBingAniCount(1);
                    }
                }.bind(this))), 3), 
            cc.delayTime(stepDelay), cc.callFunc(function(){
                this.showLeftAniUi(1);
                this.showRightAniUi(1);
                effNode.removeFromParent(true);
                cc.log("fightEnd(), this.leftCardInfo = "+JSON.stringify(this.leftCardInfo));
                cc.log("fightEnd(), this.rightCardInfo = "+JSON.stringify(this.rightCardInfo));
                
                if(rightCardCfg.hp <= 0 || this.rightCardInfo.generalInfo.bingCount <= 0){
                    if(this.rightCardInfo.campId == FightMgr.myCampId){
                        FightMgr.getFightScene().addMyDeadCard(this.rightCardInfo);   //添加我方武将战死数据
                        FightMgr.getFightScene().handelShiqiChangeByDead(true, this.srcBlock);  
                    }else{
                        FightMgr.getFightScene().handelShiqiChangeByDead(false, this.srcBlock);  //当敌对方武将死亡时的士气变动
                    }

                    if(leftCardCfg.bingzhong == SoliderType.gongbing){  //弓兵攻击后不移动位置
                        this.srcBlock.showBlockCard(this.leftCardInfo);  //设置地块上的卡牌模型

                        if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                            FightMgr.getFightScene().setMyOpenBlock(false, this.destBlock);   //设置我方已经开启的卡牌
                        }else{
                            FightMgr.getFightScene().setEnemyOpenBlock(false, this.destBlock);   //设置敌方已经开启的卡牌
                        }

                        this.destBlock.onRemoveCardNode();   //将本地块上的卡牌移走了
                    }else{
                        if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                            FightMgr.getFightScene().setMyOpenBlock(false, this.destBlock);   //设置我方已经开启的卡牌
                        }else{
                            FightMgr.getFightScene().setEnemyOpenBlock(false, this.destBlock);   //设置敌方已经开启的卡牌
                        }
                        if(this.srcBlock.cardInfo.campId == FightMgr.myCampId){
                            FightMgr.getFightScene().setMyOpenBlock(false, this.srcBlock);   //设置我方已经开启的卡牌
                        }else{
                            FightMgr.getFightScene().setEnemyOpenBlock(false, this.srcBlock);   //设置敌方已经开启的卡牌
                        }

                        this.destBlock.showBlockCard(this.leftCardInfo);  //设置地块上的卡牌模型
                        this.srcBlock.onRemoveCardNode();   //将本地块上的卡牌移走了

                        if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                            FightMgr.getFightScene().setMyOpenBlock(true, this.destBlock);   //设置我方已经开启的卡牌
                        }else{
                            FightMgr.getFightScene().setEnemyOpenBlock(true, this.destBlock);   //设置敌方已经开启的卡牌
                        }
                    }
                }else if(leftCardCfg.hp <= 0  || this.leftCardInfo.generalInfo.bingCount <= 0){
                    if(this.leftCardInfo.campId == FightMgr.myCampId){
                        FightMgr.getFightScene().addMyDeadCard(this.leftCardInfo);   //添加我方武将战死数据
                        FightMgr.getFightScene().handelShiqiChangeByDead(true, this.destBlock);  
                    }else{
                        FightMgr.getFightScene().handelShiqiChangeByDead(false, this.destBlock);  //当敌对方武将死亡时的士气变动
                    }

                    if(this.srcBlock.cardInfo.campId == FightMgr.myCampId){
                        FightMgr.getFightScene().setMyOpenBlock(false, this.srcBlock);   //设置我方已经开启的卡牌
                    }else{
                        FightMgr.getFightScene().setEnemyOpenBlock(false, this.srcBlock);   //设置敌方已经开启的卡牌
                    }

                    this.srcBlock.onRemoveCardNode();   //将本地块上的卡牌移走了
                    this.destBlock.showBlockCard(this.rightCardInfo);  //设置地块上的卡牌模型
                }else{
                    this.srcBlock.showBlockCard(this.leftCardInfo);  //设置地块上的卡牌模型
                    this.destBlock.showBlockCard(this.rightCardInfo);  //设置地块上的卡牌模型
                }
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                this.node.removeFromParent(true);
                FightMgr.nextRoundOpt();  //下回合处理
            }.bind(this))))
        }
        ///////////////////////////////////合成////////////////////////////
        //合成之后，血量直接叠加，兵力按照兵种叠加（有损失），智力折中叠加，攻击折中叠加，防御折中叠加，
        else if(this.nShowType == 1){  
            this.node.runAction(cc.sequence(cc.delayTime(stepDelay), cc.callFunc(function(){
                let newVal = leftCardCfg.hp + rightCardCfg.hp;
                if(leftCardCfg.bingzhong == rightCardCfg.bingzhong){
                    this.showTipsLable("兵种相同，合成新血量为血量总和！", cc.Color.GREEN);
                }else{
                    newVal = Math.floor(newVal * 0.8);
                    this.showTipsLable("兵种不同，合成新血量为双方血量总和的80%！", cc.Color.GREEN);
                }
                if(newVal > 1000){
                    newVal = 1000;
                }
                leftCardCfg.hp = newVal;
                this.leftHp.string = "血量："+newVal;
                this.rightHp.string = "血量：0";
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                let totalVal = leftCardCfg.mp + rightCardCfg.mp;
                let newVal = Math.floor(totalVal/2);
                if(leftCardCfg.mp >= rightCardCfg.mp * 1.2){
                    newVal = Math.floor(newVal*1.5);
                    this.showTipsLable("卡牌智力较高，合成新智力为双方智力折中后的1.5倍！", cc.Color.YELLOW);
                }else{
                    this.showTipsLable("卡牌智力一般，合成新智力为双方智力折中！", cc.Color.YELLOW);
                }
                if(newVal > 100){
                    newVal = 100;
                }
                leftCardCfg.mp = newVal;
                this.leftMp.string = "智力："+newVal;
                this.rightMp.string = "智力：0";
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                let totalVal = leftCardCfg.atk + rightCardCfg.atk;
                let newVal = Math.floor(totalVal/2);
                if(leftCardCfg.bingzhong == rightCardCfg.bingzhong){
                    newVal = Math.floor(newVal*1.5);
                    this.showTipsLable("兵种相同，合成新攻击为双方攻击折中后的1.5倍！", cc.Color.RED);
                }else{
                    this.showTipsLable("兵种不同，合成新攻击为双方攻击折中值！", cc.Color.RED);
                }
                if(newVal > 100){
                    newVal = 100;
                }
                leftCardCfg.atk = newVal;
                this.leftAtk.string = "攻击："+newVal;
                this.rightAtk.string = "攻击：0";
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                let totalVal = leftCardCfg.def + rightCardCfg.def;
                let newVal = Math.floor(totalVal/2);
                if(leftCardCfg.bingzhong != rightCardCfg.bingzhong){
                    newVal = Math.floor(newVal*1.6);
                    this.showTipsLable("兵种互补，合成新防御为双方防御折中后的1.6倍！", cc.Color.BLUE);
                }else{
                    newVal = Math.floor(newVal*1.2);
                    this.showTipsLable("兵种相同，合成新防御为双方防御折中后的1.2倍！", cc.Color.BLUE);
                }
                if(newVal > 100){
                    newVal = 100;
                }
                leftCardCfg.def = newVal;
                this.leftDef.string = "防御："+newVal;
                this.rightDef.string = "防御：0";
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                let totalVal = this.leftCardInfo.generalInfo.bingCount + this.rightCardInfo.generalInfo.bingCount;
                let newVal = Math.floor(totalVal/2);
                if(leftCardCfg.bingzhong == rightCardCfg.bingzhong){
                    newVal = Math.floor(newVal*1.5);
                    this.showTipsLable("兵种相同，合成新兵力为双方兵力折中后的1.5倍！", cc.Color.BLUE);
                }else{
                    newVal = Math.floor(newVal*1.2);
                    this.showTipsLable("兵种不同，合成新兵力为双方兵力折中后后的1.2倍！", cc.Color.BLUE);
                }
                let bingMax = GameMgr.getMaxBingCountByLv(this.leftCardInfo.generalInfo.generalLv);
                if(newVal > bingMax){
                    newVal = bingMax;
                }
                this.leftCardInfo.generalInfo.bingCount = newVal;
                this.rightCardInfo.generalInfo.bingCount = 0;

                cc.log("合成后的卡牌 this.leftCardInfo = "+JSON.stringify(this.leftCardInfo));
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                effNode.removeFromParent(true);

                if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                    FightMgr.getFightScene().setMyOpenBlock(false, this.destBlock);   //设置我方已经开启的卡牌
                }else{
                    FightMgr.getFightScene().setEnemyOpenBlock(false, this.destBlock);   //设置敌方已经开启的卡牌
                }
                if(this.srcBlock.cardInfo.campId == FightMgr.myCampId){
                    FightMgr.getFightScene().setMyOpenBlock(false, this.srcBlock);   //设置我方已经开启的卡牌
                }else{
                    FightMgr.getFightScene().setEnemyOpenBlock(false, this.srcBlock);   //设置敌方已经开启的卡牌
                }

                if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                    FightMgr.getFightScene().addMyDeadCard(this.rightCardInfo);   //添加我方武将战死数据
                }

                this.destBlock.showBlockCard(this.leftCardInfo);  //设置地块上的卡牌模型
                this.srcBlock.onRemoveCardNode();   //将本地块上的卡牌移走了

                if(this.destBlock.cardInfo.campId == FightMgr.myCampId){
                    FightMgr.getFightScene().setMyOpenBlock(true, this.destBlock);   //设置我方已经开启的卡牌
                }else{
                    FightMgr.getFightScene().setEnemyOpenBlock(true, this.destBlock);   //设置敌方已经开启的卡牌
                }
            }.bind(this)), cc.delayTime(stepDelay), cc.callFunc(function(){
                this.node.removeFromParent(true);
                FightMgr.nextRoundOpt();  //下回合处理
            }.bind(this))))
        }
    }


}
