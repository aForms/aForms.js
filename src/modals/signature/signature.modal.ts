import {AFormModel, AFormModelClass} from "../../a-form.model";

export interface SignatureModal {
    footer?: string,
    width?: string,
    height?: string,
    penColor?: string,
    backgroundColor?: string,
    minWidth?: string,
    maxWidth?: string,
    protected?: boolean,
    persistent?: boolean,
}

export class SignatureBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }
}
