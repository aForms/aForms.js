import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel} from "../../a-form.model";

export interface TextareaModal extends TextCommonModal {
    autoExpand?: boolean
}

export class TextareaBuilder {

    constructor(private textComponent: AFormModel) { }

    build(): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.classList.add('field');

        // create label
        const label = document.createElement('label');
        label.innerText = (this.textComponent.label as string)
        wrapper.append(label)
        const textarea = document.createElement('textarea')
        if (this.textComponent?.placeholder) {
            textarea.placeholder = (this.textComponent.placeholder as string)
        }
        textarea.name = (this.textComponent.key as string)
        label.append(textarea)
        return wrapper
    }

}
