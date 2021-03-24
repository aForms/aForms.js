import {configureStore} from '@reduxjs/toolkit'
import {counterSlice} from "./reducers/counter.reducer";
// @ts-ignore
import { v4 as uuidV4 } from 'uuid';

export const { incremented, decremented } = counterSlice.actions


export class ConfigureStore {

    constructor(private formId: string) { }

    init() {
        if (!this.formId) {
            this.formId = uuidV4()
        }
        return configureStore({
            reducer: {
                [this.formId]: counterSlice.reducer
            },
            devTools: {
                name: this.formId,
                trace: true
            }
        })
    }

}
