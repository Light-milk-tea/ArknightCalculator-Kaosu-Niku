import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import React, { useState } from 'react';
import './App.css';
import Header from './component/Header.js';
import MainContent from './component/MainContent.js';
import Footer from './component/Footer.js';
import CookieModel from './model/Cookie';
import { useLanguage } from './context/LanguageContext';

function App() {
  const [cookieMemberName, setCookieMemberName] = useState(CookieModel.getCookie('memberName'));
  const { t } = useLanguage();

  return (
    <div>
      <header>
        <title>Arknight Calculator</title>
        <link rel="icon" href="圖片URL" type="image/x-icon"></link>
        <meta charSet="UTF-8"></meta>
        <meta name="author" content="Kaosu-Niku"></meta>
        {/* 響應式設計 */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
        {/* 用於搜索引擎結果顯示的網站敘述 */}
        <meta name="description" content="用於明日方舟的以下流派: ( 精一1級四星隊、精一滿級四星隊、四星隊 ) 的數據計算器，可以自定義敵人數據並快速計算我方DPS、敵方DPS...等等數據，方便攻略"></meta>
        {/* 搜索引擎相關設定，index = 允許搜索引擎搜索到此網站，follow = 不允許搜索引擎追蹤此網站上的其餘URL */}
        <meta name="robots" content="index, nofollow"></meta>
        {/* 於社群媒體上分享此網站時的資訊設定 (Open Graph) */}
        <meta property="og:url" content="https://kaosu-niku.github.io/ArknightCalculator/"></meta>  
        <meta property="og:type" content="website"></meta>
        <meta property="og:site_name" content="Arknight Calculator"></meta>
        <meta property="og:image" content="圖片URL"></meta>
        <meta property="og:title" content="明日方舟數據計算器"></meta>
        <meta property="og:description" content="用於明日方舟的以下流派: ( 精一1級四星隊、精一滿級四星隊、四星隊 ) 的數據計算器，可以自定義敵人數據並快速計算我方DPS、敵方DPS...等等數據，方便攻略"></meta>
      </header>
      <Header />
      <MainContent />
      <Footer />
      {/* 電腦版呈現在左邊的的Collapse */}
      <div className="d-none d-md-block position-fixed" style={{ top: '25%', left: '10px' }}>
        <p>
          <a className="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
            {t('輸出幹員數據計算log')}
          </a>
        </p>
        <div className="collapse w-25" id="collapseExample">
          <div className="card card-body">
            <div className='row justify-content-center row-gap-1'>
              <small className="col-12 text-center">{`(${t('此為電腦版才能使用的功能')})`}</small>
              <small className="col-12 text-center">{t('此功能可用於輸出指定幹員的所有相關數據計算的log')}</small>
              <small className="col-12 text-center">{t('請於下方輸入欄輸入指定幹員的名稱並點擊確認按鈕')}</small>
              <small className="col-12 text-center">{`(${t('以簡體中文名稱為準，其他語言的名稱將無法指定')})`}</small>
              <input className="col-6 text-center" type="text" id="cookieMemberName" name="cookieMemberName" 
              value={cookieMemberName} onChange={(e) => setCookieMemberName(e.target.value)} required/>
              <span className="col-12"></span>
              <button className="col-4 btn btn-primary" onClick={() => { 
                 CookieModel.setCookie('memberName', cookieMemberName); 
                 //alert(`已指定${cookieMemberName}`) 
                }}>{t('確認')}</button>
              <small className="col-12 mt-4 text-center">{t('如何查看log?')}</small>
              <small className="col-12 text-center">{t('點擊鍵盤的F12默認可以開啟開發人員工具介面')}</small>
              <small className="col-12 text-center">{t('介面頂部的頁籤切換到[主控台]，即可查看到log')}</small>
            </div>             
          </div>
        </div>
      </div>
      {/* 電腦版呈現在右邊的的固定按鈕 */}
      <div className="d-none d-md-block position-fixed" style={{ top: '15%', right: '-10px' }}>
        <div className='d-flex flex-column gap-2'>
          <a className="btn btn-danger" href='#enemy_form'>{t('敵人數據')}</a>
          <a className="btn btn-success" href='#member_table'>{t('幹員數據')}</a>
          <a className="btn btn-warning" href='#attackSkill_table'>{t('攻擊技能數據')}</a>
          <a className="btn btn-primary" href='#defSkill_table'>{t('防禦技能數據')}</a>
        </div>
      </div>
      {/* 手機版呈現在底部的的固定按鈕 */}
      <div className="d-block d-md-none position-fixed" style={{ bottom: '0' }}>
        <div className='row justify-content-around justify-content-center m-0'>
          <a className="col-6 p-0 rounded-0 btn btn-danger" href='#enemy_form'>{t('敵人數據')}</a>
          <a className="col-6 p-0 rounded-0 btn btn-success" href='#member_table'>{t('幹員數據')}</a>
          <a className="col-6 p-0 rounded-0 btn btn-warning" href='#attackSkill_table'>{t('攻擊技能數據')}</a>
          <a className="col-6 p-0 rounded-0 btn btn-primary" href='#defSkill_table'>{t('防禦技能數據')}</a>
        </div>
      </div>
      {/* 電腦版呈現在底部的的裝飾圖片 */}
      {/* <div className="d-none d-md-block position-fixed" style={{ bottom: '0', left: '-7.5%', pointerEvents: 'none' }}>
        <video src={`${process.env.PUBLIC_URL}/video/安赛尔-悠然假日 HDm06-基建-Special-x1.webm`} autoPlay loop muted className='h-auto opacity-75' style={{ width: '500px' }}>
          您的瀏覽器不支持 HTML5 video 標籤。
        </video>
      </div>
      <div className="d-none d-md-block position-fixed" style={{ bottom: '0', right: '-7.5%', pointerEvents: 'none' }}>
        <video src={`${process.env.PUBLIC_URL}/video/水月-永恒玩家-基建-Special-x1.webm`} autoPlay loop muted className='h-auto opacity-75' style={{ width: '500px', transform: 'scaleX(-1)' }}>
          您的瀏覽器不支持 HTML5 video 標籤。
        </video>  
      </div> */}
    </div>    
  );
}

export default App;
