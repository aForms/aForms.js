import {AFormModel, AFormModelClass} from "../../a-form.model";

export interface ButtonModal {
    disableOnInvalid?: boolean,
    theme?: "info"|"primary"|"secondary"|"success"|"danger"|"warning",
    action?: "saveState"|"submit"|"event"|"reset",
    event?: string,
    showValidations?: boolean,
    size?: string,
    leftIcon?: string,
    rightIcon?: string,
    block?: boolean
}

export class ButtonBuilder {

    constructor(private buttonModal: AFormModel, private aFormModelClass?: AFormModelClass) { }

    build(): HTMLButtonElement {
        const buttonDiv = document.createElement('button');
        buttonDiv.innerText = (this.buttonModal.label as string)
        buttonDiv.classList.add('ui', 'button')
        buttonDiv.type = 'button'
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
             default:
                 buttonDiv.onclick = () => {
                     this.aFormModelClass?.getFormData();
                 }
         }
        return buttonDiv
    }

}
