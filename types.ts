
import BaseModel from "#src/data-models/BaseModel/BaseModel";
import contract from "#src/data-models/dictionaries/contract";
import currency from "#src/data-models/dictionaries/currency";
import partnerForTT from "#src/data-models/dictionaries/partnerForTT";
import User from "#src/data-models/dictionaries/user";
import user from "#src/data-models/dictionaries/user";

export type FormPageStore = {
  
  /**Объект модели, полученный из API */
  observableObject: BaseModel;

  /**переменные формы */
  form: {
    
    /**Режим формы */
    formMode: FORMMODE,

    /**Нажата кнопка сохранить форму */
    isSaveButtonOnClicked: boolean
  };

  SPOImport : SPOImportStore
}

export type SPOImportStore = {
  
  observableObject: BaseModel,
    
  /**Режим формы */
  formMode: FORMMODE,

  /**Нажата кнопка сохранить форму */
  isSaveButtonOnClicked: false,
}

export enum FORMMODE {
  UNDEFINED, // Неопределенно
  READONLY,  // Просмотр
  ADD,       // Добавление
  EDIT       // Редактирование
}

export type buyer = {
  factoryID: number;
  factoryName: string;
  factoryNameEng: string;
}

//Справочники из базы данных
export type FormDictionary = {

  //Перевозчик
  transporterList: Array<partnerForTT>;
  selected_transporter: partnerForTT;
  
  //Координатор
  coordinatorList: Array<User>;
  selected_coordinator: User;

  //Валюта
  currencyList: Array<currency>;
  selected_currency: currency;
}

export type FormDictionaryImport = {
  
  //Контракт
  contractList: Array<contract>;
  selected_contract: contract;

} & FormDictionary;

export type FormDictionaryExport = {

  //Покупатель
  buyerList: Array<buyer>,
  selected_buyer: buyer,

} & FormDictionary;