

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

function Header() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className='bg-dark text-white'>
      <div className='d-flex justify-content-center align-items-center p-1 m-0 position-relative'>
        <h2 className='text-center m-0'>Arknight Calculator</h2>
        <div className="position-absolute end-0 me-2">
          <button 
            className="btn btn-outline-light btn-sm" 
            onClick={toggleLanguage}
          >
            {language === 'zh-TW' ? '切换至简体中文' : '切换至繁体中文'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;
