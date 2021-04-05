import {AFormModel, AFormModelClass} from "../a-form.model";

export class DefaultsHelper {

    constructor(private aFormModelClass: AFormModelClass) { }

    setDefault(aFormModel: AFormModel) {
        return new Promise(resolve => {
            if (aFormModel?.defaultValue) {
                this.aFormModelClass?.setFormData(aFormModel?.defaultValue, aFormModel?.key)
            } else if (aFormModel?.customDefaultValue) {
                this.aFormModelClass?.setFormData(aFormModel?.defaultValue, aFormModel?.key)
            }
        })
    }

}
