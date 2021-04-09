import {TextCommonModal} from "../text-common/text-common.modal";
import {AFormModel, AFormModelClass, FormEvents} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";
import {DefaultsHelper} from "../../helpers/defaults.helper";
import {getFormById} from "../../store/reducers/form-data.reducer";
import {ConditionalHelper} from "../../helpers/conditional.helper";
// @ts-ignore
import { v4 as uuidV4 } from 'uuid';
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";

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

    constructor(private textComponent: AFormModel, private aFormClass: AFormModelClass, private formComponent?: HTMLDivElement) {
        if (formComponent) {
            formComponent.append(this.build())
        }

        const textVisibilitySubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.wrapper?.querySelector('.ui.icon.input')?.classList.add('loading')
            this.isVisible = new ConditionalHelper().checkCondition(this.textComponent?.conditional?.json, data)
            if (this.wrapper) {
                if (this.isVisible) {
                    this.addValidation()
                    $(this.wrapper).fadeIn()
                    this.aFormClass.validationHelper.calculatedValue(this.textComponent)
                } else {
                    this.removeValidation()
                    $(this.wrapper).fadeOut()
                }
            }
            setTimeout(() => {
                this.wrapper?.querySelector('.ui.icon.input')?.classList.remove('loading')
            }, 200)
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.isVisible ? this.addValidation() : this.removeValidation()
            }
        }))

        this.aFormClass.removableSubscribers.push(textVisibilitySubscriber)
    }

    build(options?: TextOptions): HTMLDivElement {
        this.wrapper = document.createElement('div');
        this.textComponentRenderer(options)
        return this.wrapper
    }

    textComponentRenderer(options: any) {
        const labelId = uuidV4()
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
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
        if (this.textComponent?.tooltip) {
            const toolTip = this.aFormClass.validationHelper.createToolTip(this.textComponent, this.wrapper)
            this.wrapper.append(toolTip)
        }
        const iconInputWrapper = document.createElement('div')
        iconInputWrapper.classList.add('ui', 'icon', 'input')
        const input = document.createElement('input')
        input.placeholder = (this.textComponent.placeholder as string)
        input.name = (this.textComponent.key as string)
        input.type = options?.type ? options?.type : "text"
        input.setAttribute('aria-labelledby', labelId)
        if (this.textComponent.validate?.required) {
            input.setAttribute('aria-required', 'true')
        }
        input.tabIndex = this.textComponent?.tabindex ? Number(this.textComponent?.tabindex) : 0
        fromEvent(input, 'blur').pipe(debounceTime(1000)).subscribe(value => {
            if (this.wrapper.classList.contains('error')) {
                this.aFormClass.formLiveRegion.innerText = this.textComponent.label + ' is required'
            }
        })
        const icon = document.createElement('i')
        icon.classList.add('icon')
        iconInputWrapper.append(input)
        iconInputWrapper.append(icon)
        this.wrapper.append(iconInputWrapper)

        this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.textComponent?.conditional?.json, data)
        if (!this.isVisible) {
            $(this.wrapper).hide()
        } else {
            this.aFormClass.validationHelper.calculatedValue(this.textComponent)
        }

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
}
