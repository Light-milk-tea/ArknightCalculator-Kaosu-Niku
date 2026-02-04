import BasicCalculatorModel from '../model/BasicCalculator';
import SkillCalculatorModel from './SkillCalculator';
import TalentsCalculatorModel from './TalentsCalculator';

const SkillCustomCalculatorModel = {
  //目前在傷害算法計算時使用了這些key: 
  //CHANGE_attackType = 傷害類型轉換 ('物理')('法術')('治療')('不攻擊')  
  // atk = 攻擊乘算
  // atk_scale = 攻擊倍率  
  // damage_scale = 傷害倍率
  // def = 削減敵方防禦
  // def_penetrate_fixed = 無視防禦
  // magic_resistance = 削減敵方法抗
  // base_attack_time = 攻擊間隔調整
  // attack_speed = 攻速調整
  // ATTACK_COUNT = 連擊數
  // times = 攻擊段數
  // attack@trigger_time = 彈藥數量
  // CHANGE_OTHER_attackType = 額外傷害的傷害類型轉換 ('物理')('法術')('治療')('不攻擊')
  // OTHER_atk_scale = 額外傷害的攻擊倍率，絕對值 < 10 以比例計算，絕對值 > 10 以固定計算
  // OTHER_base_attack_time = 額外傷害的攻擊間隔 (value會直接覆蓋原攻擊間隔)
  // CHANGE_duration = 技能持續時間調整
  //此處是記錄所有幹員的技能中包含了以上的key，但是卻不應該帶入傷害公式計算的過濾清單 (後面會標註不能用的理由) 
  skillNotListToBasic: {
    //四星
    '石英-全力相搏': new Set(['damage_scale']), //此技能的效果是自身受到的伤害提升    
    '猎蜂-急速拳': new Set(['base_attack_time']), //傷害公式的攻擊間隔調整的算法是(攻擊間隔 + base_attack_time)，而此技能的效果卻是(攻擊間隔 + 攻擊間隔 * base_attack_time)，無法用於傷害公式計算
    '断罪者-断罪': new Set(['atk_scale']), //原本的atk_scale是默認傷害，改成計算暴擊傷害
    '深靛-灯塔守卫者': new Set(['base_attack_time']), //傷害公式的攻擊間隔調整的算法是(攻擊間隔 + base_attack_time)，而此技能的效果卻是(攻擊間隔 + 攻擊間隔 * base_attack_time)，無法用於傷害公式計算
    '深靛-光影迷宫': new Set(['base_attack_time']), //傷害公式的攻擊間隔調整的算法是(攻擊間隔 + base_attack_time)，而此技能的效果卻是(攻擊間隔 * base_attack_time)，無法用於傷害公式計算
    '深海色-光影之触': new Set(['atk']), //攻擊乘算只有給觸手，深海色本人沒有

    //五星
    //六星
  },

  //此處是記錄所有沒有包含在傷害公式計算中的key，並嘗試將這些key歸類到傷害公式計算中的一個已有key的自定技能數據
  skillListToAttackSkill: (type, skillrow, memberRow, uniequipJsonData, battleEquipJsonData) => {
    return {
      //四星
      '骋风-以攻为守': { 
        'CHANGE_OTHER_attackType': '物理',
        'OTHER_atk_scale': TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk_scale'), //天賦的造成額外傷害
      },
      '骋风-招无虚发': { 
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@atk_scale'),
        'CHANGE_OTHER_attackType': '物理',
        'OTHER_atk_scale': TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk_scale'), //天賦的造成額外傷害
      },          
      '休谟斯-高效处理': { 'atk': SkillCalculatorModel.skillAttribute(type, skillrow, 'humus_s_2[peak_2].peak_performance.atk') },       
      '石英-全力相搏': { 'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@s2_atk_scale') }, 
      '芳汀-小玩笑': { 
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@atk_scale'),
        'ATTACK_COUNT': 2,
      },
      '芳汀-致命恶作剧': { 
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@atk_scale'),
        'CHANGE_attackType': '法術',
      },
      '宴-落地斩·破门': { 
        'CHANGE_attackType': '法術',
        'CHANGE_duration': SkillCalculatorModel.skillAttribute(type, skillrow, 'duration'),
      },
      '猎蜂-急速拳': { 'base_attack_time': 0.78 * SkillCalculatorModel.skillAttribute(type, skillrow, 'base_attack_time') }, //猎蜂的原攻擊間隔是0.78
      '杰克-全神贯注！': { 'CHANGE_attackType': '不攻擊' },
      '断罪者-断罪': { 'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'atk_scale_fake') },  
      '断罪者-创世纪': { 
        'CHANGE_attackType': '法術',
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'success.atk_scale'),
      },
      '跃跃-乐趣加倍': { 'ATTACK_COUNT': SkillCalculatorModel.skillAttribute(type, skillrow, 'cnt') },
      '铅踝-破虹': { 'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@s2c.atk_scale') },  
      '酸糖-扳机时刻': { 'ATTACK_COUNT': 2 },
      '松果-电能过载': { 'atk': SkillCalculatorModel.skillAttribute(type, skillrow, 'pinecn_s_2[d].atk') }, 
      '白雪-凝武': { 
        'CHANGE_OTHER_attackType': '法術',
        'OTHER_atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@atk_scale'), //手裏劍的造成額外傷害
        'OTHER_base_attack_time': 1,        
      },         
      '深靛-灯塔守卫者': { 
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'attack@atk_scale'),
        'base_attack_time': 3 * SkillCalculatorModel.skillAttribute(type, skillrow, 'base_attack_time'), //深靛的原攻擊間隔是3
      }, 
      '深靛-光影迷宫': { 
        'base_attack_time': 3 * (-1 + SkillCalculatorModel.skillAttribute(type, skillrow, 'base_attack_time')), //深靛的原攻擊間隔是3
        'CHANGE_OTHER_attackType': '法術',
        'OTHER_atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'indigo_s_2[damage].atk_scale'), //束縛的造成額外傷害
        'OTHER_base_attack_time': SkillCalculatorModel.skillAttribute(type, skillrow, 'indigo_s_2[damage].interval'),   
      },
      '波登可-花香疗法': { 'CHANGE_attackType': '治療' },
      '波登可-孢子扩散': { 'base_attack_time': -0.9 }, //此技能是每秒造成傷害，而波登可的原攻擊間隔是1.9 
      '地灵-流沙化': { 'CHANGE_attackType': '不攻擊' },
      '罗比菈塔-全自动造型仪': { 'CHANGE_attackType': '不攻擊' },
      '古米-食粮烹制': { 'CHANGE_attackType': '治療' },
      '蛇屠箱-壳状防御': { 'CHANGE_attackType': '不攻擊' },
      '泡泡-“挨打”': { 'CHANGE_attackType': '不攻擊' },
      '露托-强磁防卫': { 
        'CHANGE_attackType': '法術',
        'atk_scale': SkillCalculatorModel.skillAttribute(type, skillrow, 'magic_atk_scale'),
        'base_attack_time': 0.4, //此技能是每2秒造成傷害，而露托的原攻擊間隔是1.6
      },   
      '孑-断螯': { 'CHANGE_duration': 2 },
      '孑-刺身拼盘': { 'CHANGE_duration': 2 },
    }    
  }
}

export default SkillCustomCalculatorModel;
