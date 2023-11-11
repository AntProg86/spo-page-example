import { createSlice } from '@reduxjs/toolkit';

import { FORMMODE } from './types';
import BaseModel from '#src/data-models/BaseModel/BaseModel';
import { getSPOFetch } from '../application/actions';
import SPO from '#src/data-models/tl-models/SPO';

const POSSlice = createSlice({
  name: 'POSPage',
  initialState: {

    /**Объект модели, полученный из API */
    observableObject: new BaseModel(),

    form: {
    
      /**Режим формы */
      formMode: FORMMODE.READONLY,
  
      /**Нажата кнопка сохранить форму */
      isSaveButtonOnClicked: false,
      
    },

    SPOImport : {
      observableObject: new BaseModel(),
      
      /**Режим формы */
      formMode: FORMMODE.READONLY,
  
      /**Нажата кнопка сохранить форму */
      isSaveButtonOnClicked: false,
    }
  },
  reducers: {
    setDefaultStore: (state) => {
      return {
        ...state,
        observableObject: new BaseModel(),
        form: {
          ...state.form,
          formMode: FORMMODE.READONLY,
          isSaveButtonOnClicked: false,
        },
        SPOImport:{
          ...state.SPOImport,
          observableObject: new BaseModel(),
          formMode: FORMMODE.READONLY,
          isSaveButtonOnClicked: false,
        }
        
      }
    },
    setDefaultStoreImport: (state) => {
      return {
        ...state,
        SPOImport:{
          ...state.SPOImport,
          observableObject: new BaseModel(),
          formMode: FORMMODE.READONLY,
          isSaveButtonOnClicked: false,
        }
        
      }
    },
    setObservableObjectImportExport: (state, action) => {
      
      if(action.payload.isExport === true){
        return {
          ...state,
          observableObject: action.payload
        }
      }
      else{
        return {
          ...state,
          SPOImport:{
            ...state.SPOImport,
            observableObject: action.payload
          }
        }
      }
    },
    setIsSaveButtonOnClicked: (state, action) => {
      return {
        ...state,
        form:{
          ...state.form,
          isSaveButtonOnClicked: action.payload,
        }
      }
    },
    setIsSaveButtonOnClickedImport: (state, action) => {
      return {
        ...state,
        SPOImport:{
          ...state.SPOImport,
          isSaveButtonOnClicked: action.payload
        }
      }
    },
    setFormMode: (state, action) => {
      return {
        ...state,
        form:{
          ...state.form,
          formMode: action.payload,
        }
      }
    },
    setFormModeImport: (state, action) => {
      return {
        ...state,
        SPOImport:{
          ...state.SPOImport,
          formMode: action.payload,
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(
      getSPOFetch.fulfilled,
      (state,  { meta: { arg }, payload }) => {
        
        //пришла импортная SPO
        if(payload.isExport === false){
          return {
            ...state,
            SPOImport: {
              ...state.SPOImport,
              observableObject: payload
            }
          };  
        }
        
        //пришла экспортная SPO
        return {
          ...state,
          observableObject: payload,
        };
      },
    )
  },
});

export const { 
  setDefaultStore,
  setIsSaveButtonOnClicked,
  setFormMode,
  setFormModeImport,
  setIsSaveButtonOnClickedImport,
  setDefaultStoreImport,
  setObservableObjectImportExport,
} = POSSlice.actions;

export default POSSlice;
