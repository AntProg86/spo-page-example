import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import SPOLineDataGrid from '../../../../spo-line-page/spo-line-datagrid-page/spo-line-datagrid';
import { FormPageStore } from '../../../types';
import { ApplicationState } from '#/src-ie-module/types';
import SPO from '#src/data-models/tl-models/SPO';

type Props = {
}

//Импорт
const SPOLine: React.FunctionComponent<Props> = () => {
  
  const storeObservableObject = 
  useSelector<ApplicationState, SPO>((state) => 
    state.posPageStore.SPOImport.observableObject as SPO);
  
  const test = () => {
    console.log('*-*-*-*-*-*test');
    console.log(storeObservableObject);
  };
    
  return (
    <div className="">
      <SPOLineDataGrid 
        SPOID={storeObservableObject.spoid} 
        asAdditionalDocuments={true}
        IsExport={storeObservableObject.isExport === true ? 1:0}
      />
    </div>
  );
};
    
export default React.memo(SPOLine);