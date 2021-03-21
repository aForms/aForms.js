import {AFormModel, AFormModelClass} from "../../a-form.model";

export interface ContentModal {
    html?: string
}

export class ContentBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }
}
