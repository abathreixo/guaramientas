import {XYPair} from "./XYPair";


describe('XYPair', function () {
    test('toString', () => {
        const tested = new XYPair(4, 5);
        expect(tested.toString()).toStrictEqual('4-5');
    });
});
