import {AFormModel, AFormModelClass} from "../../a-form.model";
import {LabelValue} from "../select/select.modal";
import {RadioValues} from "../radio/radio.modal";

export interface SurveyModal {
    questions?: LabelValue[]
    values?: LabelValue[]|RadioValues[]
}

export class SurveyBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }
}
