
// @ts-ignore
import * as jsonLogic from 'json-logic-js';
import {SelectBuilder} from "../modals/select/select.modal";
import {TextfieldBuilder} from "../modals/textfield/textfield.modal";
import {RadioBuilder} from "../modals/radio/radio.modal";
import {ButtonBuilder} from "../modals/button/button.modal";
import {TextareaBuilder} from "../modals/textarea/textarea.modal";
import {WizardBuilder} from "../modals/wizard/wizard.modal";
import {AFormModel, AFormModelClass} from "../a-form.model";
import {BasicWrapperBuilder} from "../modals/layout/basic-wrapper/basic-wrapper.modal";
import {PanelBuilder} from "../modals/layout/panel/panel.modal";

// Condition is gonna be the main component to decide what will be rendered and what will be hidden.
export interface ConditionModeler {
    condition: any,
    key: string,
    wrapperDiv: HTMLDivElement|HTMLButtonElement,
    wrapperClass: SelectBuilder|TextfieldBuilder|RadioBuilder|ButtonBuilder|TextareaBuilder|WizardBuilder|AFormModelClass|BasicWrapperBuilder|PanelBuilder
    children: {
        [prop: string]: ConditionModeler
    }
}


export class ConditionalHelper {

    formConditionModelers: { [prop: string]: ConditionModeler } = {};

    checkCondition(condition: any, data: any) {
        return condition ? jsonLogic.apply(condition, {data: data}) : true
    }

    addConditionModels(formConditionModeler: ConditionModeler) {
        return this.formConditionModelers[formConditionModeler.key] = formConditionModeler
    }
}
