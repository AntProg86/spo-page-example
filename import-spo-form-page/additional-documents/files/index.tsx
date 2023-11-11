import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import FilePage from '#/src-ie-module/containers/file-page';
import { ApplicationState } from '#/src-ie-module/types';
import SPO from '#src/data-models/tl-models/SPO';

type Props = {

}

const Files: React.FunctionComponent<Props> = () => {
  
  const storeObservableObject = 
    useSelector<ApplicationState, SPO>((state) => 
      state.posPageStore.SPOImport.observableObject as SPO);

  return (
    <>
      <FilePage
        ObjectID={storeObservableObject.spoid as unknown as string}
        IsCanAdd={false}
        IsCanWrite={false}
        IsCanDelete={false}
        IsCopyFunction = {false} // Функционал копирования

      />
    </>
  )
};
    
export default React.memo(Files);