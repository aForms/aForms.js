import {AFormModel, AFormModelClass} from "../../a-form.model";

// @ts-ignore
import { v4 as uuidV4 } from 'uuid';

declare var $: JQueryStatic;


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


    wrapper: HTMLDivElement | undefined;

    options: any | undefined;

    constructor(private selectModel: AFormModel, private aFormClass: AFormModelClass) { }

    build(options?: any) {

        const uuid = uuidV4();
        this.wrapper = document.createElement('div');
        if (options) {
            this.options = options
        }
        this.wrapper.classList.add('field');
        const label = document.createElement('label')
        label.innerText = this.selectModel?.label as string
        const infoIcon = document.createElement('i')
        infoIcon.classList.add('info', 'icon', 'circle', 'data-tooltip')
        infoIcon.tabIndex = 0
        infoIcon.setAttribute('data-content', 'This is a test data content.')
        label.append(infoIcon)
        const divElement = document.createElement('div')
        divElement.classList.add('ui', 'clearable', 'selection', 'dropdown')
        const input = document.createElement('input')
        input.name = this.selectModel?.key as string
        const icon = document.createElement('i')
        icon.classList.add('dropdown', 'icon')
        icon.tabIndex = -1
        const placeholderDiv = document.createElement('div')
        placeholderDiv.classList.add("default", 'text')
        placeholderDiv.innerText = this.selectModel?.placeholder as string ?? ''
        const optionsDiv = document.createElement('div')
        optionsDiv.classList.add('menu')
        divElement.append(input)
        divElement.append(icon)
        divElement.append(placeholderDiv)
        divElement.append(optionsDiv)
        this.selectModel?.values?.forEach((value: LabelValue) => {
            const option = document.createElement('div')
            option.classList.add('item')
            options.innerText = value?.label
            optionsDiv.append(option)
        })
        this.wrapper.append(label)
        this.wrapper.append(divElement)

        $(this.wrapper).find('.dropdown').dropdown({
            clearable: true
        })

        $(this.wrapper).find('.data-tooltip').popup({
            on: 'focus'
        })
        return this.wrapper
    }

}
