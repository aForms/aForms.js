import {AFormModel, AFormModelClass} from "../../../a-form.model";

export interface ColumnsModal {
    columns?: AFormModel[]
}

export class ColumnsBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }
}
