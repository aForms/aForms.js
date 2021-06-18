import {TextfieldModal} from "./modals/textfield/textfield.modal";
import {TextareaModal} from "./modals/textarea/textarea.modal";
import {BehaviorSubject, Subject, Subscription} from "rxjs";
import {ButtonModal} from "./modals/button/button.modal";
import {PanelModal} from "./modals/layout/panel/panel.modal";
import {ColumnsModal} from "./modals/layout/columns/columns.modal";
import {SignatureModal} from "./modals/signature/signature.modal";
import {SurveyModal} from "./modals/survey/survey.modal";
import {ContentModal} from "./modals/content/content.modal";
import {BasicWrapperModal} from "./modals/layout/basic-wrapper/basic-wrapper.modal";
import {RendererHelper} from "./helpers/renderer.helper";
import {SelectModal} from "./modals/select/select.modal";
import { RadioModal } from "./modals/radio/radio.modal";
import {FunctionsHelpers} from "./helpers/functions.helpers";
import {WizardBuilder} from "./modals/wizard/wizard.modal";
import {ConditionalHelper} from "./helpers/conditional.helper";
import { v4 as uuidV4 } from 'uuid';
import {ConfigureStore} from "./store";
import {configAdded} from "./store/reducers/form-config.reducer";
import {FormData, getFormById, insertFormData, updateFormData} from "./store/reducers/form-data.reducer";
import {EnhancedStore, Unsubscribe} from "@reduxjs/toolkit";
import { ErrorPrompt } from "./config/prompt.model";
import axios, {AxiosInstance} from 'axios';

declare var $: JQueryStatic;

export interface AFormModel extends ProjectModel, TextfieldModal, TextareaModal, ButtonModal,
    PanelModal, ColumnsModal, SignatureModal, SurveyModal, ContentModal, BasicWrapperModal, SelectModal, RadioModal {
    display?: "form" | "wizard"
    settings?: any
    components?: AFormModel[]
    type?: "textfield" | "button" | "textarea" | "panel" | "form" | "content" | "signature" | "columns" | "survey" | "phoneNumber" | "email" | "select" | "radio" | "wizard",
    inputType?: "phoneNumber" | "email" | "text" | "radio"
    key?: string
    tableView?: boolean
    hideLabel?: boolean
    hidden?: boolean
    label?: string
    modalEdit?: boolean
    disabled?: boolean
    autofocus?: boolean
    tabindex?: number | string
    customClass?: string | string[]
    autocomplete?: "on" | "off"
    prefix?: string
    suffix?: string
    tooltip?: string
    description?: string
    placeholder?: string
    clearOnHide?: boolean
    labelPosition?: "left-left" | "left-right" | "right-left" | "right-right" | "bottom" | "top"
    customDefaultValue?: string | any
    calculateValue?: string | any
    encrypted?: boolean
    redrawOn?: "data" | "textArea" | "submit" | ""
    validate?: Validation
    validateOn?: string
    unique?: boolean
    errorLabel?: string
    properties?: any
    conditional?: Conditional
    customConditional?: string
    attributes?: any
    tags?: string[]
    defaultValue?: string | any
    kickbox?: any
    theme?: "info" | "primary" | "secondary" | "success" | "danger" | "warning" | "default"
    allowMultipleMasks?: boolean
    dbIndex?: boolean
    indexeddb?: any
    inline?: boolean
    customError?: string
    id?: string
    breadcrumbClickable?: boolean
    authenticate?: boolean
    allowCalculateOverride?: boolean
    clearOnRefresh?: boolean
    isNew?: boolean
    tree?: boolean
    fieldSet?: boolean
    breadcrumb?: string
    reference?: boolean
    form?: string
    allowPrevious?: boolean
    revisions?: string
    _vid?: number
    controller?: string
    idPath?: string
    useExactSearch?: boolean
    dataGridLabel?: boolean
    src?: string
}

export interface ProjectModel {
    _id?: string
    machineName?: string
    modified?: string
    title?: string
    name?: string
    path?: string
    project?: string
    created?: string
    owner?: string
    submissionAccess?: any
    access?: any
}

export interface Validation {
    required?: boolean
    pattern?: string
    customMessage?: string
    json?: any
    custom?: string
    minLength?: number | string
    maxLength?: number | string
    minWords?: number | string
    maxWords?: number | string
    customPrivate?: boolean
    strictDateValidation?: boolean | ""
    select?: boolean
    multiple?: boolean
    unique?: boolean
}

export interface Conditional {
    show?: boolean | string
    when?: string | null
    eq?: string | number
    json?: any
}


export interface FormEvents {
    eventName: 'initializing' | 'initialized' | 'rendered' | 'errors' | 'valid' | 'change'| 'ready',
    details?: {
        eventInfo?: Event,
        key?: string,
        value?: any
    }
}

export enum Mode {
    VIEW,
    EDIT
}

export interface ProxyUrl {
    from?: string
    to?: string
    headers?: string[]
    cookies?: string[]
}

export interface LibraryConfig {
    primaryColor?: string
    secondaryColor?: string
    errorColor?: string
    warningColor?: string
    wizardConfiguration?: WizardConfig
    proxyUrl?: ProxyUrl
    debug?: boolean
    pageUnloadEvent?: boolean
    viewOnly?: Mode
}

export interface WizardConfig {
    previousButton?: boolean
    nextButton?: boolean
    cancelButton?: boolean
    validateButton?: boolean
    saveDraftButton?: boolean
    submitButton?: boolean
}

/**
 * The main form model that will initialize the renderer.
 *
 * @constructor {@link AFormModel} is required to initialize the library
 */
export class AFormModelClass {

    private aFormSubject?: BehaviorSubject<AFormModel | undefined> = new BehaviorSubject<AFormModel | undefined>(this.aForm)

    formElement: HTMLFormElement | undefined;

    private aFormData: BehaviorSubject<any> = new BehaviorSubject<any>({});

    renderer = new RendererHelper(this);

    notifyFormEvents: Subject<FormEvents> = new Subject<FormEvents>();

    uniqFormId: string = uuidV4() as string

    conditionalHelper = new ConditionalHelper();

    validationHelper = new FunctionsHelpers(this);

    formWizard: WizardBuilder | undefined;

    removableSubscribers: Unsubscribe[] | Subscription[] | any = [];

    modeSubject: BehaviorSubject<Mode> = new BehaviorSubject<Mode>(Mode.VIEW)

    formManager: any;

    formLiveRegion: HTMLDivElement = document.createElement('div')

    formLiveAlertRegion: HTMLDivElement = document.createElement('div')

    store: EnhancedStore;

    errorPrompts: ErrorPrompt = {};

    axiosInstance: AxiosInstance = axios.create()

    libraryConfig: LibraryConfig = {
        wizardConfiguration: {
            cancelButton: true,
            nextButton: true,
            previousButton: true,
            saveDraftButton: true,
            submitButton: true,
            validateButton: true
        }
    }

    constructor(private aForm?: AFormModel, private divElement?: HTMLDivElement, uniqFormId?: string, private libConfig?: LibraryConfig) {

        if (uniqFormId) {
            this.uniqFormId = uniqFormId
        }

        if (libConfig) {
            this.libraryConfig = { ...this.libraryConfig, ...libConfig}
        }

        this.modeSubject.next(this.libraryConfig.viewOnly)

        this.store = new ConfigureStore(this).configureStore()

        this.store.dispatch(configAdded({
            name: this.uniqFormId,
            createdOn: new Date().toDateString(),
            lastUpdated: new Date().toDateString()
        }))

        this.store.dispatch(insertFormData({id: uniqFormId ?? uuidV4(), data: {}, currentPage: 0}))

        if (libConfig) {
            if (libConfig.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', libConfig.primaryColor);
            }
        }

        this.libraryConfig.proxyUrl?.headers?.forEach(value => {
            this.axiosInstance.defaults.headers.common[value] = localStorage.getItem(value)
        })

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
        // @ts-ignore
        window["AFORM"] = this
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
     * default rendered as form
     */
    renderModel(): Promise<AFormModelClass> {
        // Initialize the main container
        switch (this.aForm?.display) {
            case "form": {
                return this.renderForm()
            }
            case "wizard": {
                return this.renderWizard()
            }
            default:
                return this.renderForm()
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
                $(this.divElement as HTMLDivElement).addClass('ui');
                const form = document.createElement('form');
                form.classList.add('ui', 'form');
                form.setAttribute('id', this.uniqFormId)
                this.formElement = form;
                const divContainer: HTMLDivElement = document.createElement('div');
                divContainer.classList.add('a-form-content-holder');
                divContainer.style.outline = 'none';
                divContainer.style.margin = '1rem';
                divContainer.tabIndex = -1
                if (this.aForm && this.aForm.components) {
                    this.renderer.renderComponent(this.aForm, divContainer)
                    this.formElement?.append(divContainer)
                }
                this.divElement?.append(form)

                // Notify form ready event
                this.formManager = $('#' + this.uniqFormId).form({
                    on: 'blur',
                    inline : true,
                    debug: false,
                    preventLeaving: true,
                    autoCheckRequired: true,
                    prompt: this.errorPrompts
                })
                // Notify form ready event
                this.notifyFormEvents.next({eventName: 'rendered'})
                this.notifyFormEvents.next({eventName: 'ready'})
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
    private renderWizard(): Promise<AFormModelClass> {
        return new Promise((resolve, reject) => {
            try {
                $(this.divElement as HTMLDivElement).addClass('ui');
                const form = document.createElement('form');
                form.classList.add('ui', 'form', 'segment');
                form.setAttribute('id', this.uniqFormId)
                form.setAttribute('role', 'form')
                this.formElement = form;
                const divContainer: HTMLDivElement = document.createElement('div');
                divContainer.classList.add('a-form-wizard-holder', 'a-form-form');
                divContainer.style.outline = 'none';
                divContainer.style.margin = '1rem';
                divContainer.tabIndex = -1
                if (this.aForm && this.aForm.components) {
                    this.formWizard = new WizardBuilder(this.aForm, this, this.conditionalHelper)
                    const formContainerDiv = this.formWizard.build();
                    divContainer?.append(formContainerDiv)
                    this.formElement?.append(divContainer)
                }
                const errorBlock = document.createElement('div')
                errorBlock.classList.add('ui', 'error', 'message')
                form.append(errorBlock)
                this.formLiveRegion.setAttribute('role', 'status')
                this.formLiveRegion.setAttribute('aria-live', 'assertive')
                this.formLiveRegion.classList.add('visually-hidden')
                this.formLiveRegion.style.position = 'absolute'
                this.formLiveRegion.style.left = '-10000px'
                this.formLiveRegion.style.width = '1px'
                this.formLiveRegion.style.height = '1px'
                this.formLiveRegion.style.overflow = 'hidden'
                this.divElement?.append(form)
                this.divElement?.append(this.formLiveRegion)

                this.formLiveAlertRegion.setAttribute('role', 'status')
                this.formLiveAlertRegion.setAttribute('aria-live', 'assertive')
                this.formLiveAlertRegion.classList.add('visually-hidden')
                this.formLiveAlertRegion.style.position = 'absolute'
                this.formLiveAlertRegion.style.left = '-10000px'
                this.formLiveAlertRegion.style.width = '1px'
                this.formLiveAlertRegion.style.height = '1px'
                this.formLiveAlertRegion.style.overflow = 'hidden'
                this.divElement?.append(this.formLiveAlertRegion)

                // An async dispatch to trigger initial page load.
                const asyncDispatch = (dispatch: (arg0: { payload: FormData; type: string; }) => void, getState: () => any) => {
                    dispatch(updateFormData({id: this.uniqFormId, currentPage: 0}))
                }
                // @ts-ignore
                this.store.dispatch(asyncDispatch)
                this.notifyFormEvents.next({eventName: 'rendered'})
                resolve(this)
            } catch (e) {
                reject(e)
            }
        })
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
        return $('#' + this.uniqFormId).form('get values');
    }


    /**
     * Reset the form
     *
     * @description This method helps in resetting the form.
     */
    resetForm() {
        if (this.divElement) {
            $('#' + this.uniqFormId).form('reset');
        }
    }

    loadFormData(reset?: boolean) {
        this.setFormData(getFormById(this.store.getState().formData, this.uniqFormId)?.data, undefined, reset)
    }

    /**
     * Load data to form
     *
     * @description Loads data to form.
     */
    setFormData(values: any, label?: string, reset?: boolean) {
        if (this.divElement) {
            const form = $('#' + this.uniqFormId)
            if (label) {
                if (reset) {
                    form.form('reset', label);
                }
                form.form('set value', label, values);

            } else {
                if (reset) {
                    form.form('reset');
                }
                form.form('set values', values);
            }
        }
    }

    insertStoreData(values?: any) {
        // An async dispatch to trigger initial page load.
        const asyncDispatch = (dispatch: (arg0: { payload: FormData; type: string; }) => void, getState: () => any) => {
            dispatch(updateFormData({id: this.uniqFormId, data: values}))
        }
        // @ts-ignore
        this.store.dispatch(asyncDispatch)
        const currentState = getFormById(this.store.getState().formData, this.uniqFormId )
        this.formManager.form('set values', currentState?.data);
    }

    getStoreData() {
        return getFormById(this.store.getState().formData, this.uniqFormId)?.data
    }

    wizardNextPage() {
        const valid = this.formManager.form('validate form')
        if (valid === true) {
            this.store.dispatch(updateFormData({id: this.uniqFormId, currentPage: this.formWizard?.pageIndex as number + 1}))
        } else {
            if (this.gatherErrors()?.length) {
                this.formLiveAlertRegion.innerText = 'Error found on form, fix them to proceed.'
            }
        }
    }

    wizardPreviousPage() {
        if (this.formWizard?.pageIndex as number > 0) {
            this.store.dispatch(updateFormData({id: this.uniqFormId, currentPage: this.formWizard?.pageIndex as number - 1}))
        }
    }

    saveWizard() {
        const valid = this.formManager.form('validate form')
        if (valid === true) {
            this.notifyChanges()
            return getFormById(this.store.getState().formData, this.uniqFormId )?.data
        } else {
            if (this.gatherErrors()?.length) {
                this.formLiveAlertRegion.innerText = 'Error found on form, fix them to proceed.'
            }
        }
    }

    notifyChanges(by?: string) {
        const currentState = getFormById(this.store.getState().formData, this.uniqFormId )
        this.store.dispatch(updateFormData({id: this.uniqFormId, data: { ...currentState?.data, ...this.getFormData()}}))
    }

    gatherErrors() {
        return this.formElement?.querySelectorAll('div.field.error')
    }

    validateForm() {
        return this.formManager.form('validate form')
    }

    toggleView(value?: Mode): Mode {
        if (value) {
            this.modeSubject.next(value)
            return value;
        }
        switch (this.modeSubject.getValue()) {
            case Mode.EDIT:
                this.modeSubject.next(Mode.VIEW)
                return Mode.VIEW
            case Mode.VIEW:
                this.modeSubject.next(Mode.EDIT)
                return Mode.EDIT
        }
    }
}
