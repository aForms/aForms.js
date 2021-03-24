import {AFormModel, AFormModelClass} from "../../a-form.model";
import {ClassesHelper} from "../../helpers/classes.helper";
import {DefaultsHelper} from "../../helpers/defaults.helper";

export interface ButtonModal {
    disableOnInvalid?: boolean,
    action?: "saveState"|"submit"|"event"|"reset",
    event?: string,
    showValidations?: boolean,
    size?: string,
    leftIcon?: string,
    rightIcon?: string,
    block?: boolean
}

export class ButtonBuilder {

    defaults: DefaultsHelper = new DefaultsHelper(this.aFormModelClass)

    constructor(private buttonModal: AFormModel, private aFormModelClass: AFormModelClass) { }

    build(): HTMLButtonElement {
        const buttonDiv = document.createElement('button');
        buttonDiv.innerText = (this.buttonModal.label as string)
        buttonDiv.classList.add('ui', 'button')
        buttonDiv.type = 'button'
        buttonDiv.setAttribute('aria-label', (this.buttonModal.label as string))
        buttonDiv.tabIndex = this.buttonModal?.tabindex ? Number(this.buttonModal?.tabindex) : 0
        if (this.buttonModal?.customClass) {
            new ClassesHelper().addClasses(this.buttonModal?.customClass, buttonDiv)
        }
         switch (this.buttonModal?.theme) {
             case "primary":
                 buttonDiv.classList.add(this.buttonModal?.theme)
                 break;
             case "danger":
                 buttonDiv.classList.add('red')
                 break;
             case "secondary":
                 buttonDiv.classList.add(this.buttonModal?.theme)
                 break;
         }
         switch (this.buttonModal?.action) {
             case "submit":
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.getFormData();
                 }
                 break;
             case "event":
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.dispatchEvent(this.buttonModal?.event);
                 }
                 break;
             case "reset":
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.resetForm();
                 }
                 break;
             case "saveState":
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.getFormData();
                 }
                 break;
             default:
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.getFormData();
                 }
         }
        return buttonDiv
    }

}
