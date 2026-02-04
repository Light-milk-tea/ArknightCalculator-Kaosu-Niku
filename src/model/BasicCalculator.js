import UniequipCalculatorModel from './UniequipCalculator';
import TalentsCalculatorModel from './TalentsCalculator';
import CookieModel from './Cookie';

const BasicCalculatorModel = {
  //查詢當前所選流派 (回傳object，key有witchPhases、witchAttributesKeyFrames)
  //witchPhases對應流派的階段，0 = 精零、1 = 精一、2 = 精二
  //witchAttributesKeyFrames對應幹員流派的等級，0 = 1級、1 = 滿級
  type: (type) => {
    let witchPhases = 0;
    let witchAttributesKeyFrames = 0;

    switch(type){
      case '精零1級':
        witchPhases = 0;
        witchAttributesKeyFrames = 0;
      break;
      case '精零滿級':
        witchPhases = 0;
        witchAttributesKeyFrames = 1;
      break;
      case '精一1級':
        witchPhases = 1;
        witchAttributesKeyFrames = 0;
      break;
      case '精一滿級':
        witchPhases = 1;
        witchAttributesKeyFrames = 1;
      break;
      case '精二1級':
        witchPhases = 2;
        witchAttributesKeyFrames = 0;
      break;
      case '精二滿級':
        witchPhases = 2;
        witchAttributesKeyFrames = 1;
      break;
    }

    return { witchPhases: witchPhases, witchAttributesKeyFrames: witchAttributesKeyFrames,};
  },

  //查詢幹員的星級 (回傳number)
  memberRarity: (memberRow) => {
    const rarity = memberRow.rarity;
    switch(rarity){
      case "TIER_1":
        return 1;
      case "TIER_2":
        return 2;
      case "TIER_3":
        return 3;
      case "TIER_4":
        return 4;
      case "TIER_5":
        return 5;
      case "TIER_6":
        return 6;
    }
  },

  //查詢幹員的職業 (回傳object，詳情內容參考profession.json)
  memberProfession: (memberRow, professionJsonData) => {
    const profession = memberRow.profession;
    return professionJsonData[profession];
  },

  //查詢幹員的分支 (回傳object，詳情內容參考subProfessionId.json)
  memberSubProfessionId: (memberRow, subProfessionIdJsonData) => {
    const subProfessionId = memberRow.subProfessionId;
    return subProfessionIdJsonData[subProfessionId];
  },

  //計算幹員的基礎數據在經過各種加成後的最終數據 (回傳object，key對應某個屬性)
  //(maxHp = 生命、atk = 攻擊、def = 防禦、magicResistance = 法抗、baseAttackTime = 攻擊間隔、attackSpeed = 攻速)
  memberNumeric: (type, memberRow, uniequipJsonData, battleEquipJsonData) => {
    //流派
    const witchPhases = BasicCalculatorModel.type(type).witchPhases;
    const witchAttributesKeyFrames = BasicCalculatorModel.type(type).witchAttributesKeyFrames;
    //phases是array型別，對應幹員所有階段，[0] = 精零、[1] = 精一、[2] = 精二
    //phases.attributesKeyFrames是array型別，對應幹員1級與滿級的數據，[0] = 1級、[1] = 滿級
    const maxPhases = memberRow.phases.length; //3星幹員沒有精二，1、2星幹員沒有精一精二，此用於輔助判斷
    //基礎數值
    const basicData = memberRow.phases[witchPhases]?.attributesKeyFrames[witchAttributesKeyFrames]?.data ?? memberRow.phases[maxPhases - 1]?.attributesKeyFrames[1]?.data;
    //生命
    let maxHp = basicData.maxHp; 
    //攻擊
    let atk = basicData.atk; 
    //防禦
    let def = basicData.def; 
    //法抗
    let magicResistance = basicData.magicResistance; 
    //攻擊間隔
    let baseAttackTime = basicData.baseAttackTime; 
    //攻速
    let attackSpeed = basicData.attackSpeed; 

    let log_potential_max_hp = 0;
    let log_potential_atk = 0;
    let log_potential_def = 0;
    let log_potential_magic_resistance = 0;
    let log_potential_attack_speed = 0;
    //潛能數值
    const potentialRanksData = memberRow.potentialRanks;
    potentialRanksData.forEach((element, index) => { 
      //一些幹員沒有辦法提升潛能，需要判斷null
      if(element.buff?.attributes.attributeModifiers[0].attributeType === "MAX_HP"){
        //生命
        log_potential_max_hp = element.buff.attributes.attributeModifiers[0].value;
        maxHp += element.buff.attributes.attributeModifiers[0].value;       
      }
      if(element.buff?.attributes.attributeModifiers[0].attributeType === "ATK"){
        //攻擊
        log_potential_atk = element.buff.attributes.attributeModifiers[0].value;
        atk += element.buff.attributes.attributeModifiers[0].value;
      }     
      if(element.buff?.attributes.attributeModifiers[0].attributeType === "DEF"){
        //防禦
        log_potential_def = element.buff.attributes.attributeModifiers[0].value;
        def += element.buff.attributes.attributeModifiers[0].value;
      } 
      if(element.buff?.attributes.attributeModifiers[0].attributeType === "MAGIC_RESISTANCE"){
        //法抗
        log_potential_magic_resistance = element.buff.attributes.attributeModifiers[0].value;
        magicResistance += element.buff.attributes.attributeModifiers[0].value;
      } 
      if(element.buff?.attributes.attributeModifiers[0].attributeType === "ATTACK_SPEED"){
        //攻速
        log_potential_attack_speed = element.buff.attributes.attributeModifiers[0].value;
        attackSpeed += element.buff.attributes.attributeModifiers[0].value;
      }    
    });

    let log_favor_max_hp = 0;
    let log_favor_atk = 0;
    let log_favor_def = 0;
    let log_favor_magic_resistance = 0;
    //信賴數值
    const favorKeyFrames = memberRow.favorKeyFrames;
    favorKeyFrames.forEach((element, index) => { 
      if(element.level === 50){
        //生命
        log_favor_max_hp = element.data.maxHp;
        maxHp += element.data.maxHp;   
        //攻擊
        log_favor_atk = element.data.atk;
        atk += element.data.atk;    
        //防禦
        log_favor_def = element.data.def;
        def += element.data.def;  
        //法抗
        log_favor_magic_resistance = element.data.magicResistance;
        magicResistance += element.data.magicResistance;
      }  
    });

    let log_equip_max_hp = 0;
    let log_equip_atk = 0;
    let log_equip_def = 0;
    let log_equip_magic_resistance = 0;
    let log_equip_attack_speed = 0;
    //模組數值
    if(witchPhases === 2){
      const equipBattle = UniequipCalculatorModel.memberEquipBattle(memberRow, uniequipJsonData, battleEquipJsonData);
      if(equipBattle){
        for (const attributeBlackboard of equipBattle.attributeBlackboard) {
          if(attributeBlackboard.key === 'max_hp'){
            //生命
            log_equip_max_hp = attributeBlackboard.value;
            maxHp += attributeBlackboard.value;   
          }
          else if(attributeBlackboard.key === 'atk'){
            //攻擊
            log_equip_atk = attributeBlackboard.value;
            atk += attributeBlackboard.value;   
          }
          else if(attributeBlackboard.key === 'def'){
            //防禦
            log_equip_def = attributeBlackboard.value;
            def += attributeBlackboard.value;   
          }
          else if(attributeBlackboard.key === 'magic_resistance'){
            //法抗
            log_equip_magic_resistance = attributeBlackboard.value;
            magicResistance += attributeBlackboard.value;   
          }
          else if(attributeBlackboard.key === 'attack_speed'){
            //攻速
            log_equip_attack_speed = attributeBlackboard.value;
            attackSpeed += attributeBlackboard.value;
          }                                                        
        }
      }
    }

    //天賦數值
    //生命
    maxHp *= (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'max_hp'));
    //攻擊
    atk *= (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk'));
    //防禦
    def *= (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'def'));
    //法抗
    magicResistance += TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'magic_resistance');
    //攻擊間隔
    baseAttackTime += TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'base_attack_time');   
    //攻速
    attackSpeed += TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'attack_speed');        
    
    //打印log
    if(memberRow.name === CookieModel.getCookie('memberName')){
      if(CookieModel.getLog('memberNumeric_check').includes(`${memberRow.equipid}`) === false){
        CookieModel.setLog('memberNumeric', false);
        if(CookieModel.getLog('memberNumeric') === false){     
          CookieModel.setLog('memberNumeric', true);
          CookieModel.getLog('memberNumeric_check').push(`${memberRow.equipid}`); 
          const equipData = UniequipCalculatorModel.memberEquipData(memberRow, uniequipJsonData, memberRow.equipid);
          console.groupCollapsed(`${memberRow.name}【${equipData? equipData.uniEquipName : '無模組'}】的各項加成數據log`);
          console.table(
            {
              "1.": "",
              "基礎生命": basicData.maxHp,
              "基礎攻擊": basicData.atk,
              "基礎防禦": basicData.def,
              "基礎法抗": basicData.magicResistance,
              "基礎攻擊間隔": basicData.baseAttackTime,
              "基礎攻速": basicData.attackSpeed, 
              "2.": "",
              "潛能生命": log_potential_max_hp,
              "潛能攻擊": log_potential_atk,
              "潛能防禦": log_potential_def,
              "潛能法抗": log_potential_magic_resistance,
              "潛能攻速": log_potential_attack_speed,
              "3.": "",
              "信賴生命": log_favor_max_hp,
              "信賴攻擊": log_favor_atk,
              "信賴防禦": log_favor_def,
              "信賴法抗": log_favor_magic_resistance,
              "4.": "",
              "模組生命": log_equip_max_hp,
              "模組攻擊": log_equip_atk,
              "模組防禦": log_equip_def,
              "模組法抗": log_equip_magic_resistance,
              "模組攻速": log_equip_attack_speed,
              "5.": "",
              "天賦生命(比例)": (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'max_hp')),
              "天賦攻擊(比例)": (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'atk')),
              "天賦防禦(比例)": (1 + TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'def')),
              "天賦法抗": TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'magic_resistance'),
              "天賦攻擊間隔": TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'base_attack_time'),
              "天賦攻速": TalentsCalculatorModel.memberTalent(type, memberRow, uniequipJsonData, battleEquipJsonData, 'attack_speed'),
              "6.": "",
              "加成後生命": maxHp,
              "加成後攻擊": atk,
              "加成後防禦": def,
              "加成後法抗": magicResistance,
              "加成後攻擊間隔": baseAttackTime,
              "加成後攻速": attackSpeed,
            }
          );
          console.groupEnd(); 
        }
      }  
    }

    return { maxHp, atk, def, magicResistance, baseAttackTime, attackSpeed};
  },

  //計算敵方的DPS
  enemyDps: (type, memberRow, enemyData, uniequipJsonData, battleEquipJsonData) => {
    //計算平A的DPS
    let dph = 0;
    let dps = 0;      
    const def = BasicCalculatorModel.memberNumeric(type, memberRow, uniequipJsonData, battleEquipJsonData).def
    const magicResistance = BasicCalculatorModel.memberNumeric(type, memberRow, uniequipJsonData, battleEquipJsonData).magicResistance
    switch(enemyData.enemyAttackType){
      case "物傷":
        dph = enemyData.enemyAttack - def;
        dph = dph < enemyData.enemyAttack / 20 ? enemyData.enemyAttack / 20 : dph;
        dps = (dph / enemyData.enemySpd);
      break;
      case "法傷":
        dph = enemyData.enemyAttack * ((100 - magicResistance) / 100);
        dph = dph < enemyData.enemyAttack / 20 ? enemyData.enemyAttack / 20 : dph;
        dps = (dph / enemyData.enemySpd);
      break;
      case "真傷":
        dps = (enemyData.enemyAttack / enemyData.enemySpd);
      break;
      default:
        dps = 0;
      break;
    }   
    //計算技能的DPS
    let skillDph = 0;
    let skillDps = 0;
    let skillDpsTotal = 0;
    if(enemyData.enemySkill.length > 0){
      enemyData.enemySkill.forEach((item) => {
        switch(item.enemySkillType){
          case "物傷":
            skillDph = item.enemySkillDamage - def;
            skillDph = skillDph < item.enemySkillDamage / 20 ? item.enemySkillDamage / 20 : skillDph;
          break;
          case "法傷":
            skillDph = item.enemySkillDamage * ((100 - magicResistance) / 100);
            skillDph = skillDph < item.enemySkillDamage / 20 ? item.enemySkillDamage / 20 : skillDph;    
          break;
          case "真傷":
            skillDph = item.enemySkillDamage;
          break;
          default:
            skillDph = 0;
          break;
        }
        skillDps = ((skillDph * item.enemySkillCount) / item.enemySkillWaitTime);
        skillDpsTotal += skillDps;
      });
    }
    return dps + skillDpsTotal;
  },
}

export default BasicCalculatorModel;
