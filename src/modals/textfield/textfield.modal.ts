import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel} from "../../a-form.model";

export interface TextfieldModal extends TextCommonModal {
    multiple?: boolean
}

export class TextfieldBuilder {

    constructor(private textComponent: AFormModel) { }

    build(): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.classList.add('field');

        // create label
        const label = document.createElement('label');
        label.innerText = (this.textComponent.label as string)
        wrapper.append(label)
        const input = document.createElement('input')
        input.placeholder = (this.textComponent.placeholder as string)
        input.name = (this.textComponent.key as string)
        input.type = "text"
        label.append(input)
        return wrapper
    }

}
