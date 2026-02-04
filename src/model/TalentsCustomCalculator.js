import BasicCalculatorModel from '../model/BasicCalculator';
import TalentsCalculatorModel from './TalentsCalculator';
import UniequipCalculatorModel from './UniequipCalculator';

const TalentsCustomCalculatorModel = {
  //目前在幹員基礎數據計算天賦加成時使用了這些key: 
  // max_hp = 提升生命
  // atk = 提升攻擊力
  // def = 提升防禦
  // magic_resistance = 提升法抗
  // base_attack_time = 攻擊間隔調整
  // attack_speed = 攻速調整
  //此處是記錄所有幹員的天賦中包含了以上的key，但是卻不應該帶入幹員基礎數據計算的過濾清單 (後面會標註不能用的理由) 
  talentNotListToBasic: {
    //四星
    '红豆': new Set(['atk']), //概率暴擊
    '清道夫': new Set(['atk','def']), //周圍沒有友方單位，提升攻擊力、防禦力
    '讯使': new Set(['def']), //阻擋兩個以上敵人，提升防禦力
    '猎蜂': new Set(['atk']), //攻擊同個敵人持續疊加攻擊力
    '杜宾': new Set(['atk']), //在場時，三星幹員提升攻擊力        
    '铅踝': new Set(['atk']), //攻擊範圍內存在隱匿單位時提升攻擊力
    '远山': new Set(['max_hp', 'atk', 'attack_speed']), //部屬後隨機三選一BUFF，提升生命、提升攻擊力、提升攻速
    '泡泡': new Set(['atk']), //降低攻擊對象的攻擊力
    '嘉维尔': new Set(['atk','def']), //部屬後15秒內所有醫療幹員提升攻擊力、防禦力
    //五星
    //六星
  },

  //此處是記錄所有會對傷害公式計算造成影響的天賦，並嘗試將這些天賦歸類到傷害公式計算的一個乘區中的自定天賦數據
  talentListToAttackSkill: (type, memberRow, uniequipJsonData, battleEquipJsonData) =>{    
    return {
      //?標記的為較少人使用的屬性，可以只在那些人的object裡宣告該屬性即可 (會順便在旁邊標註有誰使用了這個屬性)
      'default': { 
        attack: "攻擊乘算", 
        atk_scale: "攻擊倍率", 
        def_penetrate_fixed: "削減敵方防禦[比例或固定]", //def_penetrate_fixed的值必須是正數，否則會反過來幫敵方加防禦，絕對值 < 1 以比例計算，絕對值 > 1 以固定計算
        magic_resistance: "削減敵方法抗[比例或固定]", //magic_resistance的值必須是負數，否則會反過來幫敵方加法抗，絕對值 < 1 以比例計算，絕對值 > 1 以固定計算
        damage_scale: "傷害倍率", 
        base_attack_time: "攻擊間隔調整", 
        attack_speed: "攻擊速度調整", 
        ensure_damage: "?保底傷害 (酸糖)" 
      },    

      //'範例模板': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0 },

      //四星
      '骋风': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0 },
      '宴': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'min_attack_speed') },
      '猎蜂': { attack: TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk') * TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'max_stack_cnt'), atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0 },
      '酸糖': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0, ensure_damage: TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk_scale_2') },
      '夜烟': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'magic_resistance'), damage_scale: 0, base_attack_time: 0, attack_speed: 0 },
      '卡达': { attack: 0, atk_scale: 0, def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0 },
      '云迹': { attack: 0, atk_scale: TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk_scale'), def_penetrate_fixed: 0, magic_resistance: 0, damage_scale: 0, base_attack_time: 0, attack_speed: 0 },
    }
  }
}

export default TalentsCustomCalculatorModel;
