const CookieModel = {

    //取得Cookie
    getCookie: (name) => {
        const cookies = document.cookie.split('; ');
        //取得
        for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim().split('=');
        if (cookie[0] === name) {
            try{
            return JSON.parse(cookie[1]);
            }
            catch (e) {
            return cookie[1];
            } 
        }
        }
        //沒取得的預設值
        switch(name){
        case 'type':
            return '精零1級';
        case 'rarity':
            return { "TIER_1":true, "TIER_2":true, "TIER_3":true, "TIER_4":true, "TIER_5":true, "TIER_6":true,};
        }
    },
    //設置Cookie
    setCookie: (key, value) => {
        let expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // 设置Cookier在7天后过期
        const expires = `expires=${expirationDate.toUTCString()}`;
        const path = 'path=/';
    
        let cookieValue = value;
        if (typeof value === 'object' && value !== null) {
            cookieValue = JSON.stringify(value);
        } 

        // 組合完整的Cookie字串
        document.cookie = `${key}=${cookieValue}; ${expires}; ${path};`;
    },
    //log
    //此處用於輸出log功能，為防止重複輸出，需要用判斷值來判斷是否已輸出
    logList: {
        "memberNumeric": false,
        "memberNumeric_check": [],

        "memberTalent": false,
        "memberTalent_check": [],

        "memberEquip": false,
        "memberEquip_check": [],

        "memberDph": false,
        "memberDph_check": [],

        "memberDps": false,
        "memberDps_check": [],    
    },
    //取得log
    getLog: (name) => {
        return CookieModel.logList[name];
    },
    //設置log
    setLog: (name, value) => {
        return CookieModel.logList[name] = value;
    },
}

export default CookieModel;