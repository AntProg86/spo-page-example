import React, { useEffect, useContext, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';
import { AppContext } from '../../../application/context';
import { ApplicationState } from '../../../../types';
import PefForm from '#src/pef-react-library/form';
import PefLabel from '#src/pef-react-library/lable';
import { TextBox } from 'devextreme-react/text-box';
import { TextArea, ValidationGroup} from 'devextreme-react';
import { DateBox } from 'devextreme-react/date-box';
import MasterDataSelector from '#src-ie-module/components/wrappers/masterDataSelector';
import { FORMMODE, FormDictionaryImport, FormPageStore, SPOImportStore } from '../../types';
import Validator, { RequiredRule } from 'devextreme-react/validator';
import {useLocation} from 'react-router-dom';
import { useHistory } from 'react-router';
import commonHandler, { commonOnOpened, commonSelectionChanged } from '#src/commonFunctions/inputHandlers';
import SPO from '#src/data-models/tl-models/SPO';
import partnerForTT from '#src/data-models/dictionaries/partnerForTT';
import { CARDCODES3RDPARTY, go3rdPartyCardPage } from '#src/commonFunctions/commonActionFunctions';
import { setDefaultStoreImport, setFormModeImport, setIsSaveButtonOnClickedImport } from '../../reducer';
import contract from '#src/data-models/dictionaries/contract';
import currency from '#src/data-models/dictionaries/currency';
import { getContractListFetch, getCurrencyListFetch, getPartnerListFetch, getUserListFetch, putSPOAddUpdateFetch } from '#/src-ie-module/containers/application/actions';
import User from '#src/data-models/dictionaries/user';
import Tmp from '../../common/tmp';

type Props = {
  getObservableObject:any;
}

type State = {
  observableObject:SPO;
} & FormDictionaryImport;

const initState = {
  observableObject: new SPO(),

  transporterList: new Array<partnerForTT>(),
  selected_transporter : new partnerForTT(),

  //Контракт
  contractList: new Array<contract>(),
  selected_contract: new contract(),

  //Валюта
  currencyList: new Array<currency>(),
  selected_currency: new currency(),

  //Координатор
  coordinatorList: new Array<User>,
  selected_coordinator:new User,
}

const Form: React.FunctionComponent<Props> = ({getObservableObject}) => {

  const dispatch = useDispatch();
  const location = useLocation();
  const _appContext = useContext(AppContext);

  const history = useHistory();
  let validationGroupRef: any = null;
  const formInputHeight = "30px";

  //const storeOfForm = useSelector<ApplicationState, FormPageStore>((state) => state.posPageStore);
  const storeOfForm = useSelector<ApplicationState, SPOImportStore>((state) => state.posPageStore.SPOImport);
  
  const storeIsReadOnlyForm = storeOfForm.formMode === FORMMODE.READONLY;

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
    
    //if(_storeObservableObject.spoid !== 0 && _storeObservableObject.spoid !== undefined){
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

      //Контракт
      const _contract = new contract({
        contractID: _storeObservableObject.contractID,
        contractNum: _storeObservableObject.contractNum ?? '',
      });

      //Координатор
      const _coordinator = new User({
        userID: _storeObservableObject.coordinatorID,
        userName: _storeObservableObject.coordinatorName ?? '',
      });

      changeState((state) => ({
        ...state,
        observableObject: storeOfForm.observableObject as SPO,
        
        transporterList: [_transporter],
        selected_transporter: _transporter,

        currencyList: [_currency],
        selected_currency: _currency,

        contractList: [_contract],
        selected_contract: _contract,

        coordinatorList: [_coordinator],
        selected_coordinator: _coordinator,

      }));

    }
  },[storeOfForm.observableObject]);

  //Нажата кнопка «Сохранить»
  useEffect(()=>{
    if(storeOfForm.isSaveButtonOnClicked){
      //console.log('*-*-*-*-*-*-SaveButtonOnClicked');

      const { isValid } = validationGroupRef.instance.validate();
      
      // Если одно из обязательных полей не заполнено, то данные не отправляем
      if (!isValid) {
        dispatch(setIsSaveButtonOnClickedImport(false));
        return;
      }

      const _ob = state.observableObject;

      _appContext.doFetch(putSPOAddUpdateFetch, {spo: _ob})
      .then((data:any)=>{

        const {payload, error} = data;
        
        dispatch(setIsSaveButtonOnClickedImport(false));

        if(payload === undefined){return;}
        
        //Update SPO / Add SPO
        if(payload === 0){
          //console.log('*-*-**Update SPO');
          
          getObservableObject(state.observableObject.spoid);

          dispatch(setFormModeImport(FORMMODE.READONLY));
        }
        else{
          //console.log('*-*-**Add SPO');

          dispatch(setFormModeImport(FORMMODE.READONLY));

          history.push({
            pathname:`/SPOFormImportPage/id=${payload}`,
          });
        }
      })

    }
  }, [storeOfForm.isSaveButtonOnClicked]);

  //Уход или закрытие формы
  useEffect(() => {
    return () => {
      //Возврат переменных reducer к первоначальным
      dispatch(setDefaultStoreImport());
    }
  }, []);

  
  const test = () => {
    console.log('*-*-*-*-*-*-*-test');
    
    //getObservableObject 
    // console.log(storeIsReadOnlyForm);
    console.log(storeOfForm);
    
    console.log(state.observableObject); 
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
                <Tmp func_test={test}/>
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

            {/* ************Контракт************************ */}
            <div className='col-3'>
              <div>
                <PefLabel text={LocalizedStrings.contract}/>
              </div>
              <div className=''>
                <MasterDataSelector
                  items={state.contractList}
                  titleDataGrid={LocalizedStrings.contract}
                  readOnly={storeIsReadOnlyForm}
                  displayExpr='contractNum'
                  idFieldName='contractID'
                  onValueChanged={(e:any)=>onSelectionChanged(e, 'selected_contract', "contractID", 'contractID')}
                  selectBoxValue={state.selected_contract}
                  height={formInputHeight}
                  details={state.selected_contract.contractID
                    ? { action: goContractCard(state.selected_contract.contractID )}
                    : undefined
                  }
                  onOpened={(e:any)=>onOpened(
                    e, 
                    getContractListFetch,
                    'contractList', 
                    'selected_contract',
                    'contractID',
                    'contractNum'
                  )}
                />
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