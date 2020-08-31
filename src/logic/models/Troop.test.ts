import * as TroopActions from "../serverCalls/actions/troops";
import * as ReadFief from "../serverCalls/retrieve/readFief";
import {Troop} from "./Troop";
import {XYPair} from "./XYPair";
import {Army} from "./Army";
import {Fief} from "./Fief";


function getEmptyFief(troopIds: number[]): Fief {
    let troops = [];
    for (let id of troopIds) {
        troops.push(new Troop(id, 0, 1, 2, 3, 4, null, null));
    }
    return new Fief(null, null, null, null, null, null,
        null, null, null, null, null, null, 10,
        new Army(troops)
    );
}


describe('Troop', function () {
    const mockMoveTroops = jest.spyOn(TroopActions, 'moveTroop').mockImplementation(async () => null);
    const mockSplitTroops = jest.spyOn(TroopActions, 'splitTroop').mockImplementation(async () => null);
    const location = new XYPair(2, 4);
    const amount = 100;
    let tested: Troop = null;

    beforeEach(() => {
        jest.clearAllMocks();
        tested = new Troop(10, 1, amount, 1, 2, 3, location, null);
    });

    test('move', async () => {
        const destination = new XYPair(5, 6);
        await tested.move(destination);
        expect(mockMoveTroops).toHaveBeenCalledWith(tested.id, location, destination);
        expect(tested.destination).toEqual(destination);
    });

    describe('split', function () {
        async function checkNotCalled(nRemainingUnits: number): Promise<void> {
            await tested.split(nRemainingUnits);
            expect(mockSplitTroops).not.toHaveBeenCalled();
            expect(tested.amount).toEqual(amount);
        }
        test('enough troops', async () => {
            const nRemainingUnits = 10;
            await tested.split(nRemainingUnits);
            expect(mockSplitTroops).toHaveBeenCalledWith(tested.id, nRemainingUnits);
            expect(tested.amount).toEqual(nRemainingUnits);
        });

        test('insufficient troops should not call', async () => {
            await checkNotCalled(1000);
        });

        test('negative remaining units should not call', async () => {
            await checkNotCalled(-2);
        });
    });

    describe('createMultipleGroups', function () {
        const nGroups = 20;
        const unitsPerGroup = 3;
        const mockSplit = jest.fn(async () => null);
        const mockReadFief = jest.spyOn(ReadFief, 'readFief');
        let output: Troop[] = null;

        beforeEach(async () => {
            tested.split = mockSplit;
            mockReadFief.mockImplementationOnce(
                async () => getEmptyFief([10, 12])
            ).mockImplementationOnce(
                async () => getEmptyFief([10, 12, 15])
            );
            output = await tested.createMultipleGroups(nGroups, unitsPerGroup);
        });

        test('split calls', async () => {
            for (let i=1; i <= nGroups; ++i) {
                expect(mockSplit).toHaveBeenNthCalledWith(i, amount - unitsPerGroup * i);
            }
        });

        test('output', async () => {
            expect(output.length).toEqual(1);
            expect(output[0].id).toEqual(15);
        });

    });
});
