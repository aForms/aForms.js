
// @ts-ignore
import * as jsonLogic from 'json-logic-js';

export class ConditionalHelper {

    checkCondition(condition: any, data: any) {
        // Conditional to check if data is not present. Generally happens during startup.
        if (condition && Object.keys(data).length === 0) {
            return false;
        }
        return condition ? jsonLogic.apply(condition, {data: data}) : true
    }

    checkJustCondition(condition: any, data: any) {
        // Conditional to check if data is not present. Generally happens during startup.
        if (condition && Object.keys(data).length === 0) {
            return false;
        }
        return condition ? jsonLogic.apply(condition, {data: data}) : false
    }
}
