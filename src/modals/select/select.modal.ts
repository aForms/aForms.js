import {AFormModel, AFormModelClass} from "../../a-form.model";

// @ts-ignore
import { v4 as uuidV4 } from 'uuid';
import {FunctionsHelpers} from "../../helpers/functions.helpers";
import {getFormById, updateFormData } from "../../store/reducers/form-data.reducer";
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {ConditionalHelper} from "../../helpers/conditional.helper";


export interface SelectModal {
    data?: {
        values?: LabelValue[],
        json?: any[],
        url?: string,
        headers?: any,
        resource?: any,
        custom?: any
    },
    valueProperty?: string,
    optionsLabelPosition?: string,
    lockKey?: boolean,
    template?: string,
    dataSrc?: string,
    selectFields?: string,
    selectThreshold?: number,
    widget?: string|{type: "input"},
    readOnlyValue?: boolean,
    limit?: number,
    multiple?: boolean,
    overlay?: {
        top?: string,
        left?: string,
        width?: string,
        style?: string,
        height?: string
    },
    refreshOn?: string,
    searchField?: string,
    uniqueOptions?: false,
    customOptions?: any,
    lazyLoad?: boolean,
    searchThreshold?: number,
    minSearch?: number,
    calculateServer?: boolean,
    searchEnabled?: boolean,
    fuseOptions?: {
        include?: string,
        threshold?: number
    },
    shouldIncludeSubFormPath?: boolean,
    filter?: string|any
}

export interface LabelValue {
    label?: string,
    value?: any
}

export class SelectBuilder {

    change = 0

    wrapper: HTMLDivElement | undefined;

    options: any | undefined;

    changes = true;

    storeUpdated = false

    internalChanges = false;

    optionsCount = 0

    notifiedDropbox = false

    isVisible = true

    constructor(private selectModel: AFormModel, private aFormClass: AFormModelClass, container?: HTMLDivElement) {
        if (container) {
            container.append(this.build())
        }
        const selectStoreSubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.wrapper?.querySelector('.ui.dropdown')?.classList.add('loading')
            this.isVisible = new ConditionalHelper().checkCondition(this.selectModel?.conditional?.json, data)
            if (this.wrapper) {
                if (this.isVisible) {
                    $(this.wrapper).fadeIn()
                    const op = $(this.wrapper).find('.ui.dropdown');
                    this.internalChanges = true
                    op.dropdown('set exactly', data[this.selectModel.key as string])
                    this.internalChanges = false
                    this.addValidation()
                    this.aFormClass.validationHelper.calculatedValue(this.selectModel)
                } else {
                    $(this.wrapper).fadeOut()
                    this.removeValidation()
                }
            }
            setTimeout(() => {
                this.wrapper?.querySelector('.dropdown')?.classList.remove('loading')
            }, 200)
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.isVisible ? this.addValidation() : this.removeValidation()
            }
        }))

        this.aFormClass.removableSubscribers.push(selectStoreSubscriber)
    }

    build(): HTMLDivElement {
        this.wrapper = document.createElement('div');
        this.selectComponentRenderer(this.options)
        return this.wrapper
    }

    selectComponentRenderer(options?: any, update?: boolean) {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
        const uuid = uuidV4();
        const controllerLink = uuidV4();
        // Live region to notify screen reader about changes
        const liveRegion = document.createElement('div')
        liveRegion.setAttribute('role', 'status')
        liveRegion.setAttribute('aria-live', 'polite')
        liveRegion.classList.add('visually-hidden')
        liveRegion.style.position = 'absolute'
        liveRegion.style.left = '-10000px'
        liveRegion.style.width = '1px'
        liveRegion.style.height = '1px'
        liveRegion.style.overflow = 'hidden'

        if (this.wrapper) {
            if (options) {
                this.options = options
            }
            this.wrapper.classList.add('field');
            this.wrapper.style.padding = '5px'
            this.wrapper.setAttribute('role', 'combobox')
            this.wrapper.setAttribute('aria-controls', controllerLink)
            this.aFormClass.validationHelper.addFocusEvent(this.wrapper)
            const label = document.createElement('label')
            label.innerText = this.selectModel?.label as string
            label.setAttribute('for', this.selectModel.key as string)
            label.setAttribute('id', uuid);

            const dataSource: string = this.selectModel?.dataSrc as string
            const valueProperty: string = this.selectModel?.valueProperty as string
            const template: string = this.selectModel?.template?.replace?.(/<span>{{ item.|}}<\/span>/g, "")?.trim() as string
            const values: any[] = Object(this.selectModel?.data)[dataSource ?? 'values'];

            // Linking tooltip of exist
            if (this.selectModel?.tooltip) {
                const toolTip = this.aFormClass.validationHelper.createToolTip(this.selectModel, this.wrapper)
                label.append(toolTip)
            }

            const selectElement = document.createElement('select')
            selectElement.classList.add('ui', 'dropdown', 'search')
            selectElement.name = this.selectModel?.key as string
            const placeHolderOption = document.createElement('option')
            placeHolderOption.setAttribute('value', "")
            placeHolderOption.innerText = this.selectModel.placeholder || ''
            selectElement.append(placeHolderOption)
            values.forEach((value: LabelValue|any) => {
                const option = document.createElement('option')
                option.innerText = value?.[template]
                option.setAttribute('value', value?.[valueProperty])
                selectElement.append(option)
            })
            this.optionsCount = values.length
            this.wrapper?.append(label)
            this.wrapper?.append(selectElement)
            this.wrapper?.append(liveRegion)

            if (this.selectModel?.multiple) {
                selectElement.setAttribute('multiple', '')
                selectElement.classList.add('multiple')
            }

            $(this.wrapper).find('.dropdown').dropdown({
                clearable: true,
                selectOnKeydown: false,
                allowTab: true,
                onShow: () => {
                    this.wrapper?.querySelector('input')?.setAttribute('aria-expanded', 'true')
                    const currentSelection = $(this.wrapper as HTMLElement).find('.menu>.selected')
                    liveRegion.innerText = "entering  " + this.selectModel.label + " drop down options."
                    if (this.selectModel.multiple) {
                        liveRegion.innerText = `You are on multiselect field and you have ${this.optionsCount} to choose from.
                            Enter the text for autocompletion or up and down arrow for selection. ${currentSelection?.text() ? 'Currently selected ' + currentSelection?.text() : ''}`
                    } else {
                        liveRegion.innerText = `You are on select field and you have ${this.optionsCount} to choose from.
                            Enter the text for autocompletion or up and down arrow for selection. ${currentSelection?.text()  ? 'Currently selected ' + currentSelection?.text()  : ''}`
                    }
                    setTimeout(() => {
                        this.notifiedDropbox = true
                    }, 1000)
                },
                onHide: () => {
                    this.wrapper?.querySelector('input')?.setAttribute('aria-expanded', 'false')
                    this.notifiedDropbox = false
                },
                onChange: (v: string, label: string) => {
                    if (!this.internalChanges) {
                        this.aFormClass.notifyChanges(this.selectModel?.key as string)
                        liveRegion.innerText = "selected, " + label
                    }
                },
                showOnFocus: true,
                onNoResults: () => {
                    liveRegion.innerText = "No result found, please try narrowing your search."
                }
            })


            fromEvent($(this.wrapper).find('input.search'), 'input')
                .pipe(debounceTime(1000)).subscribe(value => {
                if (this.wrapper) {
                    const choices = $(this.wrapper).find('.menu')?.children()?.not('.filtered')
                    const currentSelection = $(this.wrapper).find('.menu>.selected')
                    liveRegion.innerText = "You have " + choices?.length + " options available. Currently selected " + currentSelection.text()
                }
            })

            // Link label to input search
            $(this.wrapper).find('input.search')
                .attr('aria-labelledby', uuid)
                .attr('role', 'listbox')
                .attr('autocomplete', 'true')
                .attr('aria-multiselectable', this.selectModel.multiple ? 'true' : 'false')

            this.aFormClass.validationHelper.listenFormMutations.asObservable().subscribe((value) => {
                value.forEach((record, index, array) => {
                    if (record.attributeName === 'class' && this.notifiedDropbox) {
                        if (((record.target as HTMLElement).classList?.contains('selected')
                            && !(record.target as HTMLElement).classList?.contains('active'))) {
                            liveRegion.innerText = (record.target as HTMLElement).dataset?.text as string
                        } else if (((record.target as HTMLElement).classList?.contains('selected')
                            && (record.target as HTMLElement).classList?.contains('active'))) {
                            liveRegion.innerText = 'Currently selected option ' + (record.target as HTMLElement).dataset?.text as string
                        }
                    }
                })
            })

            $(this.wrapper).find('.menu')?.children()?.each((index, element ) => {
                this.aFormClass.validationHelper.addMutationOn(element)
            })

            this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.selectModel?.conditional?.json, data)
            if (!this.isVisible) {
                $(this.wrapper).hide()
            } else {
                this.aFormClass.validationHelper.calculatedValue(this.selectModel)
            }
        }
    }

    private detectChanges(e?: any[]) {
        const formData = this.aFormClass.getFormData()
        this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, data: formData}))
    }

    addValidation() {
        const validation = this.aFormClass.validationHelper.prepareValidation(this.selectModel)
        this.aFormClass.formManager.form('add rule', this.selectModel.key, { on: 'blur', rules: validation })
    }

    removeValidation() {
        $('#' + this.aFormClass.uniqFormId).form('remove field', this.selectModel.key)
    }
}
