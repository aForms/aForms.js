import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";

export interface ContentModal {
    html?: string
}

export class ContentBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) {
    }

    build(): HTMLDivElement {
        const contentDiv = document.createElement('div');
        if (this.aFormModel?.customClass) {
            new ClassesHelper().addClasses(this.aFormModel?.customClass, contentDiv)
        }
        if (this.aFormModel.html) {
            contentDiv.innerHTML = (this.aFormModel.html as string)
        }
        return contentDiv
    }
}
