import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ConditionalHelper} from "../../helpers/conditional.helper";
import {getFormById, resetFormData, updateFormData} from "../../store/reducers/form-data.reducer";
import {Subscription} from "rxjs";
import {Unsubscribe} from "@reduxjs/toolkit";

export class WizardBuilder {

    pageIndex: number|undefined = undefined

    wrapper = document.createElement('div')

    constructor(private aFormModel: AFormModel, private aFormClass: AFormModelClass, private conditionalHelper: ConditionalHelper) { }


    /**
     * Builds the wizard breadcrumb and container for form
     */
    build(options?: any): HTMLDivElement {

        this.wrapper = document.createElement('div')
        this.wrapper.style.margin = '1rem'

        const breadcrumb = document.createElement('nav')
        breadcrumb.classList.add('ui', 'breadcrumb')
        breadcrumb.setAttribute('aria-label', 'Breadcrumb')

        const contentHolder = document.createElement('div')
        contentHolder.classList.add('ui', 'basic', 'segment')

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

                this.togglePage(currentState?.currentPage as number)
                this.pageIndex = currentState?.currentPage as number

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

                    // if (this.aFormClass?.libraryConfig?.wizardConfiguration?.saveDraftButton) {
                    //     const saveButtonDiv = document.createElement('div')
                    //     saveButtonDiv.classList.add('ui', 'button')
                    //     saveButtonDiv.innerText = 'Save as Draft'
                    //     saveButtonDiv.tabIndex = 0;
                    //     buttonHolder.append(saveButtonDiv)
                    // }

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
                    debug: false,
                    preventLeaving: true,
                    autoCheckRequired: true,
                    prompt: this.aFormClass.errorPrompts
                })

                // Notify form ready event
                setTimeout(() => {
                    this.aFormClass.notifyFormEvents.next({eventName: 'ready', details: {value: this.aFormClass.formManager}})
                }, 500)
            }
        })

        this.aFormModel?.components?.forEach((value: AFormModel, index) => {
            const a = document.createElement('a')
            a.classList.add('section')
            a.innerText = value?.title as string
            a.style.padding = '5px'
            a.style.color = 'var(--primary-color)'
            this.aFormClass.validationHelper.addFocusEvent(a)
            a.setAttribute('role', 'button')
            a.tabIndex = 0
            if (index !== 0) {
                const i = document.createElement('i')
                i.classList.add('right', 'angle', 'icon', 'divider')
                breadcrumb.append(i)
            } else {
                a.setAttribute('aria-current', 'location')
                a.classList.add('active')
            }
            a.addEventListener('click', ev => {
                this.aFormClass.store.dispatch(updateFormData({id: this.aFormClass.uniqFormId, currentPage: index}))
            })
            breadcrumb.append(a)
        })
        this.wrapper.append(breadcrumb)
        this.wrapper.append(contentHolder)
        this.wrapper.append(buttonHolder)
        return this.wrapper
    }

    togglePage(index: number, ev?: MouseEvent, ) {
        this.pageIndex = index;
        this.wrapper.querySelectorAll('.breadcrumb>a').forEach((aTag, count) => {
            if (count === index) {
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
}
