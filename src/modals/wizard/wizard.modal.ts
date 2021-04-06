import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ConditionalHelper} from "../../helpers/conditional.helper";
import {getFormById, updateFormData} from "../../store/reducers/form-data.reducer";
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

        const breadcrumb = document.createElement('div')
        breadcrumb.classList.add('ui', 'breadcrumb')
        breadcrumb.setAttribute('aria-label', 'Breadcrumb')

        const contentHolder = document.createElement('div')
        contentHolder.classList.add('ui', 'basic', 'segment')

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
                    if (this.pageIndex >= 0 && this.pageIndex < (this.aFormModel.components?.length - 1)) {
                        // TODO: Add next button
                    }
                    if (this.pageIndex >= 1 && this.pageIndex <= (this.aFormModel.components?.length - 1)) {
                        // TODO: Add previous button
                    }
                    if (this.pageIndex === (this.aFormModel.components?.length - 1)) {
                        // TODO: Add Submit button
                    }
                    // TODO: Add cancel button
                }

                // Notify form ready event
                this.aFormClass.formManager = $('#' + this.aFormClass.uniqFormId).form({
                    on: 'blur',
                    inline : true,
                    debug: true,
                    preventLeaving: true
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
