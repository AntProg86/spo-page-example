import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import PageTitle from '#src/components/pageTitle';
import SPODataGrid from './spo-datagrid';

type Props = {

}

const SPODataGridPage: React.FunctionComponent<Props> = () => {

  let pageTitle = LocalizedStrings.service_purchase_orders + " (" + LocalizedStrings.import.toLowerCase() + ")";

  useEffect(()=> {
    document.title = pageTitle;
    return () => {
      document.title = 'MSDB';
    }
  }, []);

  return (
    <>
      <div className="page_content">
        <div>

          <PageTitle text={pageTitle}></PageTitle>
          
          <SPODataGrid />
        </div>
      </div>
    </>
  );
};
    
export default React.memo(SPODataGridPage);