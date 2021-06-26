import {AFormModel, AFormModelClass} from "../a-form.model";
// @ts-ignore
import { v4 as uuidV4 } from 'uuid';
import {Observable, Subject} from "rxjs";
import {ConditionalHelper} from "./conditional.helper";
import {getFormById} from "../store/reducers/form-data.reducer";

declare var $: JQueryStatic;

export class FunctionsHelpers {

    listenFormMutations: Subject<MutationRecord[]> = new Subject<MutationRecord[]>();

    mutationObserver: MutationObserver = new MutationObserver(mutations => {
        this.listenFormMutations.next(mutations)
    });

    constructor(private aFormClass: AFormModelClass) {
        // custom form validation rule
        // @ts-ignore
        $.fn.form.settings.rules.checkValidation = (value, logic) => {
            if (logic) {
                const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
                const validation = new ConditionalHelper().checkCondition(JSON.parse(logic), data)
                return validation === true
            }
            return true
        };
    }

    createToolTip(aFormModel: AFormModel, wrapper: HTMLDivElement|HTMLFieldSetElement) {
        const tooltipId = uuidV4()
        const tooltipWrapperDiv = document.createElement('span')
        tooltipWrapperDiv.style.marginLeft = '5px'
        tooltipWrapperDiv.setAttribute('role', 'button')
        tooltipWrapperDiv.setAttribute('aria-disabled', 'true')

        this.aFormClass.validationHelper.addFocusEvent(tooltipWrapperDiv)
        const infoIcon = document.createElement('i')
        infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
        const spanItem = document.createElement('span')
        spanItem.classList.add('visually-hidden')
        spanItem.style.position = 'absolute'
        spanItem.style.left = '-10000px'
        spanItem.style.width = '1px'
        spanItem.style.height = '1px'
        spanItem.style.overflow = 'hidden'
        spanItem.innerHTML = aFormModel.label || ''
        // Custom tooltip
        const tooltipDiv = document.createElement('div')
        tooltipDiv.classList.add('ui', 'custom', 'popup', 'hidden')
        tooltipDiv.setAttribute('role', 'tooltip')
        tooltipDiv.setAttribute('id', tooltipId)
        tooltipDiv.innerText = aFormModel?.tooltip as string ?? ''
        tooltipWrapperDiv.append(infoIcon, spanItem)
        tooltipWrapperDiv.tabIndex = 0
        this.initializeTooltip(wrapper, tooltipWrapperDiv, tooltipDiv)
        return {tooltipWrapperDiv, tooltipDiv}
    }

    initializeTooltip(wrapper: HTMLDivElement|HTMLFieldSetElement, tooltipSpan: HTMLDivElement|HTMLSpanElement, tooltipDiv: HTMLDivElement) {
        tooltipSpan.setAttribute('aria-describedby', tooltipDiv?.getAttribute('id') as string)
        $(tooltipSpan)
            .popup({
                popup: $(tooltipDiv),
            })
        $(tooltipSpan)
            .on('focusin', () => {
                $(tooltipDiv)
                    .popup('show')
            })
            .on('focusout', () => {
                $(tooltipDiv).popup('hide')
            })
            .on('click', () => {
                $(tooltipDiv).popup('toggle')
            })
    }

    addFocusEvent(element: any) {
        // element.addEventListener('focusin', () => {
        //     element.style.outline = "auto"
        //     element.style.outlineColor = "var(--primary-color)"
        //     // radioDiv.style.backgroundColor = "var(--primary-color)"
        // })
        // element.addEventListener('focusout', () => {
        //     element.style.outline = "unset"
        //     element.style.outlineColor = "unset"
        //     element.style.backgroundColor = "unset"
        // })
    }

    addMutationOn(element: any){
        this.mutationObserver.observe(element, { attributes: true })
    }

    disconnectMutationChanges() {
        this.mutationObserver.disconnect()
    }

    prepareValidation(aFormModel: AFormModel) {
        const validationObject = []
        if (aFormModel.validate?.required) {
            validationObject.push(this.addValidationWithCustomMessage(aFormModel, 'empty'))
        }
        if (aFormModel.validate?.maxLength) {
            validationObject.push(this.addValidationWithCustomMessage(aFormModel, `maxLength[${aFormModel.validate?.maxLength}]`))
        }
        if (aFormModel.validate?.minLength) {
            validationObject.push(this.addValidationWithCustomMessage(aFormModel, `minLength[${aFormModel.validate?.minLength}]`))
        }
        if (aFormModel.validate?.pattern) {
            validationObject.push(this.addValidationWithCustomMessage(aFormModel, `regExp[${aFormModel.validate?.pattern}]`))
        }
        if (aFormModel.validate?.json) {
            validationObject.push(this.addValidationWithCustomMessage(aFormModel, `checkValidation[${JSON.stringify(aFormModel.validate?.json)}]`, undefined, aFormModel.validate?.json))
        }
        return validationObject
    }

    addValidationWithCustomMessage(aFormModel: AFormModel, validation: string, prompt?: string, conditional?: any) {
        if (validation.includes('checkValidation')) {
            return {
                type: validation,
                prompt: (value: any) => {
                    const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
                    const validation = new ConditionalHelper().checkCondition(conditional, data)
                    if (aFormModel.customError) {
                        return aFormModel.customError
                    }
                    return `${validation}`
                }
            }
        }
        return {
            type: validation
        }
    }

    calculatedValue(aFormModel: AFormModel) {
        if (aFormModel.calculateValue) {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            const value = new ConditionalHelper().checkCondition(aFormModel.calculateValue, data)
            if (value) {
                if (aFormModel.multiple) {
                    if (value instanceof Array) {
                        this.aFormClass.formManager.form('set value', aFormModel.key, value)
                    } else {
                        this.aFormClass.formManager.form('set value', aFormModel.key, [value])
                    }
                }
                this.aFormClass.formManager.form('set value', aFormModel.key, value)
           }
        }
    }

}
