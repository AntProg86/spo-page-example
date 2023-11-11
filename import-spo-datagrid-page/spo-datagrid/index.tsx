import React, { useEffect, useContext, useState, useMemo, useCallback, useRef} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LocalizedStrings from '#src/components/language/localization';
import './styles.scss';

import localStorageKeys from '#src-ie-module/localStorageKeys.json';
import { AppContext } from '../../../application/context';
import { ActionMainLoadPanel, ActionMainLoadPanelHide, ActionMainLoadPanelMessage, ActionMainLoadPanelShow } from '#src/components/mainLoadPanel/reducer';
import { useHistory } from 'react-router';
import './styles.scss';
import {useLocation} from 'react-router-dom';
import DxButton from 'devextreme-react/button';
import DropDownButton from 'devextreme-react/drop-down-button';
import DataGrid, {
	Column, Editing, Paging, Pager,
	Grouping,
	GroupPanel,
	Scrolling, Sorting, LoadPanel,
	Selection,
	FilterRow,
	HeaderFilter,
	FilterPanel,
	SearchPanel,
	StateStoring,
	ColumnChooser,
	Export,
	Toolbar, Item,
} from 'devextreme-react/data-grid';
import {
	localStorageClear, // Очистка localStorage
	//dataGridOnRowPrepared, // Функция, которая выполняется после создания строки.
	loadState, // Загружаем состояние таблицы из LocalStorage
	saveState,
	dataGridOnRowPrepared,
	onCellClickCopyText, // Сохраняем состояние таблицы в LocalStorage
} from '#src/commonFunctions/commonActionFunctions';
import CustomStore from 'devextreme/data/custom_store';
import { getInputDOMValue } from '#src/commonFunctions/customStoreFunctions';

import { GetFileListByObjectIDList, onExporting } from "#src/commonFunctions/fileFunctions";

import {deleteSPOFetch, getSPOListFetch} from '#src-ie-module/containers/application/actions';
import { changePopupStore } from '#/src-ie-module/containers/popup/reducer';
import { TableSettingsDropDownButton } from '#src/pef-react-library/table-settings-drop-down-button';
import CopyCellTextGridButton from '#src/components/copyCellTextGridButton';
import { FORMMODE } from '../../types';
import { setFormModeImport } from '../../reducer';
import SPO from '#src/data-models/tl-models/SPO';
import { custom } from 'devextreme/ui/dialog';

type Props = {

};

type State = {
	isSelectedRowKeys: boolean, // Выбрана ли хотя бы одна строка таблицы
	selected_spo: SPO | any,
	//selectedRows: any; //Выбранные строки DataGrid
};

const SPODataGrid: React.FunctionComponent<Props> = () => {
	const Ref_Datagrid = useRef<any>(null);
	
	const history = useHistory();
	const _appContext = useContext(AppContext);
	const dispatch = useDispatch();
	const location = useLocation();

	const [state, changeState] = useState<State>(
    {
			isSelectedRowKeys: false,
			selected_spo: undefined,
    }
  );
	
	// Выбор строки таблицы
	const selectionChangeHandle = (e: any) => {
		
		let data = e.selectedRowsData;

		//console.log('*-*-*-*-*selectedRows');
		//console.log(data);
		
		if (data.length > 0){
			changeState((state) => ({
				...state,
				isSelectedRowKeys: true,
			}))

			if(data.length === 1){
				changeState((state) => ({
					...state,
					selected_interDelivery: data[0]
				}))
			}
			else{
				changeState((state) => ({
					...state,
					selected_interDelivery: undefined,
				}))
			}
			
		}
		else{
			changeState((state) => ({
				...state,
				isSelectedRowKeys: false,
				selected_interDelivery: undefined,
			}))
		}
	};
	
  //Установить значения в «redux» по умолчанию, после ухода со страницы
	useEffect(() => {

		return () => {
			// Очищаем сообщение 
			dispatch(ActionMainLoadPanelMessage(''));
			// Скрываем индикацию загрузки на весь экран
			dispatch(ActionMainLoadPanelShow(false));
		}
	}, []);

  // Колбэк загрузки данных для CustomStore
	const loadData = (loadOptions:any) => {

		//Контроллер для обработки отмены запроса
		const controller = new AbortController();
		const signal = controller.signal;

		//Сообщение для индикации загрузки на весь экран
		dispatch(ActionMainLoadPanel({
			isVisible: true,
			isPopup: true,
			message: LocalizedStrings.loading_ccds,
			abortController: controller
		}));

		// Получаем accessToken и список SPO по флагу isExport
		return _appContext.doFetch(getSPOListFetch, {isExport: 0}, {signal})
			.then((data: any) => {
				const { payload, error } = data
        
        // console.log('-*-*-*-**payload');
        // console.log(payload);
				
				// Скрываем индикатор загрузки
				dispatch(ActionMainLoadPanelHide());

				//Если запрос не был прерван
				if (!signal.aborted && payload) {
					return payload
				//Если запрос был прерван, то выбрасываем ошибку (в этом случае данные внутри store не сбрасываются)
				} else if (signal.aborted) {
					throw new Error(LocalizedStrings.request_was_successfully_aborted)
				} else if (error) {
					throw new Error(error.message)
				}

			})
	};

  // Колбэк для подготовки данных, выполняется непосредственно перед load.
	// Нужен для извлечения значений, которые используются при отправке запроса
	const onLoadingData = (loadOptions: any) => {

	};
  
  // Инициализируем customStore
	const store = useMemo(() => createCustomDataSource(loadData, onLoadingData), []);
  
  //Загрузка данных (вызов load) и перерисовка датагрида
	const refreshDataGrid = () => {
		Ref_Datagrid.current?.instance.refresh();
	};

	const addSPOImport = () => {
		dispatch(setFormModeImport(FORMMODE.ADD));
		
		history.push({
			pathname:`/SPOFormImportPage/id=${0}`,
			state: {from: location},
		})
	};

	const dataErrorHandler = (e:any) => {
		Ref_Datagrid.current?.instance.option("errorRowEnabled", true);
		if (e.error.message === LocalizedStrings.request_was_successfully_aborted) {
			//Если ошибка произошла из-за отмены запроса, то строка об ошибке не отображается
			Ref_Datagrid.current?.instance.option("errorRowEnabled", false);
		}
	};

	const onOpenClickHandler = (rowData: any) => {
		
    dispatch(setFormModeImport(FORMMODE.READONLY));
		
		history.push({
			pathname:`/SPOFormImportPage/id=${rowData.data.spoid}`,
			state: {from: location},
		})
	};

	//Удаление международных поставок (транспортных документов)
	const deleteSPO = (spoIDList: string, NumberList: string) => {
		
		/*диалог подтверждения удаления*/
		let confirmDialog = custom({
			showTitle:false,
			messageHtml: `<div>${LocalizedStrings.are_you_sure_delete} № ${NumberList}? </div>`,
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
				_appContext.doFetch(deleteSPOFetch, {spoIDList: spoIDList})
				.then((data:any) => {   
					const {payload, error} = data;
					
					if (payload){
						//console.log('*-*-*-*-*payload');
						//console.log(payload);
					}
					
					// Очищаем сообщение
					dispatch(ActionMainLoadPanelMessage(''));
					// Скрываем индикацию загрузки на весь экран
					dispatch(ActionMainLoadPanelShow(false));

					refreshDataGrid();
				});
			}
		});
	};

	// Удаление выделенных строк
	const deleteObjects = () => {
		const grid = Ref_Datagrid.current?.instance;
		const rowsData = grid.getSelectedRowsData();
		
		if(rowsData && rowsData.length > 0){
			const ObjectsID = rowsData.map((item:any) => { return item.spoid }).join(",");	
			const ObjectsNumber = rowsData.map((item:any) => { return item.sap }).join(", ");

			deleteSPO(ObjectsID, ObjectsNumber)
		}
	};

	const getDropDownButtonItems = (dataRow: any) => {
    return [
			{ id: 1, text: LocalizedStrings.open, stylingMode: "text", icon: "arrowright" },
			{ id: 2, text: LocalizedStrings.delete, stylingMode: "text", icon: "trash"},
		]
  };

	const onDeleteClickHandler = (rowData:any) => {
		deleteSPO(rowData.data.spoid, rowData.data.sap)
	};

	const dropDownEditButtonsAction = (e: any, rowData: any) => {

		switch (e.itemData.id) {
			case 1:
				onOpenClickHandler(rowData);
				break;
			case 2:
				onDeleteClickHandler(rowData);
				break;
		};
	};

	const editDropDownButtonAttributes = {
		class: 'dropdown-buttons-icon-style'
	};

	const onEditClickHandler = (rowData:any) => {
		dispatch(setFormModeImport(FORMMODE.EDIT));

		history.push({
			pathname:`/SPOFormImportPage/id=${rowData.data.spoid}`,
			state: {from: location},
		})
	};

	const renderGridCell = (data: any) => {

		const Items = getDropDownButtonItems(data)

		return (
			<div className="datagrid_edit_column_custom_icon_style">
				<DxButton
					className="datagrid_cell_edit_button"
					hint={''}
					icon="edit"
					stylingMode="text"
					hoverStateEnabled={false}
					//visible = {IS_ACCESS?.WB?.canWrite}
					onClick={() => onEditClickHandler(data)}
				/>

				<DropDownButton
					className="datagrid_cell_edit_button"
					icon="more"
					items={Items}
					dropDownOptions={{ width: '420' }}
					onItemClick={(e) => dropDownEditButtonsAction(e, data)}
					stylingMode="text"
					hoverStateEnabled={false}
					showArrowIcon={false}
					displayExpr="text"
					keyExpr="id"
					elementAttr={editDropDownButtonAttributes}>
				</DropDownButton>
			</div>
		)
	}
  
  return (
    <>
      <DataGrid
				elementAttr={{
					id: 'IE_TL_ImportSPODataGridid',
					class: 'dataGridClass',
				}}

				dataSource={store}

				ref={Ref_Datagrid}
				columnAutoWidth={true}
				// Минимальный размер столбца для всей страницы
				columnMinWidth={30}
				/*Включение resize столбцов*/
				allowColumnResizing={true}
				columnResizingMode={'widget'}

				// Включаем возможность перегруппировать столбцы
				allowColumnReordering={true}

				showBorders={true} // Показываем границы таблицы
				showRowLines={true} // Разделяем строки таблицы линиями

				onRowPrepared={useCallback((e: any) => dataGridOnRowPrepared(e), [])} // Событие готовности строки

				onRowDblClick={onOpenClickHandler}
				onSelectionChanged={selectionChangeHandle} // Обработчик изменения выбранной строки
				
        //Export в excel
        onExporting={(e) => onExporting(e, Ref_Datagrid.current?.instance, 'SPO Import')}
				
        //onRowRemoved={deleteIconClick}
				//onEditingStart={onEditingStart}//выполняется перед переводом строки или ячейки в режим редактирования
				onDataErrorOccurred={dataErrorHandler}
				onCellClick={(e) => onCellClickCopyText(e, _appContext.CONSTANTS?.App)}
			>
        <LoadPanel enabled={false} />
				<Scrolling useNative='false' />

				<Grouping
					contextMenuEnabled={true}
					autoExpandAll={true}
				/>

				{/* Убрать текст "Drag a column header here to group by that column" */}
				<GroupPanel
					//allowColumnDragging={false}
					visible={true}
				/>

				<Paging
					defaultPageSize={15} // Строк на странице по умолчанию
				/>

        <StateStoring
					enabled={true}
					type="custom"
					customLoad={useCallback(() => loadState(localStorageKeys.IE_TL_SPOimportDataGrid), [])}
					customSave={useCallback((e: any) => saveState(e, localStorageKeys.IE_TL_SPOimportDataGrid), [])}
					savingTimeout={5}
				/>

				<Pager
					visible={true}
					allowedPageSizes={[10, 15, 20, 50, 'all']}
					displayMode={'full'}
					showPageSizeSelector={true} // Показать Pager с выбором количества строк на странице
					showInfo={true} // Показывать информацию рядом с выбором страниц таблицы о количестве item
					showNavigationButtons={true} // Показывать стрелки вправо и влево рядом с выбором страниц таблицы
				/>

        <ColumnChooser enabled={true} />

        <Toolbar>
          
          <Item location='before'
						name="groupPanel"
					/>

          <Item location='after'>
						<DxButton
							icon='refresh'
							hint={LocalizedStrings.refresh}
							onClick={refreshDataGrid}
						/>
					</Item>

          <Item location='after'>
						<DxButton
							icon='add'
							hint={LocalizedStrings.add_SPO_import}
							onClick={addSPOImport}
						/>
					</Item>

					<Item location='after'>
						<CopyCellTextGridButton 
							_appContext = {_appContext}
						/>
					</Item>
					
          <Item location='after'>
						<DxButton
							icon='xlsxfile'
							hint={LocalizedStrings.export_to_excel}
							onClick={(e) => onExporting(e, Ref_Datagrid.current?.instance, 'SPO Import')}
						/>
					</Item>

					<Item>
						<DxButton
							icon='trash'
							onClick={deleteObjects}
							hint={LocalizedStrings.delete}
							disabled={!state.isSelectedRowKeys}
						/>
					</Item>
          
          <Item location='after'>
						<TableSettingsDropDownButton
							localStorageKey={localStorageKeys.IE_TL_SPOimportDataGrid}
							Ref_DataGrid={Ref_Datagrid}
							changePopupAction={changePopupStore}
							_appContext={_appContext}
						/>
					</Item>

					<Item location='after'
						name="searchPanel"
					/>
          
        </Toolbar>

				{/* Подключаем поиск в тулбар */}
				<SearchPanel visible={true} />
				{/* Подключаем фильтр где можно выбрать "contains, equals и т.д." */}
				<FilterRow visible={true} />
				{/* Подключаем фильтр с check points */}
				<HeaderFilter visible={true} />
				{/* Подключаем конструктор фильтра */}
				<FilterPanel visible={true} />
				{/* Возможность выбора строки (к) */}
				<Selection
					mode="multiple" />

				<Sorting mode="multiple" />

				<Column
					type="save"
					width={64}
					cssClass="grid-edit-column"
					allowResizing={false}
					fixed={true}
					cellRender={renderGridCell}

				>
				</Column>

        {/* -----------Номер--------*/}
				<Column
					caption={LocalizedStrings.number}
					//width={'5%'}
					allowEditing={false}
					dataField="sap"
					name="sap"
					dataType="string"
				>
				</Column>

        {/* -----------Создан--------*/}
				<Column
					caption={LocalizedStrings.created}
					//width={'5%'}
					allowEditing={false}
					dataField="spoDate"
					name="spoDate"
					dataType="date"
				>
				</Column>

        {/* -----------Контракт--------*/}
				<Column
					caption={LocalizedStrings.contract}
					//width={'5%'}
					allowEditing={false}
					dataField="contractNum"
					name="contractNum"
					dataType="string"
				>
				</Column>

        {/* -----------Валюта--------*/}
				<Column
					caption={LocalizedStrings.currency}
					//width={'5%'}
					allowEditing={false}
					dataField="currencyCode"
					name="currencyCode"
					dataType="string"
				>
				</Column>

        {/* -----------Координатор--------*/}
				<Column
					caption={LocalizedStrings.coordinator_1}
					//width={'5%'}
					allowEditing={false}
					dataField="coordinatorName"
					name="coordinatorName"
					dataType="string"
				>
				</Column>

        {/* -----------Перевозчик--------*/}
				<Column
					caption={LocalizedStrings.transporter_1}
					//width={'5%'}
					allowEditing={false}
					dataField="partner"
					name="partner"
					dataType="string"
				>
				</Column>

        {/* -----------Покупатель--------*/}
				<Column
					caption={LocalizedStrings.customer}
					//width={'5%'}
					allowEditing={false}
					dataField="factoryName"
					name="factoryName"
					dataType="string"
				>
				</Column>
        
      </DataGrid>
    </>
  );
};

const createCustomDataSource = (load: any, onLoading: any) => {

	return new CustomStore({
		key: 'spoid',
		load,
		onLoading,
	});
}

export default React.memo(SPODataGrid);