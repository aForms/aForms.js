import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";
import {DefaultsHelper} from "../../helpers/defaults.helper";

export interface TextareaModal extends TextCommonModal {
    autoExpand?: boolean
}

export class TextareaBuilder {

    defaults: DefaultsHelper = new DefaultsHelper(this.aFormClass)

    constructor(private textComponent: AFormModel, private aFormClass: AFormModelClass) {
        this.defaults = new DefaultsHelper(this.aFormClass)

        this.aFormClass.notifyFormEvents.asObservable().subscribe((value) => {
            switch (value.eventName) {
                case "rendered":
                    // Add defaults
                    this.defaults.setDefault(this.textComponent)
                    break;
            }
        })
    }

    build(): HTMLDivElement {
        const wrapper = document.createElement('div');
        wrapper.classList.add('field');
        wrapper.tabIndex = this.textComponent?.tabindex ? Number(this.textComponent?.tabindex) : 0
        if (this.textComponent?.customClass) {
            new ClassesHelper().addClasses(this.textComponent?.customClass, wrapper)
        }

        // create label
        const label = document.createElement('label');
        label.innerText = (this.textComponent.label as string)
        const infoIcon = document.createElement('i')
        infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
        infoIcon.tabIndex = 0
        infoIcon.setAttribute('data-content', 'This is a test data content.')
        label.append(infoIcon)
        wrapper.append(label)
        const textarea = document.createElement('textarea')
        if (this.textComponent?.placeholder) {
            textarea.placeholder = (this.textComponent.placeholder as string)
        }
        textarea.name = (this.textComponent.key as string)
        textarea.tabIndex = this.textComponent?.tabindex ? Number(this.textComponent?.tabindex) : 0
        textarea.onchange = (ev) => {
            this.aFormClass.notifyFormEvents.next({
                eventName: 'change',
                details: {
                    eventInfo: ev,
                    key: (this.textComponent.key as string),
                    value: textarea.value
                }
            })
        }
        label.append(textarea)
        return wrapper
    }

}
