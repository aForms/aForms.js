import {TextfieldBuilder, TextfieldModal} from "./modals/textfield/textfield.modal";
import {TextareaBuilder, TextareaModal} from "./modals/textarea/textarea.modal";
import {BehaviorSubject} from "rxjs";
declare var $: JQueryStatic;
import {ButtonBuilder, ButtonModal} from "./modals/button/button.modal";
import {PanelBuilder, PanelModal} from "./modals/layout/panel/panel.modal";
import {ColumnsModal} from "./modals/layout/columns/columns.modal";
import {SignatureModal} from "./modals/signature/signature.modal";
import {SurveyModal} from "./modals/survey/survey.modal";
import {ContentModal} from "./modals/content/content.modal";

export interface AFormModel extends ProjectModel, TextfieldModal, TextareaModal, ButtonModal,
    PanelModal, ColumnsModal, SignatureModal, SurveyModal, ContentModal {
    display?: "form"|"wizard",
    settings?: any,
    components?: AFormModel[],
    type?: "textfield"|"button"|"textarea"|"panel"|"form"|"content"|"signature"|"columns"|"survey"|"phoneNumber"|"email",
    inputType?: "phoneNumber"|"email"|"text",
    key?: string,
    tableView?: boolean,
    hideLabel?: boolean,
    hidden?: boolean,
    label?: string,
    modalEdit?: boolean,
    disabled?: boolean,
    autofocus?: boolean,
    tabindex?: number|string,
    customClass?: string|string[],
    autocomplete?: "on"|"off",
    prefix?: string,
    suffix?: string,
    tooltip?: string,
    description?: string,
    placeholder?: string,
    clearOnHide?: boolean,
    labelPosition?: "left-left"|"left-right"|"right-left"|"right-right"|"bottom"|"top",
    customDefaultValue?: string|any,
    calculateValue?: string|any,
    encrypted?: boolean,
    redrawOn?: "data"|"textArea"|"submit",
    validate?: Validation,
    unique?: boolean,
    errorLabel?: string,
    properties?: any,
    conditional?: Conditional,
    customConditional?: string,
    attributes?: any,
    tags?: string[],
    defaultValue?: string|any,
    kickbox?: any
}

export interface ProjectModel {
    _id?: string,
    machineName?: string,
    modified?: string,
    title?: string,
    name?: string,
    path?: string,
    project?: string,
    created?: string,
    owner?: string,
    submissionAccess?: any,
    access?: any
}

export interface Validation {
    required?: boolean,
    pattern?: string,
    customMessage?: string,
    json?: any,
    custom?: string,
    minLength?: number|string,
    maxLength?: number|string,
    minWords?: number|string,
    maxWords?: number|string,
    customPrivate?: boolean
}

export interface Conditional {
    show?: boolean|string,
    when?: string,
    eq?: string|number,
    json?: any
}


/**
 * The main form model that will initialize the renderer.
 *
 * @constructor {@link AFormModel} is required to initialize the library
 */
export class AFormModelClass {

    private aFormSubject?: BehaviorSubject<AFormModel|undefined> = new BehaviorSubject<AFormModel|undefined>(this.aForm)

    formElement: HTMLFormElement | undefined;

    constructor(private aForm?: AFormModel, private divElement?: HTMLDivElement) {
        this.initializeAForm?.()
    }

    initializeAForm?() {
        if (!this.aForm && !this.divElement) {
            throw Error("A Form json and div element location are required to initialize library.")
        }

        this.aFormSubject?.next(this.aForm);
    }

    /**
     * User can provide an updated model {@link AFormModel}
     *
     * @description Merge new Model with existing model and notify observers with changes.
     */
    modifyModel?(aForm: Partial<AFormModel>) {
        const mergedModels: AFormModel = {
            ...this.aForm,
            ...aForm
        } as AFormModel;
        this.aForm = mergedModels;
        this.aFormSubject?.next(mergedModels);
    }

    /**
     * Provides current model {@link AFormModel}
     *
     * @description gets the new model from {@link BehaviorSubject} and gives it to consumer.
     * @return {@link AFormModel}
     */
    getCurrentModel?() {
        return this.aFormSubject?.value;
    }

    /**
     * Provides interface as observable so all components subscribed can listen for changes.
     */
    observeAForm?() {
        return this.aFormSubject?.asObservable();
    }

    renderModel?() {
        // Initialize the main container
        switch (this.aForm?.display) {
            case "form": {
                this.renderForm?.()
                break;
            }
            case "wizard": {
                this.renderWizard?.()
                break;
            }
        }
    }

    private renderForm?() {
        $(this.divElement as HTMLDivElement).addClass('ui').addClass('container');
        const form = document.createElement('form');
        form.classList.add('ui', 'form');
        this.formElement = form;
        const divContainer: HTMLDivElement = document.createElement('div');
        divContainer.classList.add('a-form-content-holder');
        if (this.aForm && this.aForm.components) {
            this.renderComponent(this.aForm, divContainer)
            this.formElement?.append(divContainer)
        }
        this.divElement?.append(form)
    }

    renderComponent(aFormModel: AFormModel, container: HTMLDivElement) {
        switch (aFormModel.type) {
            case "button":
                container?.append(new ButtonBuilder(aFormModel, this).build())
                break;
            case "textarea":
                container?.append(new TextareaBuilder(aFormModel).build())
                break;
            case "textfield": {
                container?.append(new TextfieldBuilder(aFormModel).build())
                break;
            }
            case "panel":
                const newPanel = new PanelBuilder(aFormModel, this).createPanel()
                container?.append(newPanel)
                break;
            default:
                const nonVisiblePanel = new PanelBuilder(aFormModel, this).createPanel()
                container?.append(nonVisiblePanel)
        }
    }

    private renderWizard?() {
        const divContainer = document.createElement('div');
        $(this.divElement as HTMLDivElement).append(divContainer).addClass('ui').addClass('container');
        divContainer.innerText = (this.aForm?.label as string)
    }

    dispatchEvent(eventName: string) {
        this.divElement?.dispatchEvent(new Event(eventName));
    }

    getFormData() {
        if (this.divElement) {
            const form = $(this.divElement).find('form').form('get values');
            console.log(form)
        }
    }
}
