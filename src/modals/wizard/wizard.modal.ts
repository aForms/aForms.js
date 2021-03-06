import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ConditionalHelper} from "../../helpers/conditional.helper";
import {getFormById, resetFormData, updateFormData} from "../../store/reducers/form-data.reducer";
import {Subscription} from "rxjs";
import {Unsubscribe} from "@reduxjs/toolkit";

export class WizardBuilder {

    pageIndex: number|undefined = undefined

    wrapper = document.createElement('div')

    breadcrumb = document.createElement('nav')

    constructor(private aFormModel: AFormModel, private aFormClass: AFormModelClass, private conditionalHelper: ConditionalHelper) { }

    /**
     * Builds the wizard breadcrumb and container for form
     */
    build(options?: any): HTMLDivElement {

        this.wrapper = document.createElement('div')
        this.wrapper.style.margin = '1rem'

        this.breadcrumb.classList.add('ui', 'breadcrumb', 'a-form-breadcrumb')
        this.breadcrumb.setAttribute('aria-label', 'Breadcrumb')

        const contentHolder = document.createElement('div')
        contentHolder.classList.add('ui', 'basic', 'segment', 'a-form-wizard-holder', 'a-form-form')

        const buttonHolder = document.createElement('div')
        buttonHolder.classList.add('buttons')

        this.aFormClass.notifyFormEvents.asObservable().subscribe(value => {
            if ( value.eventName === "ready") {
                this.aFormClass.loadFormData()
            }
        })

        // Subscribing for change events
        this.aFormClass.store.subscribe(() => {
            const currentState = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )
            if (currentState?.currentPage !== this.pageIndex) {
                $(contentHolder).empty()
                // Removing subscriber linked to old page
                this.aFormClass.removableSubscribers.forEach((old: Subscription|Unsubscribe) => {
                    if (old instanceof Subscription) {
                        old.unsubscribe()
                    } else {
                        old()
                    }
                })
                this.aFormClass.removableSubscribers = []

                this.pageIndex = currentState?.currentPage as number
                this.togglePage(currentState?.currentPage as number)

                this.aFormClass.renderer
                    .renderComponent(this.aFormModel.components?.[currentState?.currentPage as number] as AFormModel, contentHolder)

                if (this.aFormModel.components?.length) {
                    $(buttonHolder).empty()
                    if (this.aFormClass?.libraryConfig?.wizardConfiguration?.cancelButton) {
                        const buttonDiv = document.createElement('div')
                        buttonDiv.classList.add('ui', 'button')
                        buttonDiv.innerText = 'Cancel'
                        buttonDiv.tabIndex = 0;
                        buttonDiv.onclick = () => {
                            this.aFormClass.store.dispatch(resetFormData({id: this.aFormClass.uniqFormId}))
                        }
                        buttonHolder.append(buttonDiv)
                    }

                    if (this.aFormClass?.libraryConfig?.wizardConfiguration?.validateButton) {
                        const validateButtonDiv = document.createElement('div')
                        validateButtonDiv.classList.add('ui', 'button')
                        validateButtonDiv.innerText = 'Validate'
                        validateButtonDiv.tabIndex = 0;
                        validateButtonDiv.onclick = () => {
                            this.aFormClass.formManager.form('validate form')
                        }
                        buttonHolder.append(validateButtonDiv)
                    }

                    if (this.pageIndex >= 1 &&
                        this.pageIndex <= (this.aFormModel.components?.length - 1) &&
                        this.aFormClass?.libraryConfig?.wizardConfiguration?.previousButton ) {
                        const buttonDiv = document.createElement('div')
                        buttonDiv.classList.add('ui', 'button')
                        buttonDiv.innerText = 'Previous'
                        buttonDiv.onclick = () => {
                            this.aFormClass.store
                                .dispatch(updateFormData({id: this.aFormClass.uniqFormId,
                                    currentPage: this.pageIndex as number >= 1 ? this.pageIndex as number - 1 : 0}))
                        }
                        buttonDiv.tabIndex = 0;
                        buttonHolder.append(buttonDiv)
                    }
                    if (this.pageIndex >= 0 && this.pageIndex < (this.aFormModel.components?.length - 1) &&
                        this.aFormClass?.libraryConfig?.wizardConfiguration?.nextButton ) {
                        const buttonDiv = document.createElement('div')
                        buttonDiv.classList.add('ui', 'button')
                        buttonDiv.innerText = 'Next'
                        buttonDiv.onclick = () => {
                            this.aFormClass.store
                                .dispatch(updateFormData({id: this.aFormClass.uniqFormId,
                                    currentPage: this.pageIndex as number >= 0 ? this.pageIndex as number + 1 : 0}))
                        }
                        buttonDiv.tabIndex = 0;
                        buttonHolder.append(buttonDiv)
                    }
                    if (this.pageIndex === (this.aFormModel.components?.length - 1) &&
                        this.aFormClass?.libraryConfig?.wizardConfiguration?.submitButton ) {
                        const buttonDiv = document.createElement('div')
                        buttonDiv.classList.add('ui', 'button', 'primary')
                        buttonDiv.innerText = 'Submit'
                        buttonDiv.tabIndex = 0;
                        buttonHolder.append(buttonDiv)
                    }
                }

                // Notify form ready event
                this.aFormClass.formManager = $('#' + this.aFormClass.uniqFormId).form({
                    on: 'blur',
                    inline : true,
                    debug: this.aFormClass?.libraryConfig?.debug,
                    preventLeaving: this.aFormClass?.libraryConfig?.pageUnloadEvent,
                    autoCheckRequired: true,
                    prompt: this.aFormClass.errorPrompts,
                    templates: {
                        prompt: (e: string[], t: any) => {
                             return $("<div class='ui text'/>").addClass(t).html(e[0])
                        }
                    }
                })

                // Notify form ready event
                setTimeout(() => {
                    this.aFormClass.getFormData()
                    this.aFormClass.notifyFormEvents.next({eventName: 'ready', details: {value: this.aFormClass.formManager}})
                }, 500)
            }
        })

        this.buildBreadcrumb()

        this.aFormClass.store.subscribe(() => {
            this.buildBreadcrumb()
        })

        this.wrapper.append(this.breadcrumb)
        this.wrapper.append(contentHolder)
        this.wrapper.append(buttonHolder)
        return this.wrapper
    }

    buildBreadcrumb() {
        this.cleanBreadcrumb()
        const data = getFormById(this.aFormClass.store.getState().formData, this.aFormClass.uniqFormId )?.data
        this.aFormModel?.components?.forEach((value: AFormModel, index) => {
            const visible = this.aFormClass.conditionalHelper.checkCondition(value?.conditional?.json, data)
            if (visible) {
                const a = document.createElement('a')
                a.classList.add('section')
                a.innerText = value?.title as string
                a.style.padding = '5px'
                a.setAttribute('data-index', String(index))
                a.style.color = 'var(--primary-color)'
                this.aFormClass.validationHelper.addFocusEvent(a)
                a.setAttribute('role', 'button')
                a.tabIndex = 0
                if (index !== 0) {
                    const i = document.createElement('i')
                    i.classList.add('right', 'angle', 'icon', 'divider')
                    this.breadcrumb.append(i)
                } else {
                    a.setAttribute('aria-current', 'location')
                    a.classList.add('active')
                }
                a.addEventListener('click', ev => {
                    this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, currentPage: index}))
                })
                this.breadcrumb.append(a)
            }
        })
    }

    togglePage(index: number, ev?: MouseEvent, ) {
        this.pageIndex = index;
        this.breadcrumb.querySelectorAll('a').forEach((aTag, count) => {
            if (Number(aTag.getAttribute('page-index')) === this.pageIndex) {
                aTag.classList.contains('active') || aTag.classList.add('active');
                aTag.setAttribute('aria-current', 'location')
            } else {
                if ((aTag as HTMLAnchorElement).classList.contains('active')) {
                    aTag.classList.remove('active');
                    aTag.removeAttribute('aria-current')
                }
            }
        });
    }

    private cleanBreadcrumb() {
        this.breadcrumb.innerHTML = ''
    }
}
