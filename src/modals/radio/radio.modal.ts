import {LabelValue} from "../select/select.modal";
import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";

// @ts-ignore
import { v4 as uuidV4 } from 'uuid';
import {getFormById} from "../../store/reducers/form-data.reducer";
import {ConditionalHelper} from "../../helpers/conditional.helper";

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

    isVisible = true

    constructor(private radioModal: AFormModel, private aFormClass: AFormModelClass) {

        const selectStoreSubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.isVisible = new ConditionalHelper().checkCondition(this.radioModal?.conditional?.json, data)
            if (this.wrapper) {
                if (this.isVisible) {
                    $(this.wrapper).fadeIn()
                    this.addValidation()
                    this.aFormClass.validationHelper.calculatedValue(this.radioModal)
                } else {
                    $(this.wrapper).fadeOut()
                    this.removeValidation()
                }
            }
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.isVisible ? this.addValidation() : this.removeValidation()
            }
        }))

        this.aFormClass.removableSubscribers.push(selectStoreSubscriber)

    }

    build(options?: any) {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
        const uuid = uuidV4();
        this.wrapper = document.createElement('div');
        // this.wrapper.tabIndex = -1
        if (options) {
            this.options = options
        }
        this.wrapper.classList.add('grouped', 'fields', 'field');
        this.wrapper.setAttribute('role', 'radiogroup')
        this.wrapper.setAttribute('aria-labelledby', uuid)
        this.aFormClass.validationHelper.addFocusEvent(this.wrapper)
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
                this.wrapper.append(label)
            }
            if (this.radioModal.tooltip) {
                const toolTip = this.aFormClass.validationHelper.createToolTip(this.radioModal, this.wrapper)
                this.wrapper.append(toolTip)
            }
            this.addRadioFields();
            $(this.wrapper)
                .find('.checkbox')
                .checkbox()
            $(this.wrapper)
                .find('.checkbox').on('change', () => {
                    this.aFormClass.notifyChanges(this.radioModal.key as string)
            })

        }

        this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.radioModal?.conditional?.json, data)
        if (!this.isVisible) {
            $(this.wrapper).hide()
        } else {
            this.aFormClass.validationHelper.calculatedValue(this.radioModal)
        }

        return this.wrapper
    }

    private addRadioFields() {
        const wrapperDiv = document.createElement('div')
        wrapperDiv.style.display = "block"
        this.radioModal?.values?.forEach((value: RadioValues) => {
            const uuid = uuidV4();
            const radioDiv = document.createElement('div')
            radioDiv.classList.add('ui', 'radio', 'checkbox')
            radioDiv.style.padding = "5px"
            radioDiv.style.borderRadius = '3px'
            this.aFormClass.validationHelper.addFocusEvent(radioDiv)
            const radioInput = document.createElement('input')
            radioInput.type = 'radio'
            radioInput.name = this.radioModal?.key as string
            radioInput.value = value.value as string || ""
            radioInput.setAttribute('id', uuid)
            const radioLabel = document.createElement('label')
            radioLabel.innerText = value.label as string
            radioLabel.setAttribute('for', uuid)
            radioDiv.append(radioInput)
            radioDiv.append(radioLabel)
            wrapperDiv?.append(radioDiv)
        })
        // this.wrapper?.addEventListener('onInvalid', (e) => {
        //     console.log("THers an error  ", e)
        // })
        this.wrapper?.append(wrapperDiv)
    }

    addValidation() {
        const validation = this.aFormClass.validationHelper.prepareValidation(this.radioModal)
        if (this.radioModal.validate?.required) {
            this.wrapper?.classList.add('required');
        }
        this.aFormClass.formManager.form('add rule', this.radioModal.key, { on: 'blur', rules: validation })
    }

    removeValidation() {
        $('#' + this.aFormClass.uniqFormId).form('remove field', this.radioModal.key)
    }
}
