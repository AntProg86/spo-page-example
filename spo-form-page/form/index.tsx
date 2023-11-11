import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import { AppContext } from '../../../application/context';
import { ApplicationState } from '../../../../types';
import PefForm from '#src/pef-react-library/form';
import PefLabel from '#src/pef-react-library/lable';
import { TextBox } from 'devextreme-react/text-box';
import { CheckBox } from 'devextreme-react/check-box';
import { NumberBox, TextArea, ValidationGroup} from 'devextreme-react';
import { DateBox } from 'devextreme-react/date-box';
import MasterDataSelector from '#src-ie-module/components/wrappers/masterDataSelector';
import { FORMMODE, FormDictionaryExport, FormPageStore, buyer } from '../../types';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import {useLocation} from 'react-router-dom';
import { useHistory } from 'react-router';
import commonHandler, { commonOnOpened, commonSelectionChanged } from '#src/commonFunctions/inputHandlers';
import commonOnSelectionChanged from '#src/commonFunctions/inputHandlers';
import BaseModel from '#src/data-models/BaseModel/BaseModel';
import SPO from '#src/data-models/tl-models/SPO';
import { SelectBox } from 'devextreme-react/select-box';
import partnerForTT from '#src/data-models/dictionaries/partnerForTT';
import { CARDCODES3RDPARTY, go3rdPartyCardPage } from '#src/commonFunctions/commonActionFunctions';
import CONSTANTS from '../../../../constants.json';
import { setDefaultStore, setFormMode, setIsSaveButtonOnClicked } from '../../reducer';
import contract from '#src/data-models/dictionaries/contract';
import currency from '#src/data-models/dictionaries/currency';
import { getCurrencyListFetch, getFactoryListFetch, getPartnerListFetch, getUserListFetch, putSPOAddUpdateFetch } from '#/src-ie-module/containers/application/actions';
import User from '#src/data-models/dictionaries/user';

type Props = {
  getObservableObject:any;
};

type State = {
  observableObject:SPO;
  //Перевозчик
  transporterList: Array<partnerForTT>;
  selected_transporter: partnerForTT;
} & FormDictionaryExport;



const initState = {
  observableObject: new SPO(),

  //Перевозчик
  transporterList: new Array<partnerForTT>(),
  selected_transporter : new partnerForTT(),

  //Координатор
  coordinatorList: new Array<User>,
  selected_coordinator:new User,

  //Валюта
  currencyList: new Array<currency>(),
  selected_currency: new currency(),

  //Покупатель
  buyerList: new Array<buyer>,
  selected_buyer: {factoryID : 0, factoryName : '', factoryNameEng: '',},
}

const Form: React.FunctionComponent<Props> = ({getObservableObject}) => {

  const dispatch = useDispatch();
  const location = useLocation();
  const _appContext = useContext(AppContext);

  const history = useHistory();
  let validationGroupRef: any = null;
  const formInputHeight = "30px";

  const storeOfForm = useSelector<ApplicationState, FormPageStore>((state) => state.posPageStore);

  const storeIsReadOnlyForm = storeOfForm.form.formMode === FORMMODE.READONLY;
  
  //Переход на карточку контрагента
	const goPartnerCard = go3rdPartyCardPage(CARDCODES3RDPARTY.PARTNER);

  //Переход на карточку контракта
  const goContractCard = go3rdPartyCardPage(CARDCODES3RDPARTY.IMPCONTRACT);
  
  const [state, changeState] = useState<State>(initState);

  const onSelectionChanged = commonSelectionChanged(changeState, state);

  //Коллбэк, изменяющий нужные части стэйта
  const updateState = (field: string, value: any) => {
    changeState((state) => ({
      ...state,
      observableObject: {
        ...state.observableObject,
        [field]: value
      }
    }))
  };

  //Замыкаем коллбэк, изменяющий стейт, в хэндлере
  const localHandler = commonHandler(updateState);
  const onOpened = commonOnOpened(_appContext, changeState, state);

  //ObservableObject" получен из API
  useEffect(()=>{
    const _storeObservableObject = storeOfForm.observableObject as SPO
    
    if(_storeObservableObject){

      //const _storeObservableObject = storeOfForm.observableObject as SPO

      //Перевозчик
      const _transporter = new partnerForTT({
        partnerID : _storeObservableObject?.partnerID ?? null, 
        partnerShort: _storeObservableObject?.partner ?? ''
      });

      //Валюта
      const _currency = new currency({
        currencyID: _storeObservableObject.currencyID,
        currencyCode: _storeObservableObject.currencyCode ?? '',
      });

      //Координатор
      const _coordinator = new User({
        userID: _storeObservableObject.coordinatorID,
        userName: _storeObservableObject.coordinatorName ?? '',
      });

      //Покупатель
      const _buyerList = new Array<buyer>();
      _buyerList.push(
        {
          factoryID : _storeObservableObject.factoryID, 
          factoryName : _storeObservableObject.factoryName ?? '',
          factoryNameEng : _storeObservableObject.factoryName ?? ''
        }
      );

      changeState((state) => ({
        ...state,
        observableObject: storeOfForm.observableObject as SPO,
        
        transporterList: [_transporter],
        selected_transporter: _transporter,

        currencyList: [_currency],
        selected_currency: _currency,
        
        coordinatorList: [_coordinator],
        selected_coordinator: _coordinator,

        buyerList: _buyerList,
        selected_buyer: _buyerList[0],

      }));

    }
  },[storeOfForm.observableObject]);

  //Нажата кнопка «Сохранить»
  useEffect(()=>{
    if(storeOfForm.form.isSaveButtonOnClicked){
      //console.log('*-*-*-*-*-*-SaveButtonOnClicked');

      const { isValid } = validationGroupRef.instance.validate();
      
      // Если одно из обязательных полей не заполнено, то данные не отправляем
      if (!isValid) {
        dispatch(setIsSaveButtonOnClicked(false));
        return;
      }

      const _ob = state.observableObject;

      _appContext.doFetch(putSPOAddUpdateFetch, {spo: _ob})
      .then((data:any)=>{

        const {payload, error} = data;

        dispatch(setIsSaveButtonOnClicked(false));

        if(payload === undefined){return;}
        
        if(payload === 0){
          //console.log('*-*-**Update SPO');
          
          getObservableObject(state.observableObject.spoid);

          dispatch(setFormMode(FORMMODE.READONLY));
        }
        else{
          //console.log('*-*-**Add SPO');
          dispatch(setFormMode(FORMMODE.READONLY));
          
          history.push({
            pathname:`/SPOFormPage/id=${payload}`,
          });
        }
      })

      
    }
  }, [storeOfForm.form.isSaveButtonOnClicked]);

  //Уход или закрытие формы
  useEffect(() => {
    return () => {
      //Возврат переменных reducer к первоначальным
      dispatch(setDefaultStore());
    }
  }, []);

  
  const test = () => {
    // console.log('*-**test');
    // console.log(state.observableObject); 
  }
  
  return (
    <PefForm>
      <ValidationGroup ref={ref => validationGroupRef = ref}>
        <div className='container-fluid form-container'>
          
          {/* ---------------- 1 - строка------------------ */}
          <div className='row'>
            <div className='col-4'>
              <div onClick={test}>
                {/* ************Номер********************* */}
                <PefLabel text={LocalizedStrings.number}/>
              </div>
              <div className=''>
                <TextBox
                  value={state.observableObject.sap}
                  readOnly={storeIsReadOnlyForm}
                  onInput={localHandler('sap')}
                  onKeyUp={localHandler('sap')}
                  height={formInputHeight}
                  elementAttr={storeIsReadOnlyForm
                    ? {class: 'textStyle textBoxWithOutLine textBoxHoverWithOutLine'}
                    : {class: ''}
                  }>
                  <Validator>
                    {!storeIsReadOnlyForm && <RequiredRule />}
                  </Validator>
                </TextBox>
              </div>
            </div>

            <div className="col-2">
              <div>
                {/* ************Дата********************* */}
                <PefLabel text={LocalizedStrings.date}/>
              </div>
              <div className=''>
                <DateBox
                  type="date"
                  pickerType="calendar"
                  value={state.observableObject.spoDate}
                  onValueChanged={localHandler('spoDate')}
                  readOnly={storeIsReadOnlyForm}
                  displayFormat="dd.MM.yyyy"
                  //dateSerializationFormat={"yyyy-MM-ddTHH:mm:ss"}
                  useMaskBehavior={true}
                  width={storeIsReadOnlyForm ? '90':'120'}
                  elementAttr={storeIsReadOnlyForm
                    ? {class: 'textStyle textBoxWithOutLine textBoxHoverWithOutLine'}
                    : {class: ''}
                  }
                  height={formInputHeight}   
                >
                  <Validator>
                    {!storeIsReadOnlyForm && <RequiredRule />}
                  </Validator>
                </DateBox>

              </div>
            </div>
          </div>

          {/* ---------------- 2 - строка------------------ */}
          <div className='row'>
            {/* ************Перевозчик******************* */}
            <div className="col-4">
              <div>
                <PefLabel text={LocalizedStrings.transporter_1}/>
              </div>
              <div className=''>

                <MasterDataSelector
                  items={state.transporterList}
                  readOnly={storeIsReadOnlyForm}
                  titleDataGrid={LocalizedStrings.transporter_1}
                  displayExpr='partnerShort'
                  idFieldName='partnerID'
                  onValueChanged={(e:any)=>onSelectionChanged(e, 'selected_transporter', 'partnerID', 'partnerID')}
                  selectBoxValue={state.selected_transporter}
                  height={formInputHeight}  
                  details={state.selected_transporter.partnerID 
                    ? { action: goPartnerCard(state.selected_transporter.partnerID) }
                    : undefined
                  }
                  //isOnlyButtonActive={true}
                  isExpandButtonActive={false}
                  onOpened={(e:any)=>onOpened(
                    e, 
                    getPartnerListFetch, 
                    'transporterList', 
                    'selected_transporter',
                    'partnerID',
                    'partnerShort',
                    {ForVEReport: null}
                  )}
                />
                
              </div>
            </div>

            {/* ************Покупатель********************* */}
            <div className='col-3'>
              <div>
                <PefLabel text={LocalizedStrings.buyer}/>
              </div>
              <div className=''>
                {/* <MasterDataSelector
                  items={state.buyerList}
                  titleDataGrid={LocalizedStrings.customer}
                  //width='500'
                  readOnly={storeIsReadOnlyForm}
                  displayExpr= {'factoryName'}
                  idFieldName='factoryID'
                  onValueChanged={(e:any)=>onSelectionChanged(e, 'selected_buyer', 'factoryID', 'factoryID')}
                  selectBoxValue={state.selected_buyer}
                  height={formInputHeight}  
                  onOpened={(e:any)=>onOpened(
                    e,
                    getFactoryListFetch,
                    'buyerList',
                    'selected_buyer',
                    'factoryID',
                    'factoryName',
                    {ForVEReport : null}
                    )
                  }
                  //EnableValidationRules={true}
                /> */}

                <SelectBox
                  dataSource={state.buyerList}
                  displayExpr='factoryName' //отображаемое поле
                  //valueExpr='line'
                  //showClearButton={true}
                  placeholder={(storeOfForm.form.formMode === FORMMODE.READONLY ? true: false)===true ? '' : LocalizedStrings.choose}
                  readOnly={storeOfForm.form.formMode === FORMMODE.READONLY ? true: false}
                  searchEnabled={true}
                  onSelectionChanged={(e:any)=>onSelectionChanged(
                    e,
                    'selected_buyer', 'factoryID', 'factoryID')}
                  value={state.selected_buyer} //Значение по умолчанию или выбранное значение
                  onOpened={(e:any)=>onOpened(
                    e,
                    getFactoryListFetch,
                    'buyerList',
                    'selected_buyer',
                    'factoryID',
                    'factoryName',
                    {ForVEReport : null}
                    )}
                  // noDataText={LocalizedStrings.loading_data}
                  height={formInputHeight}
                  //dropDownOptions={dropDownOptions} //размеры и т.д. выпадающего списка
                  >
                  </SelectBox>
              </div>
            </div>

            {/* ************Координатор********************* */}
            <div className='col-3'>
              <div>
                <PefLabel text={LocalizedStrings.coordinator_1}/>
              </div>
              <div className=''>
                <MasterDataSelector
                    //placeholder={LocalizedStrings.PO_line}
                    items={state.coordinatorList}
                    titleDataGrid={LocalizedStrings.coordinator_1}
                    //width='500'
                    readOnly={storeIsReadOnlyForm}
                    displayExpr='userName'
                    idFieldName='userID'
                    selectBoxValue={state.selected_coordinator}
                    onValueChanged={(e: any) => onSelectionChanged(e, 'selected_coordinator', 'coordinatorID', 'userID')}
                    height={formInputHeight}
                    // EnableValidationRules
                    onOpened={(e: any) => onOpened(
                      e,
                      getUserListFetch,
                      'coordinatorList',
                      'selected_coordinator',
                      'userID',
                      'userName',                   
                    )}
                  />
              </div>
            </div>

            {/* ************Валюта********************* */}
            <div className='col-2'>
              <div>
                <PefLabel text={LocalizedStrings.currency}/>
              </div>
              <div className=''>
                <MasterDataSelector
                    items={state.currencyList}
                    titleDataGrid={LocalizedStrings.currency}
                    readOnly={storeIsReadOnlyForm}
                    displayExpr='currencyCode'
                    idFieldName='currencyID'
                    onValueChanged={(e:any)=>onSelectionChanged(e, 'selected_currency', "currencyID", 'currencyID')}
                    selectBoxValue={state.selected_currency}
                    height={formInputHeight}
                    EnableValidationRules={true}
                    onOpened={(e:any)=>onOpened(
                      e, 
                      getCurrencyListFetch, 
                      'currencyList', 
                      'selected_currency',
                      'currencyID',
                      'currencyCode'
                    )}
                  />
              </div>
            </div>
            
          </div>

          {/* ---------------- 3 - строка------------------ */}
          <div className='row'>
            <div className='col-12'>
                {/* ************Примечания********************* */}
                <div className='height_100'>
                  <div>
                    <PefLabel text={LocalizedStrings.remark}/>
                  </div>
                  <div className=''>
                    <TextArea
                      height={300}
                      value={state.observableObject.notes}
                      readOnly={storeIsReadOnlyForm}
                      onInput={localHandler('notes')}
                      onKeyUp={localHandler('notes')}
                    />
                  </div>
                </div>
              </div>
          </div>

        </div>
      </ValidationGroup>
    </PefForm>
  );
};
    
export default React.memo(Form);