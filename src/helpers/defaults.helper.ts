import {AFormModel, AFormModelClass} from "../a-form.model";

export class DefaultsHelper {

    constructor(private aFormModelClass: AFormModelClass) {
    }

    setDefault(aFormModel: AFormModel) {
        return new Promise(resolve => {
            if (aFormModel?.defaultValue) {
                this.aFormModelClass.aFormHolder?.form('set value', aFormModel?.key, aFormModel?.defaultValue)
            } else if (aFormModel?.customDefaultValue) {
                this.aFormModelClass.aFormHolder?.form('set value', aFormModel?.key, aFormModel?.defaultValue)
            }
        })
    }

}
