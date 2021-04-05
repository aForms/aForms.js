import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface FormsConfig {
    name: string,
    createdOn: string,
    lastUpdated: string
}

export const formConfig = createSlice({
    name: "configuration",
    initialState: {} as FormsConfig,
    reducers: {
        configAdded: (state, payload: PayloadAction<FormsConfig>) => {
            return payload.payload
        }
    }
})

export const { configAdded } = formConfig.actions
