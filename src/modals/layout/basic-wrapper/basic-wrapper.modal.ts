import {AFormModel, AFormModelClass} from "../../../a-form.model";
export interface BasicWrapperModal {

}

export class BasicWrapperBuilder {

    constructor(private aFormModel: AFormModel | undefined, private aFormModalClass: AFormModelClass) { }

    createPanel(): HTMLDivElement {
        const segment = document.createElement('div')
        segment.classList.add('a-form-content-holder', 'a-form-common-wrapper')
        segment.tabIndex = this.aFormModel?.tabindex ? Number(this.aFormModel?.tabindex) : -1
        this.addInternalComponents(segment)
        const container = document.createElement('div')
        container.append(segment)
        return container
    }

    /**
     *   Add if any components available inside panel
     */
    addInternalComponents(container: HTMLDivElement) {
        this.aFormModel?.components?.forEach(value => {
            if (value.hidden !== true) {
                this.aFormModalClass.renderer.renderComponent(value, container)
            }
        })
    }

}
