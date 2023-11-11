import React, { useEffect, useContext, useState, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import { useHistory, useParams, useLocation, } from 'react-router';
import Header from './header';
import Form from './form';
import AdditionalDocuments from './additional-documents';
import './styles.scss';
//----------------------------------------
import {AppContext} from '../../application/context';
import { ApplicationState } from '../../../types';
import { ActionMainLoadPanelMessage, ActionMainLoadPanelShow } from '#src/components/mainLoadPanel/reducer';
import { FORMMODE, FormPageStore } from '../types';
import { getSPOFetch } from '../../application/actions';
import SPO from '#src/data-models/tl-models/SPO';
import UserInfo from '#src/data-models/ie-models/UserInfo';
import { setFormMode, setObservableObjectImportExport } from '../reducer';
import { POPUPSTATUS } from '#src/data-models/Popup';
import AddSPOLinePopup from '../../spo-line-page/popups/add-spo-line-export'

type Props = {

}

type State = {
  observableObjectID: any;
};

const FormPage: React.FunctionComponent<Props> = () => {

  const location = useLocation(); 

  const dispatch = useDispatch();
  const _appContext = useContext(AppContext);

  const [state, changeState] = useState<State>(
    {
      observableObjectID: undefined,
    },
  );

  let url = location.pathname;

  const storeFormMode = FORMMODE.UNDEFINED

  const storeOfForm = useSelector<ApplicationState, FormPageStore>((state) => state.posPageStore);
  const storeUserInfo = useSelector<ApplicationState, UserInfo>((state) => state.application.userInfo);
  const storeSPOLinePage = useSelector<ApplicationState, any>((state) => 
  state.SPOLinePageStore.popups.AddUpdateSPOLineImportExport);
  
  let pageTitle = LocalizedStrings.spo + ' (' + LocalizedStrings._export + ')';
  
  const preFill_new_SPO = () => {

    //console.log('*-*-*-*-preFill_new_SPO');
    
    let _spo = new SPO({
      spoid: 0,
      isExport: true,
      coordinatorID: storeUserInfo.userID,
      coordinatorName: storeUserInfo.surname + ' ' + storeUserInfo.firstname
    });

    dispatch(setObservableObjectImportExport(_spo));
    dispatch(setFormMode(FORMMODE.ADD));
  };

  //Очистка reducer
  useEffect(()=>{
    document.title = pageTitle;
    return () => {
      document.title = 'MSDB';
      //console.log('*-*-*-*-*-cleanUpReducer');
      //Возврат переменных reducer к первоначальным
      //dispatch(setDefaultStor());
    }
  },[]);

  //Разбор url адреса
  useEffect(()=>{
    if(url){
      // console.log('*-*-*-*-*__2');
      // console.log(url);

      urlAddressParsing();
    }
  },[url]);

  //Если пользователь ввел id объекта в адресную строку руками, то необходимо обновить обозреваемый объект
  useEffect(()=>{
    if(state.observableObjectID !== 0 && state.observableObjectID){
      //console.log('*-*-*-*-*-*-*location');
      getObservableObject(state.observableObjectID);
    }

    if(state.observableObjectID === 0){
      preFill_new_SPO();
    }
  },[state.observableObjectID]);
  
  const urlAddressParsing = () => {
    
    if(location.pathname.indexOf('id=') !== -1){

      let _observableObject_ID = Number(location.pathname.indexOf('id=') === -1 ? undefined : location.pathname.slice(location.pathname.indexOf('id=')+3)?.split('/')[0]);

      // console.log('*-*-*-*-* ID');
      // console.log(_observableObject_ID);

      changeState((state) => ({
        ...state,
        observableObjectID: _observableObject_ID
      }));
      
    }
  };
  
  //Получить из API и предать в reducer объект, с которым будет работать форма
  const getObservableObject = (id?:number) => {

    //Сообщение для индикации загрузки на весь экран
    dispatch(ActionMainLoadPanelMessage(LocalizedStrings.loading));
    //Запуск индикация загрузки на весь экран
    dispatch(ActionMainLoadPanelShow(true));

    // console.log('*-*-*-*-*getObservableObject');
    // console.log(id);

    if(!id){
      id = state.observableObjectID
    }

    // Получаем accessToken и выполняем запрос.
    _appContext.doFetch(getSPOFetch, {ID: Number(id)})
    .then((data:any) => {   
      const {payload, error} = data;
      
      if (payload){
        
        // console.log('*-*-*-*-*payload');
        // console.log(payload);
        
      }
      
      // Очищаем сообщение
      dispatch(ActionMainLoadPanelMessage(''));
      // Скрываем индикацию загрузки на весь экран
      dispatch(ActionMainLoadPanelShow(false));
    });
  };

  useEffect(()=>{
    const _storeObservableObject = storeOfForm.observableObject as SPO
    
    if(_storeObservableObject.spoid !== 0 && _storeObservableObject.spoid !== undefined){

      //const _storeObservableObject = storeOfForm.observableObject as SPO


    }
  },[storeOfForm.observableObject]);

  const AdditionalDocuments_by_FORMMODE = useCallback(()=>{
    const _storeObservableObject = storeOfForm.observableObject as SPO
    if(_storeObservableObject.spoid !== 0 && _storeObservableObject.spoid !== undefined){
      return(
        <>
          <AdditionalDocuments/>
        </>
      )
    }
    else{
      return(<></>)
    }
  },[storeOfForm.observableObject])
  
  //useCallback
  const titel = useCallback(()=>{
    return 'asd';
  },[storeSPOLinePage.popupMode])
  
  return (
    <>
      {/* <div className='export_booking_form_header'>
        <Header 
          getObservableObject={getObservableObject}
        />
      </div> */}
      <Header 
        getObservableObject={getObservableObject}
      />

      <div className='page_content'>
        <div className="pageMainContainer">  
          <div className='secondRow'>
            <Form getObservableObject={getObservableObject}/>
          </div>

          <AdditionalDocuments_by_FORMMODE/>
          { storeSPOLinePage.popupMode !== POPUPSTATUS.HIDDEN && 
            <AddSPOLinePopup/>}
        </div>
      </div>
      
    </>
  );
};
    
export default React.memo(FormPage);