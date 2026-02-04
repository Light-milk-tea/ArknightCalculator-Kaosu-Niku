import BasicCalculatorModel from '../model/BasicCalculator';
import SkillCustomCalculatorModel from './SkillCustomCalculator';
import CookieModel from './Cookie';

//模組更新進度: 死芒-未处理的遗产
//模組上線時間查詢: https://prts.wiki/w/%E5%B9%B2%E5%91%98%E6%A8%A1%E7%BB%84%E4%B8%80%E8%A7%88/%E4%B8%8A%E7%BA%BF%E6%97%B6%E9%97%B4
const UniequipCalculatorModel = {
  //查詢幹員擁有的所有模組的ID (回傳string array，詳細內容參考uniequip_table.json的charEquip)
  memberEquipID: (memberData, uniequipJsonData) => {
    //幹員數據的potentialItemId的格式是: p_char_[數字]_[英文名稱]
    //模組數據的ID的格式是: char_[數字]_[英文名稱]
    //因此在比對id查詢之前，先刪除前面的p_兩字    
    const memberId = memberData.potentialItemId?.substring(2);
    const currentCharEquip = uniequipJsonData.charEquip[memberId];
    //若無任何模組會回傳undefind
    return currentCharEquip;
  },

  //依照模組ID查詢幹員特定模組的資訊 (回傳object，詳細內容參考uniequip_table.json的equipDict)
  memberEquipData: (memberData, uniequipJsonData, customEquipid = null) => {
  let currentEquipData = undefined;

  const memberEquipID = UniequipCalculatorModel.memberEquipID(memberData, uniequipJsonData);
    if(memberEquipID){
      for (const id of memberEquipID) {
        if(memberData.equipid === id){ 
          currentEquipData = uniequipJsonData.equipDict[id];         
        }
      }

      if(customEquipid){
        //如果因為一些原因，參數memberData沒有辦法傳遞模組ID，替代方案於第三個參數手動添加模組ID以供查詢
        currentEquipData = uniequipJsonData.equipDict[customEquipid];   
      }
    }
    return currentEquipData;
  },

  //依照模組ID查詢幹員特定模組的實際數據 (object，詳細內容參考battle_equip_table.json)
  memberEquipBattle: (memberData, uniequipJsonData, battleEquipJsonData, customEquipid = null) => {
  let currentEquipBattle = undefined;
  let logObject = {};
  let log_equipid;
  let logCount_attributeBlackboard = 1;
  let logCount_blackboard = 1;
  let logCount_blackboard2 = 1;

  const memberEquipID = UniequipCalculatorModel.memberEquipID(memberData, uniequipJsonData);
    if(memberEquipID){
      for (const id of memberEquipID) {
        if(memberData.equipid === id){
          //模組基本上會有3個升級階段，但只需要取最高階段的來做數值計算
          currentEquipBattle = battleEquipJsonData[id].phases[battleEquipJsonData[id].phases.length - 1];
          log_equipid = memberData.equipid;
        }
      }

      if(customEquipid){
        //如果因為一些原因，參數memberData沒有辦法傳遞模組ID，替代方案於第三個參數手動添加模組ID以供查詢
        currentEquipBattle = battleEquipJsonData[customEquipid].phases[battleEquipJsonData[customEquipid].phases.length - 1];
        log_equipid = customEquipid;
      }

      if(currentEquipBattle){
        //log獲取基礎數值提升
        logObject['0.0. 模組ID'] = customEquipid ?? memberData.equipid;
        logObject['1.0. 基礎數值提升'] = '';
        for (const attributeBlackboard of currentEquipBattle.attributeBlackboard){
          logObject[`1.${logCount_attributeBlackboard}. ${attributeBlackboard.key}`] = attributeBlackboard.value;
          logCount_attributeBlackboard += 1;
        }

        //log獲取特性追加
        const partsObject = currentEquipBattle.parts.find(obj => 
          obj.overrideTraitDataBundle && obj.overrideTraitDataBundle.candidates !== null
        );
        const candidatesObject = partsObject.overrideTraitDataBundle.candidates[partsObject.overrideTraitDataBundle.candidates.length - 1];
        logObject['2.0. 特性追加描述'] = candidatesObject.additionalDescription;
        for (const blackboard of candidatesObject.blackboard){
          logObject[`2.${logCount_blackboard}. ${blackboard.key}`] = blackboard.value;
          logCount_blackboard += 1;
        }

        //log獲取天賦更新
        const partsObject2 = currentEquipBattle.parts.find(obj => 
          obj.addOrOverrideTalentDataBundle && obj.addOrOverrideTalentDataBundle.candidates !== null
        );
        const candidatesObject2 = partsObject2.addOrOverrideTalentDataBundle.candidates[partsObject2.addOrOverrideTalentDataBundle.candidates.length - 1];
        logObject['3.0. 天賦更新描述'] = candidatesObject2.upgradeDescription;
        for (const blackboard of candidatesObject2.blackboard){
          logObject[`3.${logCount_blackboard2}. ${blackboard.key}`] = blackboard.value;
          logCount_blackboard2 += 1;
        }    
        
        //打印log 
        if(memberData.name === CookieModel.getCookie('memberName')){  
          if(CookieModel.getLog('memberEquip_check').includes(log_equipid) === false){
            CookieModel.setLog('memberEquip', false);
            if(CookieModel.getLog('memberEquip') === false){
              CookieModel.setLog('memberEquip', true); 
              CookieModel.getLog('memberEquip_check').push(log_equipid);

              const equipData = UniequipCalculatorModel.memberEquipData(memberData, uniequipJsonData, log_equipid);
              console.groupCollapsed(`${memberData.name}【${equipData.uniEquipName}】的模組加成數據log`);
              console.table(
                logObject
              );
              console.groupEnd(); 
            }
          }
        }

      }
    }
    return currentEquipBattle;
  },

  //依照模組ID和指定key名嘗試查詢幹員特定模組的分支特性追加，並回傳此分支特性追加的加成值 (若查詢不到則根據情況回傳1、0、undefind)
  memberEquipTrait: (equipid, memberData, uniequipJsonData, battleEquipJsonData, witchPhases, candidates_check, subProfession, attributeKey) => {
    if(witchPhases === 2){
      //開啟模組的分支特性追加
      const memberEquipBattle = UniequipCalculatorModel.memberEquipBattle(memberData, uniequipJsonData, battleEquipJsonData, equipid);
      let blackboardList;
      //獲取模組的特性追加的數值提升數據陣列
      if(memberEquipBattle){
        const partsObject = memberEquipBattle.parts.find(obj => 
          obj.overrideTraitDataBundle && obj.overrideTraitDataBundle.candidates !== null
        );
        blackboardList = partsObject.overrideTraitDataBundle.candidates[partsObject.overrideTraitDataBundle.candidates.length - 1].blackboard;
      }

      //無條件的分支特性追加
        switch(attributeKey){
          //攻擊乘算
          case 'atk': 
            switch(subProfession){
              case '解放者': //解放者的磨刀疊攻擊力 (還未有相關模組)                    
              return 2;
            }
          break;
          //攻擊倍率
          case 'atk_scale': 
            switch(subProfession){
              case '獵手': //獵手的攻擊消耗子彈並提升攻擊倍率 (還未有相關模組)                 
              return 1.2;
              case '散射手': //散射手X模的攻擊前方一橫排的敵人時提升更高攻擊倍率               
              return blackboardList?.find(item => item.key === 'atk_scale')?.value ?? 1.5;
            }
          break;
          //傷害倍率
          case 'damage_scale': 
            switch(subProfession){
              case '劍豪': //劍豪X模的提升造成傷害                 
              return blackboardList?.find(item => item.key === 'damage_scale')?.value ?? 1;
            }
          break;
          //無視防禦
          case 'def_penetrate_fixed': 
            switch(subProfession){
              case '劍豪': //劍豪Y模的無視防禦
              case '炮手': //炮手Y模的無視防禦               
              return blackboardList?.find(item => item.key === 'def_penetrate_fixed')?.value ?? 0;
            }
          break;
          //無視防禦
          case 'magic_resist_penetrate_fixed': 
            switch(subProfession){
              case '中堅術師': //中堅術師X模的無視法抗            
              return blackboardList?.find(item => item.key === 'magic_resist_penetrate_fixed')?.value ?? 0;
            }
          break;
          //攻速調整
          case 'attack_speed': 
            switch(subProfession){
              case '要塞': //要塞Y模的提升攻擊速度 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)            
              return blackboardList?.find(item => item.key === 'attack_speed')?.value ?? 0;
            }
          break;
          //額外傷害的攻擊倍率
          case 'other2_attack_scale': 
            switch(subProfession){
              case '御械術師': //御械術師Y模的浮游單元傷害上限提升            
              return blackboardList?.find(item => item.key === 'max_atk_scale')?.value ?? 1.1;
              case '投擲手': //投擲手X模的造成二次額外傷害            
              return blackboardList?.find(item => item.key === 'attack@append_atk_scale')?.value ?? 0.5;
              case '領主': //領主X模的造成額外法傷            
              return blackboardList?.find(item => item.key === 'atk_scale_m')?.value ?? 0;
            }
          break;
          //額外傷害的傷害類型
          case 'other2_attack_type': 
            switch(subProfession){
              case '御械術師': //御械術師Y模的浮游單元傷害上限提升            
              return '法術';
              case '投擲手': //投擲手X模的造成二次額外傷害            
              return '物理';
              case '領主': //領主X模的造成額外法傷            
              return '法術';
            }
          break;
          //額外傷害的傷害類型
          case 'enable_third_attack': 
            switch(subProfession){
              case '投擲手': //投擲手X模的造成二次額外傷害            
              return blackboardList?.find(item => item.key === 'attack@enable_third_attack')?.value ?? 0;
            }
          break;
        }

      //有條件的分支特性追加
      if(candidates_check){
        switch(attributeKey){
          //攻擊乘算
          case 'atk': 
            switch(subProfession){
              case '尖兵': //尖兵X模的阻擋敵人時提升攻擊力                
              case '吟遊者': //吟遊者X模的阻擋敵人時提升攻擊力 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)              
              case '處決者': //處決者Y模的周圍沒有幹員時提升攻擊力              
              return blackboardList?.find(item => item.key === 'atk')?.value ?? 0;
              case '行商': //行商Y模的每次特性消耗費用時提升攻擊力(可疊加) (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)
              return (blackboardList?.find(item => item.key === 'atk')?.value * blackboardList?.find(item => item.key === 'max_stack_cnt')?.value) ?? 0;
            }
          break;
          //攻擊倍率
          case 'atk_scale': 
            switch(subProfession){
              case '衝鋒手': //衝鋒手Y模的攻擊生命低於一定比例的敵人時提升攻擊倍率   
              case '戰術家': //戰術家Y模的攻擊援軍阻擋的敵人時提升攻擊倍率
              case '無畏者': //無畏者X模的攻擊阻擋的敵人時提升攻擊倍率
              case '強攻手': //強攻手X模的攻擊阻擋的敵人時提升攻擊倍率
              case '教官': //教官X模的攻擊自身未阻擋的敵人時提升攻擊倍率
              case '速射手': //速射手X模的攻擊空中敵人時提升攻擊倍率
              case '攻城手': //攻城手X模的攻擊重量>3的敵人時提升攻擊倍率 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)
              case '炮手': //炮手X模的攻擊阻擋的敵人時提升攻擊倍率
              case '塑靈術師': //塑靈術師X模的攻擊召喚物阻擋的敵人時提升攻擊倍率
              return blackboardList?.find(item => item.key === 'atk_scale')?.value ?? 1;
              case '撼地者': //撼地者X模的濺射範圍有3名以上敵人時提升攻擊倍率
              return blackboardList?.find(item => item.key === 'atk_scale_e')?.value ?? 1;
            }
          break;
          //傷害倍率
          case 'damage_scale': 
            switch(subProfession){
              case '術戰者': //術戰者Y模的自身阻擋的敵人獲得一定比例的法術脆弱 (暫時將此效果視為提升傷害倍率去算)                
              return blackboardList?.find(item => item.key === 'damage_scale')?.value ?? 1;
              case '神射手': //神射手X模的攻擊距離越遠的人造成越高傷害 (明明看敘述這應該是屬於乘算類的，但是實際數據卻是給 0.15 這種屬於加算類的數據，因此將實際數據再+1以方便帶入乘算) 
              case '攻城手': //攻城手Y模的攻擊距離越遠的人造成越高傷害 (明明看敘述這應該是屬於乘算類的，但是實際數據卻是給 0.12 這種屬於加算類的數據，因此將實際數據再+1以方便帶入乘算) 
              case '轟擊術師': //轟擊術師X模的攻擊距離越遠的人造成越高傷害 (明明看敘述這應該是屬於乘算類的，但是實際數據卻是給 0.15 這種屬於加算類的數據，因此將實際數據再+1以方便帶入乘算)
              case '陣法術師': //陣法術師Y模的攻擊範圍有越多敵人時造成越高傷害 (明明看敘述這應該是屬於乘算類的，但是實際數據卻是給 0.15 這種屬於加算類的數據，因此將實際數據再+1以方便帶入乘算)             
              return (1 + blackboardList?.find(item => item.key === 'damage_scale')?.value) ?? 1;
            }
          break;
          //攻速調整
          case 'attack_speed': 
            switch(subProfession){
              case '無畏者': //無畏者Y模的首次被擊倒不撤退並減少一定比例最大生命和提升攻擊速度
              case '術戰者': //術戰者X模的未阻擋敵人時提升攻擊速度
              case '鬥士': //鬥士Y模的生命高於一定比例時提升攻擊速度
              case '領主': //領主Y模的攻擊範圍有2名以上敵人時提升攻擊速度 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)
              case '速射手': //速射手Y模的攻擊範圍有地面敵人時提升攻擊速度 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)
              case '秘術師': //秘術師Y模的有儲存攻擊能量時提升攻擊速度 (目前確認到此模組原數據中把特性的 key value 寫在了理應是寫天賦更新的地方，導致目前專案邏輯無法順利抓取到key)
              return blackboardList?.find(item => item.key === 'attack_speed')?.value ?? 0;
            }
          break;
        }
      }
    }else{
      //無需模組就有的分支特性

      switch(attributeKey){
        //攻擊乘算
        case 'atk': 
          switch(subProfession){
            case '解放者': //解放者的磨刀疊攻擊力                    
            return 2;
          }
        break;
        //攻擊倍率
        case 'atk_scale': 
          switch(subProfession){
            case '獵手': //獵手的攻擊消耗子彈並提升攻擊倍率                 
            return 1.2;
            case '散射手': //散射手的攻擊前方一橫排的敵人時提升攻擊倍率               
            return 1.5;
          }
        break;
        //額外傷害的攻擊倍率
        case 'other2_attack_scale': 
          switch(subProfession){
            case '御械術師': //御械術師的使用浮游單元造成額外傷害            
            return 1.1;
            case '投擲手': //投擲手的造成一次額外傷害            
            return 0.5;
          }
        break;
        //額外傷害的傷害類型
        case 'other2_attack_type': 
          switch(subProfession){
            case '御械術師': //御械術師的使用浮游單元造成額外傷害            
            return '法術';
            case '投擲手': //投擲手的造成一次額外傷害            
            return '物理';
          }
        break;
      }
    }

    return undefined;
  },

  //依照模組ID和指定key名嘗試查詢幹員特定模組的天賦更新，並回傳天賦更新的加成值 (若查詢不到則回傳undefind)
  memberEquipTalent: (equipid, memberData, uniequipJsonData, battleEquipJsonData, witchPhases, attributeKey) => {    
    if(witchPhases === 2){
      //開啟模組的天賦更新
      const memberEquipBattle = UniequipCalculatorModel.memberEquipBattle(memberData, uniequipJsonData, battleEquipJsonData, equipid);
      let blackboardList;
      //獲取模組的天賦更新的數值提升數據陣列
      if(memberEquipBattle){
        const partsObject = memberEquipBattle.parts.find(obj => 
          obj.addOrOverrideTalentDataBundle && obj.addOrOverrideTalentDataBundle.candidates !== null
        );
        blackboardList = partsObject.addOrOverrideTalentDataBundle.candidates[partsObject.addOrOverrideTalentDataBundle.candidates.length - 1].blackboard;
      }

      return blackboardList?.find(item => item.key === attributeKey)?.value;
    }
    else{
      return undefined;
    }
  }
}

export default UniequipCalculatorModel;
