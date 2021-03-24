import {TextfieldModal} from "./modals/textfield/textfield.modal";
import {TextareaModal} from "./modals/textarea/textarea.modal";
import {BehaviorSubject, Subject} from "rxjs";
import {ButtonModal} from "./modals/button/button.modal";
import {PanelModal} from "./modals/layout/panel/panel.modal";
import {ColumnsModal} from "./modals/layout/columns/columns.modal";
import {SignatureModal} from "./modals/signature/signature.modal";
import {SurveyModal} from "./modals/survey/survey.modal";
import {ContentModal} from "./modals/content/content.modal";
import {BasicWrapperModal} from "./modals/layout/basic-wrapper/basic-wrapper.modal";
import {RendererHelper} from "./helpers/renderer.helper";
import {ConfigureStore} from "./store";
import {SelectModal} from "./modals/select/select.modal";
import { RadioModal } from "./modals/radio/radio.modal";

declare var $: JQueryStatic;

export interface AFormModel extends ProjectModel, TextfieldModal, TextareaModal, ButtonModal,
    PanelModal, ColumnsModal, SignatureModal, SurveyModal, ContentModal, BasicWrapperModal, SelectModal, RadioModal {
    display?: "form"|"wizard",
    settings?: any,
    components?: AFormModel[],
    type?: "textfield"|"button"|"textarea"|"panel"|"form"|"content"|"signature"|"columns"|"survey"|"phoneNumber"|"email"|"select"|"radio",
    inputType?: "phoneNumber"|"email"|"text"|"radio",
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
    redrawOn?: "data"|"textArea"|"submit"|"",
    validate?: Validation,
    validateOn?: string,
    unique?: boolean,
    errorLabel?: string,
    properties?: any,
    conditional?: Conditional,
    customConditional?: string,
    attributes?: any,
    tags?: string[],
    defaultValue?: string|any,
    kickbox?: any,
    theme?: "info"|"primary"|"secondary"|"success"|"danger"|"warning"|"default",
    allowMultipleMasks?: boolean,
    dbIndex?: boolean,
    indexeddb?: any,
    inline?: boolean,
    customError?: string,
    id?: string,
    breadcrumbClickable?: boolean,
    authenticate?: boolean,
    allowCalculateOverride?: boolean,
    clearOnRefresh?: boolean,
    isNew?: boolean,
    tree?: boolean,
    fieldSet?: boolean,
    breadcrumb?: string,
    reference?: boolean,
    form?: string,
    allowPrevious?: boolean,
    revisions?: string,
    _vid?: number,
    controller?: string
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
    customPrivate?: boolean,
    strictDateValidation?: boolean|"",
    select?: boolean,
    multiple?: boolean,
    unique?: boolean
}

export interface Conditional {
    show?: boolean|string,
    when?: string|null,
    eq?: string|number,
    json?: any
}


export interface FormEvents {
    eventName: 'initializing'|'initialized'|'rendered'|'errors'|'valid'|'change',
    details?: {
        eventInfo: Event,
        key?: string,
        value?: any
    }
}

/**
 * The main form model that will initialize the renderer.
 *
 * @constructor {@link AFormModel} is required to initialize the library
 */
export class AFormModelClass {

    private aFormSubject?: BehaviorSubject<AFormModel|undefined> = new BehaviorSubject<AFormModel|undefined>(this.aForm)

    formElement: HTMLFormElement | undefined;

    aFormHolder: any = this.getForm();

    private aFormData: BehaviorSubject<any> = new BehaviorSubject<any>({});

    renderer = new RendererHelper(this);

    notifyFormEvents: Subject<FormEvents> = new Subject<FormEvents>();

    store = new ConfigureStore(this.uniqFormId ? this.uniqFormId : "").init();

    constructor(private aForm?: AFormModel, private divElement?: HTMLDivElement, private uniqFormId?: string) {
        this.initializeAForm?.()
    }

    /**
     * Initializes the library.
     *
     * @description Initializes the for library and notifies observers about the form rendered.
     */
    private initializeAForm() {
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
    modifyModel(aForm: Partial<AFormModel>) {
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
    getCurrentModel() {
        return this.aFormSubject?.value;
    }

    /**
     * Provides interface as observable so all components subscribed can listen for changes.
     */
    observeAForm() {
        return this.aFormSubject?.asObservable();
    }

    /**
     * The method that initializes the renderer
     *
     * @description This method detects the type of display mode to choose. Currently we support form and wizard
     */
    renderModel(): Promise<AFormModelClass> {
        // Initialize the main container
        switch (this.aForm?.display) {
            case "form": {
                return this.renderForm()
            }
            case "wizard": {
                return this.renderForm()
            }
            default:
                return new Promise<AFormModelClass>((resolve, reject) => reject("Display type not available."))
        }
    }

    /**
     * The private method that renders the form.
     *
     * @description This method renders the components within form
     */
    private renderForm(): Promise<AFormModelClass> {
        return new Promise<AFormModelClass>((resolve, reject) => {
            try {
                $(this.divElement as HTMLDivElement).addClass('ui').addClass('container');
                const form = document.createElement('form');
                form.classList.add('ui', 'form');
                this.formElement = form;
                const divContainer: HTMLDivElement = document.createElement('div');
                divContainer.classList.add('a-form-content-holder');
                if (this.aForm && this.aForm.components) {
                    this.renderer.renderComponent(this.aForm, divContainer)
                    this.formElement?.append(divContainer)
                }
                this.divElement?.append(form)
                if (this.divElement) {
                    this.aFormHolder = $(this.divElement).find('form')
                }
                // Notify form ready event
                this.notifyFormEvents.next({eventName: 'rendered'})
                resolve(this)
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * The private method that renders the wizard.
     *
     * @description This method renders the components within wizard, can include forms internally.
     */
    private renderWizard() {
        const divContainer = document.createElement('div');
        $(this.divElement as HTMLDivElement).append(divContainer).addClass('ui').addClass('container');
        divContainer.innerText = (this.aForm?.label as string)
    }

    /**
     * Dispatches the event on {@link divElement}.
     *
     * @description Dispatches the event on Div element. Helps client in listen to events on div element.
     */
    dispatchEvent(eventName: string|undefined) {
        if (eventName) {
            this.divElement?.dispatchEvent(new Event(eventName));
        }
    }

    /**
     * Returns the form data
     *
     * @description This method returns the form data. The data is consolidated based on keys provided while rendering.
     */
    getFormData() {
        if (this.divElement) {
            const form = this.aFormHolder.form('get values');
            this.aFormData?.next(form);
        }
    }


    /**
     * Reset the form
     *
     * @description This method helps in resetting the form.
     */
    resetForm() {
        if (this.divElement) {
            this.aFormHolder.form('reset');
        }
    }

    /**
     * Load data to form
     *
     * @description Loads data to form.
     */
    setFormData(values: any) {
        if (this.divElement) {
            this.aFormHolder.form('set values', values);
        }
    }

    /**
     * Subscribe for formData
     *
     * @description This method helps client in observing for changes done on form.
     */
    observeFormData() {
        return this.aFormData.asObservable();
    }

    private getForm() {
        if (this.divElement) {
            return $(this.divElement).find('form')
        }
    }
}
