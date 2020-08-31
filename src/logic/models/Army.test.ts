import {Troop} from "./Troop";
import {Army} from "./Army";


describe('Army', function () {
    const troops = [
        new Troop(1, 2, 3, 4, 5, 6, null, null),
        new Troop(2, 3, 4, 5, 6, 7, null, null),
    ];

    let tested: Army = null;

    beforeEach(() => {
        tested = new Army(troops);
    });

    test('map is set', () => {
        expect(tested.troops.size).toEqual(troops.length);
        expect(tested.troops.get(1)).toStrictEqual(troops[0]);
        expect(tested.troops.get(2)).toStrictEqual(troops[1]);
    });
});
