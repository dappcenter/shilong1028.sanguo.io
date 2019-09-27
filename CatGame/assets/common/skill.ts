import { SkillInfo } from "../manager/Enum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Skill extends cc.Component {

    @property(cc.Sprite)
    iconSpr: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    lvLabel: cc.Label = null;
    @property(cc.Label)
    tipLabel: cc.Label = null;

    @property(cc.SpriteAtlas)
    iconAtlas: cc.SpriteAtlas = null;

    // LIFE-CYCLE CALLBACKS:
    skillInfo: SkillInfo = null;

    onLoad () {
        this.iconSpr.spriteFrame = null;
        this.nameLabel.string = "";
        this.lvLabel.string = "Lv";
        this.tipLabel.string = "";
    }

    start () {

    }

    // update (dt) {}

    initSkillByData(skillInfo: SkillInfo){
        this.skillInfo = skillInfo;
        this.iconSpr.spriteFrame = this.iconAtlas.getSpriteFrame(skillInfo.skillId.toString());
        this.nameLabel.string = skillInfo.skillCfg.name;
        this.lvLabel.string = "Lv"+skillInfo.skillLv;
        if(skillInfo.skillPlayerId > 0){
            this.tipLabel.string = "已装配";
        }else{
            if(this.skillInfo.skillLv > 0){
                this.tipLabel.string = "";
            }else{
                this.tipLabel.string = "未拥有";
            }
        }
    }
}