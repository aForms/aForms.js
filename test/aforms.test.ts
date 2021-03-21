import {AFormModel} from '../src/a-form.model'
import {AFormModelClass} from "../dist";

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it("works if true is truthy", () => { expect(true).toBeTruthy() })
  it('DummyClass is instantiable', () => { expect(new AFormModelClass()).toBeInstanceOf(AFormModelClass) })
})
