import BasicCalculatorModel from './BasicCalculator';
import SkillCalculatorModel from './SkillCalculator';

const FilterModel = {

    //數值過濾
    numberFilter: (number) => {
        //數值資料如為整數，則回傳原值，如有小數點，則無條件捨去至整數
        // 如要使用其他方法，無條件進位 = ceil()，無條件捨去 = trunc()，四捨五入 = round()
        return Number.isInteger(number) ? number : Math.trunc(number);
    },

    //幹員數據過濾
    characterDataFilter: (processedCharacterData, checkRarity) => {
        let finalData = processedCharacterData;

        //過濾掉不是幹員的數據
        finalData = finalData.filter(item => {
            switch(item.profession){
                case "TRAP": //道具
                return false;
                case "TOKEN": //裝置
                return false;
                default:
                return true;
            }
        });

        //過濾掉被取消勾選星級的數據
        Object.keys(checkRarity).forEach(key => {
            if(checkRarity[key] === false){
            finalData = finalData.filter(item => {
                switch(item.rarity){
                case key:
                    return false;
                default:
                    return true;
                }
            });
            }
        });

        return finalData;
    },
    
    //技能數據過濾
    skillDataFilter: (processedSkillData, characterJsonData, checkRarity) => {
        let finalData = processedSkillData;

        //過濾掉不是幹員的數據
        finalData = finalData.filter(item => {
            const profession = SkillCalculatorModel.skillFromMember(item, characterJsonData)?.profession
            switch(profession){
            case "TRAP": //道具
                return false;
            case "TOKEN": //裝置
                return false;
            default:
                return true;
            }
        });

        //過濾掉找不到所屬幹員的數據
        finalData = finalData.filter(item => {
            const data = SkillCalculatorModel.skillFromMember(item, characterJsonData);
            if(data !== null){
                return true;
            }
            else{
                return false;
            }
        }); 

        //過濾掉被取消勾選星級的數據
        Object.keys(checkRarity).forEach(key => {
            if(checkRarity[key] === false){
            finalData = finalData.filter(item => {
                const rarity = SkillCalculatorModel.skillFromMember(item, characterJsonData)?.rarity
                switch(rarity){
                case key:
                    return false;
                default:
                    return true;
                }
            });
            }
        });

        return finalData;
    },

}

export default FilterModel;