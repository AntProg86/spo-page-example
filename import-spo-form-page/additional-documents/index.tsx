import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import TabsWithRoute from '#src/components/tabs-with-route';
import Files from './files';
import SPOLine from './SPOLine';

type Props = {
  
}

const AdditionalDocuments: React.FunctionComponent<Props> = () => {

  const tabContent = [
    {
      id: 1,
      text: LocalizedStrings.spo_lines_import,
      component: <SPOLine/>,
      tab_code: 'SPOLine',
    },
    {
      id:2,
      text: LocalizedStrings.files,
      component: <Files/>,
      tab_code: 'files',
    },
  ];
  
  return (
    <div className="">
      <TabsWithRoute content={tabContent}/>
    </div>
  );
};
    
export default React.memo(AdditionalDocuments);