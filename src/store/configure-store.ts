import {configureStore} from '@reduxjs/toolkit'
import {formDataSlice} from "./reducers/form-data.reducer";
// @ts-ignore
import {v4 as uuidV4} from 'uuid';
import {formConfig} from "./reducers/form-config.reducer";
import {AFormModelClass} from "../a-form.model";

export const {} = formDataSlice.actions

export class ConfigureStore {

    initialState = {
        formData: formDataSlice.reducer,
        configuration: formConfig.reducer,
    }

    constructor(private aFormClass: AFormModelClass) { }

    configureStore() {
        return configureStore({
            reducer: this.initialState,
            devTools: {
                name: this.aFormClass.uniqFormId,
                trace: true
            }
        })
    }
}
