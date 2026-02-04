import BasicCalculatorModel from '../model/BasicCalculator';
import TalentsCustomCalculatorModel from './TalentsCustomCalculator';
import UniequipCalculatorModel from './UniequipCalculator';
import CookieModel from './Cookie';

const TalentsCalculatorModel = {
  //依照指定key名嘗試查詢幹員對應的天賦，並回傳此天賦的加成值 (若查詢不到則默認回傳0)
  memberTalent: (type, memberRow, uniequipJsonData, battleEquipJsonData, attribute) => {
    //流派
    const witchPhases = BasicCalculatorModel.type(type).witchPhases;
    const witchAttributesKeyFrames = BasicCalculatorModel.type(type).witchAttributesKeyFrames;

    let addTotal = 0;
    let logObject = {};
    let logCount_talents = 1;

    //一個幹員可能會同時有多個天賦也可能完全沒天賦
    memberRow.talents?.forEach(t => {

      //一個天賦可能會同時有多個階段，同時還有包含各階段解鎖需達成的階級以及等級
      //因此需根據當前所選的流派去判斷是否達到解鎖標準

      //天賦階段需要反向遍歷，從最大階段判斷回去以找到符合階級以及等級的最大階段
      for(let l = t.candidates.length - 1; l > -1; l--){

        //判斷階段
        let phaseCheck = false;
        const phaseNum = parseInt(t.candidates[l].unlockCondition.phase.replace('PHASE_', ''), 10);
        //通用的階段判斷邏輯
        if(phaseNum === witchPhases){
          phaseCheck = true;
        }
        //特殊的階段判斷邏輯
        //因為三星以下幹員沒有精二，這導致使用精二以上的流派來判斷，通用邏輯將無法得出三星以下幹員的最大階段技能
        //因此在使用精二流派判斷時，三星以下幹員直接於第一次判斷時取得階段
        const memberRarity = BasicCalculatorModel.memberRarity(memberRow);
        if(memberRarity < 4 && witchPhases === 2){
          phaseCheck = true;
        }
        
        if (phaseCheck) {
          //特殊的等級判斷邏輯
          let levelCheck = true;
          const levelN = t.candidates[l].unlockCondition.level > 1 ? 1 : 0;
          //四星以上幹員的天賦解鎖都只與階段相關，因此其實只要判斷階段就可以
          //而三星以下幹員的天賦解鎖還會與等級相關，ex: 三星幹員在精一1級與精1滿級各有天賦階段
          //因此為了方便判斷，1級解鎖一律視為0，非1級解鎖一律視為1，以此來配合流派做判斷
          if(memberRarity < 4 && witchPhases !== 2 && levelN === 1 && witchAttributesKeyFrames === 0){
            levelCheck = false;
          }

          //用於輸出log的計算
          logObject[`${logCount_talents}.`] = t.candidates[l].name;              
          t.candidates[l].blackboard.forEach(b => {
            logObject[`${logCount_talents}. ${b.key}`] = b.value;
            const unieqVal = UniequipCalculatorModel.memberEquipTalent(memberRow.equipid, memberRow, uniequipJsonData, battleEquipJsonData, witchPhases, b.key);
            if(unieqVal){
              logObject[`${logCount_talents}. ${b.key}`] = unieqVal;
            }        
          });
          logCount_talents += 1;

          if(levelCheck){         
            //一個天賦可能會同時有多個強化效果，甚至可能重複     
            t.candidates[l].blackboard.forEach(b => {   
              if (b.key === attribute) {
                //模組的天賦更新加成數值                        
                addTotal += (b.value ?? 0);

                //判斷合理性，因為有太多key共用的不合理情況
                //ex: 石英天賦的加攻的key是atk
                //鉛踝天賦的攻擊範圍有隱匿單位就加攻的key也是atk
                //泡泡天賦的對攻擊對象減攻擊的key也是atk
                //這導致若是不判斷的話會有許多錯誤引用的數值添加
                if(memberRow.name in TalentsCustomCalculatorModel.talentNotListToBasic){
                  if(TalentsCustomCalculatorModel.talentNotListToBasic[memberRow.name].has(attribute)){
                    addTotal -= (b.value ?? 0);
                  }
                }
              }
            });
              
            break;          
          }
        }
      }
    });

    //如果是精2流派，嘗試查詢出模組的天賦更新數值並覆蓋原數值 (暫時默認預設天賦key跟模組天賦key是一樣的，不做特製化，等之後又發現有人有特例再進行修改)
    if(witchPhases == 2){
      const unieqVal = UniequipCalculatorModel.memberEquipTalent(memberRow.equipid, memberRow, uniequipJsonData, battleEquipJsonData, witchPhases, attribute); 
      if(unieqVal){
        addTotal = 0;
        addTotal += unieqVal;  
        //判斷合理性，因為有太多key共用的不合理情況
        if(memberRow.name in TalentsCustomCalculatorModel.talentNotListToBasic){
          if(TalentsCustomCalculatorModel.talentNotListToBasic[memberRow.name].has(attribute)){
            addTotal -= unieqVal;
          }
        }
      }     
    }

    //打印log       
    if(memberRow.name === CookieModel.getCookie('memberName')){
      if(CookieModel.getLog('memberTalent_check').includes(`${memberRow.equipid}`) === false){
        CookieModel.setLog('memberTalent', false);
        if(CookieModel.getLog('memberTalent') === false){
          CookieModel.setLog('memberTalent', true);  
          CookieModel.getLog('memberTalent_check').push(`${memberRow.equipid}`); 
          const equipData = UniequipCalculatorModel.memberEquipData(memberRow, uniequipJsonData, memberRow.equipid); 
          console.groupCollapsed(`${memberRow.name}【${equipData? equipData.uniEquipName : '無模組'}】的天賦加成原始數據log`);
          console.table(
            logObject
          );
          console.groupEnd(); 
        }   
      }
      
    }

    return addTotal;
  },
}

export default TalentsCalculatorModel;
