import {LabelValue} from "../select/select.modal";
import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";

// @ts-ignore
import { v4 as uuidV4 } from 'uuid';

declare var $: JQueryStatic;

export class RadioModal {
    values?: RadioValues[]|LabelValue[]
}

export interface RadioValues extends LabelValue {
    shortcut?: string;
}

export class RadioBuilder {

    wrapper: HTMLDivElement | undefined;

    options: any | undefined;

    constructor(private radioModal: AFormModel, private aFormClass: AFormModelClass) { }

    build(options?: any) {
        const uuid = uuidV4();
        this.wrapper = document.createElement('div');
        if (options) {
            this.options = options
        }
        this.wrapper.classList.add('fields');
        this.wrapper.setAttribute('role', 'radiogroup')
        this.wrapper.setAttribute('aria-labelledby', uuid)
        if (this.radioModal?.customClass) {
            new ClassesHelper().addClasses(this.radioModal?.customClass, this.wrapper)
        }
        if (this.radioModal?.inline) {
            this.wrapper.classList.add('inline');
        }
        if (this.radioModal.key) {
            if (this.radioModal?.label) {
                const label = document.createElement('label')
                label.setAttribute('for', this.radioModal.key)
                label.setAttribute('id', uuid);
                label.innerText = this.radioModal?.label as string
                const infoIcon = document.createElement('i')
                infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
                infoIcon.tabIndex = 0
                infoIcon.setAttribute('data-content', 'This is a test data content.')
                label.append(infoIcon)
                this.wrapper.append(label)
            }
            this.addRadioFields();
            $(this.wrapper).find('.checkbox').checkbox();
        }
        return this.wrapper
    }

    private addRadioFields() {
        this.radioModal?.values?.forEach((value: RadioValues) => {
            const uuid = uuidV4();
            const field = document.createElement('div')
            field.classList.add('field')
            const radioDiv = document.createElement('div')
            radioDiv.classList.add('ui', 'radio', 'checkbox')
            radioDiv.setAttribute('role', 'radio')
            const radioInput = document.createElement('input')
            radioInput.type = 'radio'
            radioInput.name = this.radioModal?.key as string
            radioInput.tabIndex = 0;
            radioInput.classList.add('hidden')
            radioInput.value = value.value as string
            radioInput.setAttribute('id', uuid)
            const radioLabel = document.createElement('label')
            radioLabel.innerText = value.label as string
            radioLabel.setAttribute('for', uuid)
            radioDiv.append(radioInput)
            radioDiv.append(radioLabel)
            field.append(radioDiv)
            this.wrapper?.append(field)
        })
    }
}
