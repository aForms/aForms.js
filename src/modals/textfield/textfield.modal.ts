import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel, AFormModelClass, FormEvents} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";
import {DefaultsHelper} from "../../helpers/defaults.helper";
import {incremented} from "../../store";

export interface TextfieldModal extends TextCommonModal {
    inputFormat?: string
}

export interface TextOptions {
    type?: string
}

export class TextfieldBuilder {

    defaults: DefaultsHelper = new DefaultsHelper(this.aFormClass)

    wrapper: HTMLDivElement = document.createElement('div');

    options: TextOptions = {};

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

    build(options?: TextOptions): HTMLDivElement {
        this.wrapper = document.createElement('div');
        if (options) {
            this.options = options
        }
        this.wrapper.classList.add('field');
        if (this.textComponent?.customClass) {
            new ClassesHelper().addClasses(this.textComponent?.customClass, this.wrapper)
        }
        // create label
        const label = document.createElement('label');
        label.innerText = (this.textComponent.label as string)
        const infoIcon = document.createElement('i')
        infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
        infoIcon.tabIndex = 0
        infoIcon.setAttribute('data-content', 'This is a test data content.')
        label.append(infoIcon)
        this.wrapper.append(label)
        const input = document.createElement('input')
        input.placeholder = (this.textComponent.placeholder as string)
        input.name = (this.textComponent.key as string)
        input.type = options?.type ? options?.type : "text"
        input.tabIndex = this.textComponent?.tabindex ? Number(this.textComponent?.tabindex) : 0
        input.onchange = (ev) => {
            this.aFormClass.store.dispatch(incremented())
        }
        label.append(input)
        return this.wrapper
    }

    private checkConditionals(value: FormEvents, textComponent: AFormModel) {
        if (value?.details?.key === textComponent?.conditional?.when) {
            if (textComponent?.conditional?.when === "true" && textComponent?.conditional?.eq === "Amarnath") {
                this.wrapper.remove()
            }
        }
    }
}
