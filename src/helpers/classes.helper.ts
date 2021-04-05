export class ClassesHelper {

    addClasses(classes: string|string[], divContent: HTMLDivElement|HTMLButtonElement|HTMLFieldSetElement) {
        if (classes instanceof Array) {
            classes.forEach(value => {
                divContent.classList.add(value)
            })
        } else  {
            classes.split(',')?.forEach(value => {
                divContent.classList.add(value)
            })
        }
    }
}
