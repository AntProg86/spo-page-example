import React, { useEffect, useContext, useState, useMemo} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import PageHeader from '#src/components/pageHeaderIE';
import PageTitle from '#src/components/pageTitle';
import { Button } from 'devextreme-react/button';
import { useHistory } from 'react-router';
import {useLocation} from 'react-router-dom';
import { FORMMODE, FormPageStore } from '../../types';
import { ACCESS_MODEL } from '#src/data-models/ACCESS_MODEL';
//----------------------------------------------

import { ApplicationState } from '../../../../types';
import {AppContext} from '../../../application/context';
import BaseModel from '#src/data-models/BaseModel/BaseModel';
import SPO from '#src/data-models/tl-models/SPO';
import { getDate } from '#src/commonFunctions/dateFunctions';
import { GetPathnameArray, goBackCustom } from '#src/commonFunctions/commonActionFunctions';
import { setFormMode, setIsSaveButtonOnClicked } from '../../reducer';
import { custom } from 'devextreme/ui/dialog';
import { ActionMainLoadPanelMessage, ActionMainLoadPanelShow } from '#src/components/mainLoadPanel/reducer';
import { deleteSPOFetch } from '#/src-ie-module/containers/application/actions';
type Props = {
  getObservableObject: any;
}

type State = {
  title: any;
};

const Header: React.FunctionComponent<Props> = ({getObservableObject}) => {

  const [state, changeState] = useState<State>(
    {
      title: '',
    },
  );

  const location = useLocation();
  const history = useHistory();
  const _appContext = useContext(AppContext);
  const dispatch = useDispatch();

  const storeOfForm = useSelector<ApplicationState, FormPageStore>((state) => state.posPageStore);
  
  // Доступ для объектов безопасности
	const IS_ACCESS = _appContext.IS_ACCESS as ACCESS_MODEL;

  const Toolbar = () => {

    const cancelButtonClick = () => {
      //console.log('*-*-*-*-cancelButtonClick');

      /*диалог подтверждения*/
      let confirmDialog = custom({
        showTitle:false,
        messageHtml: `<div>${LocalizedStrings.changes_will_be_undone}</div>`,
        buttons: [{ text: LocalizedStrings.yes , onClick: () => { return true; }},
                  { text: LocalizedStrings.no,  onClick: () => { return false; }},
        ]        
      });
      confirmDialog.show().then((dialogResult:boolean) => {
        if(dialogResult){
          dispatch(setFormMode(FORMMODE.READONLY));
          getObservableObject();
        }
      });
    }

    const editButtonClick = () => {

      //console.log('*-*-*-*-editButtonClick');

      dispatch(setFormMode(FORMMODE.EDIT));
    }

    const saveButtonClick = () => {
      //console.log('*-*-*-*-saveButtonClick');

      dispatch(setIsSaveButtonOnClicked(true));
    }

    const refreshButtonClick =() => {
      //console.log('refreshButtonClick');
      getObservableObject();
    };
    
    return (
      <div className="flexRow">
        
        {/* Кнопка «Обновить» */}
        <Button
          icon='refresh'
          //text={LocalizedStrings.refresh}
          onClick={refreshButtonClick}
          className='margin_right_5px'
          visible={true}
        />
        {/* <div className='margin_right_5px'/> */}

        {/* Кнопка «Отменить» */}
        {storeOfForm.form.formMode !== FORMMODE.READONLY &&
          <>
            <Button
              icon='close'
              text={LocalizedStrings.cancel}
              onClick={cancelButtonClick}
              // disabled={storeIsReadOnlyForm}
            />
            <div className='margin_right_5px'/>
          </>
        }

        {/* Кнопка «Редактировать» */}
        {storeOfForm.form.formMode === FORMMODE.READONLY &&
          <>
            <Button
              icon='edit'
              text={LocalizedStrings.edit}
              onClick={editButtonClick}
              // visible={IS_ACCESS?.}
              // disabled={storeIsReadOnlyForm}
            />
            <div className='margin_right_5px'/>
          </>
        }
        
        {/* <div className='margin_right_5px'/> */}
  
        {/* Кнопка «Сохранить» */}
        {storeOfForm.form.formMode !== FORMMODE.READONLY &&
          <>
            <Button
              icon='save'
              text={LocalizedStrings.save}
              onClick={saveButtonClick}
              // disabled={storeIsReadOnlyForm}
            />
            <div className='margin_right_5px'/>
          </>
        }
      </div>
    );
  }

  const getDropDownButtonItems = () => {
    return[
      {
        id: 1,
        text: LocalizedStrings.delete,
        icon: 'trash'
      },
      // {
      //   id: 2,
      //   text: 'button 2',
      //   icon: 'add'
      // },
    ]
  }

  const dropDownButtonOptions = {
    maxHeight: '80vh',
    width: '450',
    /*position: {
      my: 'right top',
      at: 'right bottom',
      of: '.thirdRow',
      scroll: 'fixed',
      boundary: '.thirdRow',
    },*/
  };

  const deleteButtonClick = () => {

    const _ob = storeOfForm.observableObject as SPO
    
    /*диалог подтверждения удаления*/
		let confirmDialog = custom({
			showTitle:false,
			messageHtml: `<div>${LocalizedStrings.are_you_sure_delete} № ${_ob.sap}? </div>`,
			buttons: [{ text: LocalizedStrings.yes , onClick: () => { return true; }},
								{ text: LocalizedStrings.no,  onClick: () => { return false; }},
			]        
		});
		confirmDialog.show().then((dialogResult:boolean) => {
			if(dialogResult) {

				//Сообщение для индикации загрузки на весь экран
				dispatch(ActionMainLoadPanelMessage(LocalizedStrings.loading));
				//Запуск индикация загрузки на весь экран
				dispatch(ActionMainLoadPanelShow(true));
		
				// Получаем accessToken и выполняем запрос.
				_appContext.doFetch(deleteSPOFetch, {spoIDList: _ob.spoid})
				.then((data:any) => {   
					const {payload, error} = data;
          
					if (error === undefined){

            // Получаем историю переходов пользователя (Routing)
            const pathnameArray = GetPathnameArray(history.location.state);
            // Возвращаемся назад
            goBackCustom(history, pathnameArray, `/SPOExport`);

					}
					
					// Очищаем сообщение
					dispatch(ActionMainLoadPanelMessage(''));
					// Скрываем индикацию загрузки на весь экран
					dispatch(ActionMainLoadPanelShow(false));
				});
			}
		});
  };
  
  const dropDownButtonClickOnItem = (e:any) => {
   
    switch(e.itemData.id) {

      case 1:
        deleteButtonClick();
        break;
      
      case 2:
        ()=>{console.log('button 2 on clicked');}
        break;

      default:
        break;
    };
  };

  var dropDownButtonItems = useMemo(() => getDropDownButtonItems(), [storeOfForm.observableObject]);

  //Нажата кнопка «Назад» в заголовке
  const backButtonOnClick = () =>{
    
    //Если изменений нет или они сохранены, то подтверждение не нужно.
    if(storeOfForm.form.formMode === FORMMODE.READONLY){
       
      // Получаем историю переходов пользователя (Routing)
      const pathnameArray = GetPathnameArray(history.location.state);
      // Возвращаемся назад
      goBackCustom(history, pathnameArray, `/SPOExport`);

      return;
    }
    
    /*диалог подтверждения*/
		let confirmDialog = custom({
			showTitle:false,
			messageHtml: `<div>${LocalizedStrings.changes_will_be_undone}</div>`,
			buttons: [{ text: LocalizedStrings.yes , onClick: () => { return true; }},
								{ text: LocalizedStrings.no,  onClick: () => { return false; }},
			]        
		});
		confirmDialog.show().then((dialogResult:boolean) => {
			if(dialogResult){   
        // Получаем историю переходов пользователя (Routing)
        const pathnameArray = GetPathnameArray(history.location.state);
        // Возвращаемся назад
        goBackCustom(history, pathnameArray, `/SPOExport`);
			}
		});
  }
  
  
  useEffect(()=>{

    const _storeObservableObject = storeOfForm.observableObject as SPO
    
    if(_storeObservableObject.spoid !== 0 && _storeObservableObject.spoid !== undefined){

      let _title = LocalizedStrings.spo + ' (' + LocalizedStrings._export + ')' +
      ' № ' +  _storeObservableObject.sap + ' ' + LocalizedStrings.from + ' ' + getDate(_storeObservableObject.spoDate)

      changeState((state) => ({
        ...state,
        title : _title
      }));

    }
    else{
      let _title = LocalizedStrings.add_SPO_export

      changeState((state) => ({
        ...state,
        title : _title
      }));
    }
    
    
  },[storeOfForm.observableObject]);
  
  return(
    <div>
      <PageHeader
        text={<PageTitle text={state.title}/>}
        backButtonOnClick={backButtonOnClick}
        dropDownButtonItems={storeOfForm.form.formMode === FORMMODE.READONLY ? dropDownButtonItems : undefined}
        // dropDownButtonItems={Items}
        dropDownButtonClickOnItem={dropDownButtonClickOnItem}
        dropDownButtonOptions={dropDownButtonOptions}
        Toolbar={Toolbar}
      />
    </div>
  )

  
};
    
export default React.memo(Header);