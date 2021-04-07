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
        const infoIcon = document.createElement('i')
        infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
        infoIcon.tabIndex = 0
        this.aFormClass.validationHelper.addFocusEvent(infoIcon)
        // Custom tooltip
        const tooltipDiv = document.createElement('div')
        tooltipDiv.classList.add('ui', 'custom', 'popup', 'hidden')
        tooltipDiv.innerText = aFormModel?.tooltip as string ?? 'No content'
        tooltipDiv.setAttribute('for', tooltipId)
        tooltipDiv.setAttribute('aria-hidden', 'true')
        tooltipDiv.setAttribute('aria-live', 'polite')
        tooltipDiv.setAttribute('role', 'tooltip')
        const tooltipWrapperDiv = document.createElement('span')
        tooltipWrapperDiv.style.marginLeft = '5px'
        tooltipWrapperDiv.setAttribute('id', tooltipId)
        tooltipWrapperDiv.append(infoIcon)
        tooltipWrapperDiv.append(tooltipDiv)
        this.initializeTooltip(wrapper, tooltipWrapperDiv)
        return tooltipWrapperDiv
    }

    initializeTooltip(wrapper: HTMLDivElement|HTMLFieldSetElement, tooltipSpan: HTMLDivElement|HTMLSpanElement) {
        wrapper.setAttribute('aria-describedby', tooltipSpan?.getAttribute('id') as string)
        $(tooltipSpan)
            .popup({
                popup: $(tooltipSpan).find('.ui.custom'),
            })
        $(tooltipSpan)
            .on('focusin', () => {
                $(wrapper)
                    .find('.data-tooltip')
                    .popup('show')
                $(tooltipSpan).find('.ui.custom').attr('aria-hidden', 'false')
            })
            .on('focusout', () => {
                $(wrapper)
                    .find('.data-tooltip').popup('hide')
                $(tooltipSpan).find('.ui.custom').attr('aria-hidden', 'true')
            })
            .on('click', () => {
                $(wrapper)
                    .find('.data-tooltip').popup('toggle')
            })
    }

    addFocusEvent(element: any) {
        element.addEventListener('focusin', () => {
            element.style.outline = "auto"
            element.style.outlineColor = "var(--primary-color)"
            // radioDiv.style.backgroundColor = "var(--primary-color)"
        })
        element.addEventListener('focusout', () => {
            element.style.outline = "unset"
            element.style.outlineColor = "unset"
            element.style.backgroundColor = "unset"
        })
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
        if (aFormModel.customError) {
            return {
                type: validation,
                prompt: prompt ? prompt : aFormModel.customError
            }
        } else {
            if (validation.includes('checkValidation')) {
                return {
                    type: validation,
                    prompt: (value: any) => {
                        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
                        const validation = new ConditionalHelper().checkCondition(conditional, data)
                        return `${validation}`
                    }
                }
            }
            if (aFormModel.type === "radio") {
                return {
                    type: validation,
                    prompt: 'select a value.'
                }
            }
            return {
                type: validation
            }
        }
    }

    calculatedValue(aFormModel: AFormModel) {
        if (aFormModel.calculateValue) {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            const validation = new ConditionalHelper().checkCondition(aFormModel.calculateValue, data)
            if (validation) {
                if (aFormModel.multiple) {
                    if (validation instanceof Array) {
                        this.aFormClass.formManager.form('set value', aFormModel.key, validation)
                    } else {
                        this.aFormClass.formManager.form('set value', aFormModel.key, [validation])
                    }
                }
                this.aFormClass.formManager.form('set value', aFormModel.key, validation)
           }
        }
    }

}
