import {AFormModel, AFormModelClass, Mode} from "../../a-form.model";

// @ts-ignore
import {v4 as uuidV4} from 'uuid';
import {getFormById, updateFormData} from "../../store/reducers/form-data.reducer";
import {fromEvent} from "rxjs";
import {debounceTime} from "rxjs/operators";
import {ConditionalHelper} from "../../helpers/conditional.helper";
import {MutationHelper} from "../../helpers/mutation.helper";


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

    errorMutationObserver = new MutationHelper().errorMutationObserver

    constructor(private selectModel: AFormModel, private aFormClass: AFormModelClass, container?: HTMLDivElement) {
        if (container) {
            container.append(this.build())
        }

        const selectStoreSubscriber = this.aFormClass.store.subscribe(() => {
            const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
            this.wrapper?.querySelector('.ui.dropdown')?.classList.add('loading')
            this.isVisible = new ConditionalHelper().checkCondition(this.selectModel?.conditional?.json, data)
            if (this.wrapper) {
                this.processConditionalLogic()
            }
            this.wrapper?.querySelector('.dropdown')?.classList.remove('loading')
        })

        this.aFormClass.removableSubscribers.push(this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if (value.eventName === 'ready') {
                this.processConditionalLogic()
            }
        }))

        this.aFormClass.removableSubscribers.push(selectStoreSubscriber)
    }

    build(): HTMLDivElement {
        this.wrapper = document.createElement('div');
        this.selectComponentRenderer(this.options)
        this.aFormClass.renderHelper.renderToggle(this.wrapper)
        return this.wrapper
    }

    selectComponentRenderer(options?: any, update?: boolean) {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
        const uuid = uuidV4();
        // Link label to input search
        const menuId = uuidV4()
        const inputSearch = uuidV4()

        const controllerLink = uuidV4();
        // Live region to notify screen reader about changes
        const liveRegion = document.createElement('div')
        liveRegion.setAttribute('role', 'status')
        liveRegion.setAttribute('aria-atomic', 'true')
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
            this.wrapper.tabIndex = -1
            this.aFormClass.validationHelper.addFocusEvent(this.wrapper)
            const label = document.createElement('label')
            label.innerText = this.selectModel?.label as string
            label.setAttribute('for', this.selectModel.key as string)
            label.setAttribute('id', uuid);

            const dataSource: string = this.selectModel?.dataSrc as string
            const valueProperty: string = this.selectModel?.valueProperty as string
            const template: string = this.selectModel?.template?.replace?.(/<span>{{ item.|}}<\/span>/g, "")?.trim() as string
            const values: any[] = Object(this.selectModel?.data)[dataSource ?? 'values'];

            const selectElement = document.createElement('select')
            selectElement.classList.add('ui', 'dropdown', 'search')
            selectElement.name = this.selectModel?.key as string
            const placeHolderOption = document.createElement('option')
            placeHolderOption.setAttribute('value', "")
            placeHolderOption.innerText = this.selectModel.placeholder || ''
            selectElement.append(placeHolderOption)

            switch (dataSource) {
                case "values":
                    this.addOptions(values, template, 'value', selectElement);
                    break
                case "json":
                    this.addOptions(values, template, valueProperty, selectElement)
                    break
                case "url":
                    const proxyRequest = this.performProxyRequest(this.selectModel.data?.url);
                    this.aFormClass.axiosInstance
                        .get(proxyRequest)
                        .then(value => {
                            this.addOptions(this.selectModel.selectValues ? value?.data?.[this.selectModel.selectValues] : value?.data, template, valueProperty, selectElement)
                        })
                    break
                default:
                    this.addOptions(values, "label", 'value', selectElement);
            }
            this.optionsCount = values.length
            this.wrapper?.append(label)
            // Linking tooltip of exist
            if (this.selectModel.tooltip) {
                const tooltipWrapperDiv = this.aFormClass.validationHelper.createToolTip(this.selectModel, this.wrapper)
                this.wrapper.append(tooltipWrapperDiv)
                this.aFormClass.validationHelper.initializeTooltip(this.wrapper, tooltipWrapperDiv)
            }
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
                onChange: (v: string, label: string) => {
                    if (!this.internalChanges) {
                        this.aFormClass.setFormData(v, this.selectModel?.key as string)
                        const storeData = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId)?.data
                        this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, data: {...storeData, ...{[this.selectModel?.key as string]: v}}}))
                        this.aFormClass.formLiveRegion.innerText = "Selected, " + label
                    }
                    if (this.selectModel.multiple) {
                        $(this.wrapper).find('.remove.icon')
                            .hide()
                        $(this.wrapper).find('a').each((index, element) => {
                            element.querySelector('i').setAttribute('tabIndex', '0')
                            element.querySelector('i').setAttribute('aria-label', 'remove ' + element.getAttribute('data-value'))
                            element.querySelector('i').addEventListener('keypress', (e) => {
                                let keycode = (e.keyCode ? e.keyCode : e.which);
                                if(keycode === 13){
                                    $(this.wrapper).find('.remove.icon').click()
                                }
                            })
                        })
                    } else {
                        $(this.wrapper).find('.remove.icon')
                            .attr('aria-label', 'remove ' + label)
                            .on('keypress',     (e) => {
                                let keycode = (e.keyCode ? e.keyCode : e.which);
                                if(keycode === 13){
                                    $(this.wrapper).find('.remove.icon').click()
                                }
                            })
                    }
                },
                onShow: () => {
                    $(this.wrapper).find('input.search').attr('aria-expanded', 'true')
                },
                onHide: () => {
                    $(this.wrapper).find('input.search').attr('aria-expanded', 'false')
                    this.aFormClass.formManager.form('is valid', this.selectModel.key, true)
                },
                showOnFocus: false,
                onNoResults: () => {
                    liveRegion.innerText = "No result found, please try narrowing your search."
                }
            })

            fromEvent($(this.wrapper).find('input.search'), 'keydown')
                .pipe(debounceTime(1000)).subscribe(value => {
                if (this.wrapper) {
                    const selection = $(this.wrapper).find('.menu')?.find('.selected')
                    liveRegion.innerText = `${selection?.text()}`
                }
            })


            $(this.wrapper).find('input.search')
                .attr('role', 'combobox')
                .attr('aria-labelledby', uuid)
                .attr('aria-owns', menuId)
                .attr('aria-autocomplete', 'both')
                .attr('aria-controls', menuId)
                .attr('id', inputSearch)
                .attr('aria-expanded', 'false')
                .on('input', (v) => {
                    if (v) {
                        const length = $(this.wrapper).find('div.menu')?.children()?.not('.filtered')?.length
                        liveRegion.innerHTML = `${length} options available`
                    } else {
                        const length = $(this.wrapper).find('div.menu')?.length
                        liveRegion.innerHTML = `${length} options available`
                    }
                })
            $(this.wrapper).find('.dropdown.icon')
                .attr('tabIndex', '0')
            $(this.wrapper).find('.remove.icon')
                .attr('tabIndex', '0')
            $(this.wrapper).find('div.menu')
                .attr('id', menuId)
                .attr('role', 'listbox')

            if (this.selectModel.multiple) {
                $(this.wrapper).find('div.ui.dropdown')
                    .on('click', () => {
                        $(this.wrapper as HTMLDivElement)?.find('.dropdown').dropdown('show')
                    })
            }

            $(this.wrapper).find('div.ui.dropdown>div.menu').children().each((index, element) => {
                const elementId = uuidV4();
                element.setAttribute('id', elementId)
                element.setAttribute('role', "option")
                element.onclick = () => {
                    $(this.wrapper).find('div.ui.dropdown>input').each((index1, element1) => {
                        element1.setAttribute('aria-activedescendant', elementId)
                    })
                }
            })

            const textId = uuidV4()
            $(this.wrapper).find('div.ui.dropdown>div.text')
                .attr('id', textId)

            $(this.wrapper).find('div.ui.dropdown>input.search')
                .attr('aria-describedby', textId)

            if (this.selectModel.validate?.required) {
                selectElement.setAttribute('aria-required', 'true')
                this.wrapper.querySelectorAll('input')?.forEach(value => value.setAttribute('aria-required', 'true'))
            }
        }
        $(this.wrapper).hide()

        this.errorMutationObserver.observe(this.wrapper, {attributes: true})
    }

    addValidation() {
        const validation = this.aFormClass.validationHelper.prepareValidation(this.selectModel)
        if (this.selectModel.validate?.required) {
            this.wrapper?.classList.add('required');
        }
        this.aFormClass.formManager.form('add rule', this.selectModel.key, { on: 'blur', rules: validation })
    }

    removeValidation() {
        this.aFormClass.formManager.form('remove field', this.selectModel.key)
    }

    private addOptions(values: any, template: string, valueProperty: string, selectElement: HTMLElement) {
        values?.forEach((value: LabelValue|any) => {
            const option = document.createElement('option')
            option.setAttribute('role', 'option')
            option.setAttribute('aria-selected', 'false')
            option.innerText = value?.[template]
            option.setAttribute('value', value?.[valueProperty])
            selectElement.append(option)
        })
        this.optionsCount = values?.length
    }

    processConditionalLogic() {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data

        if (this.selectModel.hidden) {
            const conditional = this.aFormClass.conditionalHelper.checkJustCondition(this.selectModel?.conditional?.json, data)
            if (conditional  || this.selectModel?.conditional?.json === undefined || this.selectModel?.conditional?.json === null) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.selectModel.clearOnHide) {
                    $(this.wrapper).find('.dropdown').dropdown('clear')
                } else {
                    if (this.selectModel.defaultValue) {
                        this.aFormClass.formManager.form('set value', this.selectModel.key, this.selectModel.defaultValue)
                    }
                    this.aFormClass.validationHelper.calculatedValue(this.selectModel)
                }
            } else {
                $(this.wrapper).find('.dropdown').dropdown('clear')
            }
        } else {
            this.isVisible = this.aFormClass.conditionalHelper.checkCondition(this.selectModel?.conditional?.json, data)
            if (!this.isVisible) {
                // Clear on hide to ensure value gets cleared when hidden
                if (this.selectModel.clearOnHide) {
                    $(this.wrapper).find('.dropdown').dropdown('clear')
                } else {
                    if (this.selectModel.defaultValue) {
                        this.aFormClass.formManager.form('set value', this.selectModel.key, this.selectModel.defaultValue)
                    }
                    this.aFormClass.validationHelper.calculatedValue(this.selectModel)
                }
                $(this.wrapper).hide()
                this.removeValidation()
            } else {
                if (this.selectModel.defaultValue) {
                    this.aFormClass.formManager.form('set value', this.selectModel.key, this.selectModel.defaultValue)
                }
                this.aFormClass.validationHelper.calculatedValue(this.selectModel)
                this.addValidation()
                $(this.wrapper).fadeIn()
            }
        }
    }

    private performProxyRequest(url: string | undefined): string {
        let val = url
        this.aFormClass.libraryConfig.proxyUrl?.proxyRequest?.forEach(requestUrl => {
            val = val.replace(requestUrl.from, requestUrl.to)
        })
        return val
    }
}
