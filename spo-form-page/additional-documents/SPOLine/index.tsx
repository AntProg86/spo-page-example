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

//Экспорт
const SPOLine: React.FunctionComponent<Props> = () => {
 
  const storeObservableObject = useSelector<ApplicationState, SPO>((state) => 
  state.posPageStore.observableObject as SPO);
  //storeObservableObject.isExport === true ? 0:1
  return (
    <div className="">
      <SPOLineDataGrid SPOID={storeObservableObject.spoid} 
      addButtonVisible={true} IsExport={1}/>
    </div>
  );
};
    
export default React.memo(SPOLine);