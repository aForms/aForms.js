import {createEntityAdapter, createSlice, EntityState, PayloadAction} from "@reduxjs/toolkit";
import undoable from 'redux-undo';

export interface FormData {
    id: string,
    data?: any,
    currentPage?: number
}

const formDataAdapter = createEntityAdapter<FormData>()

export const formDataSlice = createSlice({
    name: 'formsData',
    initialState: formDataAdapter.getInitialState(),
    reducers: {
        insertFormData: formDataAdapter.addOne,
        updateFormData: (state, payload: PayloadAction<FormData>) => {
            formDataAdapter.upsertOne(state, {...getFormById(state, payload.payload.id), ...payload.payload})
        }
    }
})

export const {insertFormData, updateFormData} = formDataSlice.actions

export const getFormById = (state: EntityState<FormData>, id: string) => {
    return formDataAdapter.getSelectors().selectById(state, id)
}

// export const undoableFormDataReducers = undoable(formDataSlice.reducer)

