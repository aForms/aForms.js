import {LabelValue} from "../select/select.modal";
import {AFormModel, AFormModelClass, Mode} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";

// @ts-ignore
import {v4 as uuidV4} from 'uuid';
import {getFormById, updateFormData} from "../../store/reducers/form-data.reducer";
import {ConditionalHelper} from "../../helpers/conditional.helper";
import {MutationHelper} from "../../helpers/mutation.helper";
import {Component} from "../../config/component.enum";

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

    showViewMode = false

    errorMutationObserver = new MutationHelper().errorRadioMutation

    constructor(private radioModal: AFormModel, private aFormClass: AFormModelClass, private formComponent?: HTMLDivElement) {

        if (formComponent) {
            formComponent.append(this.build())
        }

        const selectStoreSubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.isVisible = new ConditionalHelper().checkCondition(this.radioModal?.conditional?.json, data)
            if (this.wrapper) {
                this.processConditionalLogic()
            }
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.processConditionalLogic()
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
        if (this.radioModal.key) {
            if (this.radioModal?.label) {
                const label = document.createElement('label')
                label.classList.add('a-form-label-radio')
                label.setAttribute('for', this.radioModal.key)
                label.setAttribute('id', uuid);
                label.innerText = this.radioModal?.label as string
                this.wrapper.append(label)
            }
            if (this.radioModal.tooltip) {
                const tooltipWrapperDiv = this.aFormClass.validationHelper.createToolTip(this.radioModal, this.wrapper)
                this.wrapper.append(tooltipWrapperDiv)
                this.aFormClass.validationHelper.initializeTooltip(this.wrapper, tooltipWrapperDiv)
            }
            this.addRadioFields();
            $(this.wrapper).find('.checkbox').checkbox()
            if (this.radioModal?.validate?.required) {
                this.wrapper.setAttribute('aria-required', 'true')
            }

            this.errorMutationObserver.observe(this.wrapper, {attributes: true})

        }

        this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.radioModal?.conditional?.json, data)
        if (!this.isVisible || this.radioModal.hidden) {
            // Clear on hide to ensure value gets cleared when hidden
            if (this.radioModal.clearOnHide) {
                $(this.wrapper)
                    .find('.checkbox')
                    .checkbox('uncheck')
            } else {
                this.aFormClass.validationHelper.calculatedValue(this.radioModal)
            }
            $(this.wrapper).hide()
        } else {
            this.aFormClass.validationHelper.calculatedValue(this.radioModal)
        }

        this.aFormClass.modeSubject.asObservable().subscribe(value => {
            switch (value) {
                case Mode.EDIT:
                    $(this.wrapper)
                        .find('.checkbox')
                        .checkbox('set enabled')
                    break
                case Mode.VIEW:
                    $(this.wrapper)
                        .find('.checkbox')
                        .checkbox('set disabled')
                    break
            }
        })
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
            radioDiv.onchange = (e) => {
                const value = (e.target as HTMLInputElement).defaultValue
                this.aFormClass.formManager.form('set value', this.radioModal.key, value)
                const storeData = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId)?.data
                this.aFormClass.store.dispatch(
                    updateFormData({id: this.aFormClass.uniqFormId, data: {...storeData, ...{[this.radioModal?.key as string]: value}}}))
            }
            wrapperDiv?.append(radioDiv)
        })
        if (this.radioModal?.inline) {
            wrapperDiv.classList.add('inline');
        }
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

    processConditionalLogic() {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data

        if (this.radioModal.hidden) {
            const conditional = this.aFormClass.conditionalHelper.checkJustCondition(this.radioModal?.conditional?.json, data)
            if (conditional  || this.radioModal?.conditional?.json === undefined || this.radioModal?.conditional?.json === null) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.radioModal.clearOnHide) {
                    // $(this.wrapper)
                    //     .find('.checkbox')
                    //     .checkbox('uncheck')
                } else {
                    this.aFormClass.validationHelper.calculatedValue(this.radioModal)
                }
            }
        } else {
            this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.radioModal?.conditional?.json, data)
            if (!this.isVisible) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.radioModal.clearOnHide) {
                    // $(this.wrapper)
                    //     .find('.checkbox')
                    //     .checkbox('uncheck')
                } else {
                    if (this.radioModal.defaultValue) {
                        this.aFormClass.formManager.form('set value', this.radioModal.key, this.radioModal.defaultValue)
                    }
                    this.aFormClass.validationHelper.calculatedValue(this.radioModal)
                }
                $(this.wrapper).hide()
                this.removeValidation()
            } else {
                if (this.radioModal.defaultValue) {
                    this.aFormClass.formManager.form('set value', this.radioModal.key, this.radioModal.defaultValue)
                }
                this.aFormClass.validationHelper.calculatedValue(this.radioModal)
                this.addValidation()
                $(this.wrapper).fadeIn()
            }
        }
    }
}
