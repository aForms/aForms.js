import {AFormModel, AFormModelClass} from "../../../a-form.model";
import {ClassesHelper} from "../../../helpers/classes.helper";

export interface PanelModal {
    collapsible?: boolean,
    buttonSettings?: {
        cancel?: boolean,
        next?: boolean,
        previous?: boolean
    }
}

export class PanelBuilder {

    constructor(private aFormModel: AFormModel | undefined,
                private aFormModalClass: AFormModelClass) { }

    createPanel(): HTMLDivElement {
        const segment = document.createElement('div')
        segment.classList.add('a-form-content-holder')
        segment.style.outline = 'none'
        segment.tabIndex = -1
        const container = document.createElement('div')
        if (this.aFormModel?.customClass) {
            new ClassesHelper().addClasses(this.aFormModel?.customClass, container)
        }
        if (!this.aFormModel?.hideLabel) {
            segment.classList.add('ui', 'attached', 'segment')
            if (typeof this.aFormModel?.label === "string") {
                const h3 = document.createElement('h3')
                h3.classList.add('ui', 'top', 'attached', 'header')
                h3.innerText = this.aFormModel.label ?? ''
                container.append(h3)
            }
        }
        container.tabIndex = -1
        container.style.marginBottom = '1rem'
        container.append(segment)
        this.addInternalComponents(segment)
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
