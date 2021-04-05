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
                const buttonBuilder = new ButtonBuilder(aFormModel, this.aFormsClass)
                const buttonBuilderDiv = buttonBuilder.build();
                container?.append(buttonBuilderDiv)
                break;
            case "textarea":
                const textareaBuilder = new TextareaBuilder(aFormModel, this.aFormsClass)
                const textareaBuilderDiv = textareaBuilder.build()
                container?.append(textareaBuilderDiv)
                break;
            case "textfield":
                const textfieldBuilder = new TextfieldBuilder(aFormModel, this.aFormsClass)
                const textfieldBuilderDiv = textfieldBuilder.build()
                container?.append(textfieldBuilderDiv)
                break;
            case "panel":
                const panelBuilder = new PanelBuilder(aFormModel, this.aFormsClass)
                const panelBuilderDiv = panelBuilder.createPanel()
                container?.append(panelBuilderDiv)
                break;
            case "content":
                container?.append(new ContentBuilder(aFormModel, this.aFormsClass).build())
                break;
            case "columns":
                container?.append(new ColumnsBuilder(aFormModel, this.aFormsClass).createColumns())
                break;
            case "email":
                const textfieldBuilderEmail = new TextfieldBuilder(aFormModel, this.aFormsClass)
                const textfieldBuilderEmailDiv = textfieldBuilderEmail.build({type: aFormModel.type})
                container?.append(textfieldBuilderEmailDiv)
                break;
            case "phoneNumber":
                const textfieldBuilderPhone = new TextfieldBuilder(aFormModel, this.aFormsClass)
                const textfieldBuilderPhoneDiv = textfieldBuilderPhone.build({type: aFormModel.type})
                container?.append(textfieldBuilderPhoneDiv)
                break;
            case "survey":
                break;
            case "signature":
                break;
            case "radio":
                const radioBuilder = new RadioBuilder(aFormModel, this.aFormsClass)
                const radioBuilderDiv = radioBuilder.build()
                container?.append(radioBuilderDiv)
                break;
            case "select":
                const selectBuilder = new SelectBuilder(aFormModel, this.aFormsClass)
                const selectBuilderDiv = selectBuilder.build()
                container?.append(selectBuilderDiv)
                break;
            default:
                const basicWrapperBuilder = new BasicWrapperBuilder(aFormModel, this.aFormsClass)
                const basicWrapperBuilderDiv = basicWrapperBuilder.createPanel()
                container?.append(basicWrapperBuilderDiv)
                break;
        }
    }

}
