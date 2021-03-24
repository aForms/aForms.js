import {AFormModel, AFormModelClass} from "../../../a-form.model";
import {ClassesHelper} from "../../../helpers/classes.helper";
import {IntegerToWordHelper} from "../../../helpers/integer-to-word.helper";

export interface ColumnsModal {
    columns?: ColumnInternalModel[]
}

export interface ColumnInternalModel extends AFormModel {
    width?: number,
    offset?: number,
    push?: number,
    pull?: number,
}

export class ColumnsBuilder {
    constructor(private aFormModel: AFormModel, private aFormModelClass: AFormModelClass) { }

    createColumns(): HTMLDivElement {
        const grid = document.createElement('div')
        grid.classList.add('ui', 'grid')
        this.implementColumns(grid)
        if (this.aFormModel?.customClass) {
            new ClassesHelper().addClasses(this.aFormModel?.customClass, grid)
        }
        return grid
    }

    /**
     *   Add if any components available inside panel
     */
    private implementColumns(container: HTMLDivElement) {
        this.aFormModel?.columns?.forEach(value => {
            if (value) {
                const column = document.createElement('div');
                const columnSize: string = new IntegerToWordHelper().integerToWords(value?.width ? value?.width : 8);
                column.classList.add(columnSize, 'wide', 'column')
                column.tabIndex = -1
                this.aFormModelClass.renderer.renderComponent(value, column)
                container.append(column)
            }
        })
    }
}
