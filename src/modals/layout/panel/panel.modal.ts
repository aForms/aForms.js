import {AFormModel, AFormModelClass} from "../../../a-form.model";
import {ClassesHelper} from "../../../helpers/classes.helper";
import {getFormById} from "../../../store/reducers/form-data.reducer";
import {ConditionalHelper} from "../../../helpers/conditional.helper";

export interface PanelModal {
    collapsible?: boolean,
    buttonSettings?: {
        cancel?: boolean,
        next?: boolean,
        previous?: boolean
    }
}

export class PanelBuilder {

    wrapper: HTMLDivElement = document.createElement('div')

    header: HTMLHeadingElement = document.createElement('h3')

    isVisible = true

    constructor(private aFormModel: AFormModel | undefined,
                private aFormClass: AFormModelClass) {
        if (this.aFormModel.conditional?.json) {
            const panelSubscriber = this.aFormClass.store.subscribe(() => {
                const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
                this.isVisible = new ConditionalHelper().checkCondition(this.aFormModel?.conditional?.json, data)
                if (!this.isVisible) {
                    this.wrapper.classList.add('a-form-hidden')
                    this.header.classList.add('a-form-hidden')
                } else {
                    this.wrapper.classList.remove('a-form-hidden')
                    this.header.classList.remove('a-form-hidden')
                }
            })
            this.aFormClass.removableSubscribers.push(panelSubscriber)
        }
    }

    createPanel(): HTMLDivElement {
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
        this.wrapper.classList.add('a-form-content-holder', 'a-form-panel')
        this.wrapper.style.outline = 'none'
        this.wrapper.tabIndex = -1
        const container = document.createElement('div')
        if (this.aFormModel?.customClass) {
            new ClassesHelper().addClasses(this.aFormModel?.customClass, container)
        }
        if (!this.aFormModel?.hideLabel) {
            this.wrapper.classList.add('ui', 'attached', 'segment')
            if (typeof this.aFormModel?.title === "string") {
                this.header.classList.add('ui', 'top', 'attached', 'header')
                this.header.innerText = this.aFormModel.title ?? ''
                container.append(this.header)
            }
        }
        container.tabIndex = -1
        container.style.marginBottom = '1rem'
        container.append(this.wrapper)
        this.addInternalComponents(this.wrapper)

        this.isVisible = new ConditionalHelper().checkCondition(this.aFormModel?.conditional?.json, data)

        if (!this.isVisible) {
            this.wrapper.classList.add('a-form-hidden')
            this.header.classList.add('a-form-hidden')
        } else {
            this.wrapper.classList.remove('a-form-hidden')
            this.header.classList.remove('a-form-hidden')
        }

        return container
    }

    /**
     *   Add if any components available inside panel
     */
    addInternalComponents(container: HTMLDivElement) {
        this.aFormModel?.components?.forEach(value => {
            this.aFormClass.renderer.renderComponent(value, container)
        })
    }

}
