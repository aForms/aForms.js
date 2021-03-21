import {AFormModel, AFormModelClass} from "../../a-form.model";

export interface SurveyModal {
    questions?: {value?: any, label?: string}[]
    values?: {value?: any, label?: string}[]
}

export class SurveyBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }
}
