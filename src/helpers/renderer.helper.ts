import {ButtonBuilder} from "../modals/button/button.modal";
import {TextareaBuilder} from "../modals/textarea/textarea.modal";
import {TextfieldBuilder} from "../modals/textfield/textfield.modal";
import {PanelBuilder} from "../modals/layout/panel/panel.modal";
import {BasicWrapperBuilder} from "../modals/layout/basic-wrapper/basic-wrapper.modal";
import {AFormModel, AFormModelClass} from "../a-form.model";
import {ContentBuilder} from "../modals/content/content.modal";
import {ColumnsBuilder} from "../modals/layout/columns/columns.modal";
import {RadioBuilder} from "../modals/radio/radio.modal";
import {SelectBuilder} from "../modals/select/select.modal";

export class RendererHelper {

    constructor(private aFormsClass: AFormModelClass) { }

    renderComponent(aFormModel: AFormModel, container: HTMLDivElement) {
        switch (aFormModel.type) {
            case "button":
                container?.append(new ButtonBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "textarea":
                container?.append(new TextareaBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "textfield":
                container?.append(new TextfieldBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "panel":
                container?.append(new PanelBuilder(aFormModel, this.aFormsClass).createPanel())
                break;
            case "content":
                container?.append(new ContentBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "columns":
                container?.append(new ColumnsBuilder(aFormModel, this.aFormsClass).createColumns())
                break;
            case "email":
                container?.append(new TextfieldBuilder(aFormModel, this.aFormsClass).build({type: aFormModel.type}))
                break;
            case "phoneNumber":
                container?.append(new TextfieldBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "survey":
                break;
            case "signature":
                break;
            case "radio":
                container?.append(new RadioBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "select":
                container?.append(new SelectBuilder(aFormModel, this.aFormsClass).build())
                break;
            default:
                container?.append(new BasicWrapperBuilder(aFormModel, this.aFormsClass).createPanel())
        }
    }

}
