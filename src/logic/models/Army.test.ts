import {Troop} from "./Troop";
import {Army} from "./Army";
import {XYPair} from "./XYPair";
import * as MoveTroops from "../serverCalls/actions/troops";


describe('Army', function () {
    const location = new XYPair(123, 321);

    const troops = [
        new Troop(1, 2, 3, 4, 5, 6, location, null),
        new Troop(2, 3, 4, 5, 6, 7, location, null),
    ];

    let tested: Army = null;

    beforeEach(() => {
        tested = new Army(troops, location);
    });

    test('map is set', () => {
        expect(tested.troops.size).toEqual(troops.length);
        expect(tested.troops.get(1)).toStrictEqual(troops[0]);
        expect(tested.troops.get(2)).toStrictEqual(troops[1]);
    });

    test('move', async () => {
        let mockMove = jest.spyOn(MoveTroops, 'moveTroops');
        let destination = new XYPair(5, 6);
        mockMove.mockImplementation(() => null);
        await tested.move(destination);
        expect(mockMove).toHaveBeenLastCalledWith([1, 2], location, destination);
    });
});
