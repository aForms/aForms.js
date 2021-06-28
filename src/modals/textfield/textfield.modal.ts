import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel, AFormModelClass, Mode} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";
import {DefaultsHelper} from "../../helpers/defaults.helper";
import {getFormById, updateFormData} from "../../store/reducers/form-data.reducer";
import {ConditionalHelper} from "../../helpers/conditional.helper";
// @ts-ignore
import {v4 as uuidV4} from 'uuid';
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {MutationHelper} from "../../helpers/mutation.helper";

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

    initialLoad = true

    isVisible = true

    errorMutationObserver = new MutationHelper().errorMutationObserver

    textInputElement: HTMLInputElement = document.createElement('input');

    constructor(private textComponent: AFormModel, private aFormClass: AFormModelClass, private formComponent?: HTMLDivElement) {
        if (formComponent) {
            formComponent.append(this.build())
        }
        const textVisibilitySubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.wrapper?.querySelector('.ui.icon.input')?.classList.add('loading')
            this.isVisible = new ConditionalHelper().checkCondition(this.textComponent?.conditional, data)
            if (this.wrapper) {
                this.processConditionalLogic(true)
            }
            this.wrapper?.querySelector('.ui.icon.input')?.classList.remove('loading')
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.processConditionalLogic();
            }
        }))
        this.aFormClass.removableSubscribers.push(textVisibilitySubscriber)
    }

    build(options?: TextOptions): HTMLDivElement {
        this.wrapper = document.createElement('div');
        this.textComponentRenderer(options)
        this.aFormClass.renderHelper.renderToggle(this.wrapper)
        return this.wrapper
    }

    textComponentRenderer(options: any) {
        const labelId = uuidV4()
        if (options) {
            this.options = options
        }
        this.wrapper.classList.add('field');
        this.wrapper.style.padding = '5px'
        this.wrapper.tabIndex = -1
        if (this.textComponent?.customClass) {
            new ClassesHelper().addClasses(this.textComponent?.customClass, this.wrapper)
        }
        // create label
        const label = document.createElement('label');
        label.innerText = (this.textComponent.label as string)
        label.setAttribute('id', labelId)

        this.aFormClass.validationHelper.addFocusEvent(this.wrapper)
        this.wrapper.append(label)
        if (this.textComponent.tooltip) {
            const tooltipWrapperDiv = this.aFormClass.validationHelper.createToolTip(this.textComponent, this.wrapper)
            this.wrapper.append(tooltipWrapperDiv)
        }
        const iconInputWrapper = document.createElement('div')
        iconInputWrapper.classList.add('ui', 'icon', 'input')
        this.textInputElement.placeholder = this.textComponent.placeholder || ""
        this.textInputElement.name = (this.textComponent.key as string)
        this.textInputElement.type = options?.type ? options?.type : "text"
        this.textInputElement.setAttribute('aria-labelledby', labelId)
        if (this.textComponent.validate?.required) {
            this.textInputElement.setAttribute('aria-required', 'true')
        }
        this.textInputElement.onchange = () => this.aFormClass.notifyChanges(this.textComponent?.key as string);
        this.textInputElement.tabIndex = this.textComponent?.tabindex ? Number(this.textComponent?.tabindex) : 0
        fromEvent(this.textInputElement, 'input').subscribe(value => {
            if (this.wrapper.classList.contains('error')) {
                this.aFormClass.formLiveRegion.innerText = this.textComponent.label + ' is required'
            }
            this.aFormClass.setFormData(this.textInputElement.value, this.textComponent?.key as string)
            const storeData = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId)?.data
            this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, data: {...storeData, ...{[this.textComponent?.key as string]: this.textInputElement.value}}}))
        })

        const icon = document.createElement('i')
        icon.classList.add('icon')
        iconInputWrapper.append(this.textInputElement)
        iconInputWrapper.append(icon)
        this.wrapper.append(iconInputWrapper)
        $(this.wrapper).hide()
        this.errorMutationObserver.observe(this.wrapper, {attributes: true})
    }

    addValidation() {
        const validation = this.aFormClass.validationHelper.prepareValidation(this.textComponent)
        if (this.textComponent.validate?.required) {
            this.wrapper?.classList.add('required');
        }
        $('#' + this.aFormClass.uniqFormId).form('add rule', this.textComponent.key,  { rules: validation })
    }

    removeValidation() {
        $('#' + this.aFormClass.uniqFormId).form('remove field', this.textComponent.key)
    }

    processConditionalLogic(update?: boolean) {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data

        if (this.textComponent.hidden) {
            const conditional = this.aFormClass.conditionalHelper.checkJustCondition(this.textComponent?.conditional?.json, data)
            if (conditional || this.textComponent?.conditional?.json === undefined || this.textComponent?.conditional?.json === null) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.textComponent.clearOnHide) {
                    this.textInputElement.value = ""
                } else {
                    if (this.textComponent.defaultValue) {
                        this.aFormClass.formManager.form('set value', this.textComponent.key, this.textComponent.defaultValue)
                    }
                    this.aFormClass.validationHelper.calculatedValue(this.textComponent)
                    if (!update) {
                        this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, data: {...data, ...{[this.textComponent?.key as string]: this.textInputElement.value}}}))
                    }
                }
            } else {
                this.textInputElement.value = ""
            }
        } else {
            this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.textComponent?.conditional?.json, data)
            if (!this.isVisible) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.textComponent.clearOnHide) {
                    this.textInputElement.value = ""
                } else {
                    if (this.textComponent.defaultValue) {
                        this.aFormClass.formManager.form('set value', this.textComponent.key, this.textComponent.defaultValue)
                    }
                    this.aFormClass.validationHelper.calculatedValue(this.textComponent)
                }
                $(this.wrapper).hide()
                this.removeValidation()
            } else {
                if (this.textComponent.defaultValue) {
                    this.aFormClass.formManager.form('set value', this.textComponent.key, this.textComponent.defaultValue)
                }
                this.aFormClass.validationHelper.calculatedValue(this.textComponent)
                this.addValidation()
                if (!update) {
                    this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, data: {...data, ...{[this.textComponent?.key as string]: this.textInputElement.value}}}))
                }
                $(this.wrapper).fadeIn()
            }
        }
    }
}
