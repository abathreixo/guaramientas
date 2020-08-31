import {Fief} from "./Fief";
import {XYPair} from "./XYPair";
import {Army} from "./Army";
import {Troop} from "./Troop";
import * as ReadFief from "../serverCalls/retrieve/readFief";
import * as FiefActions from "../serverCalls/actions/fief";


describe('Fief', () => {
    let tested: Fief = null;
    const location = new XYPair(10, 20);
    const men = 500;
    const women = 250;
    const children = 200;
    const elders = 300;
    const reserves = 8000;
    const expectedArmy = new Army([new Troop(10, 0, 0, 0, 0, 0, location, null)]);
    const expectedQualityOfLife = 50;
    const expectedReservesPerPerson = 8;

    const usedFief = new Fief(
        location, 0,
        children, men, women, elders,
        0, 0, 0, reserves, false, 0,
        expectedQualityOfLife, expectedArmy);

    async function runTests() {
        test('getArmy', async () => {
            expect(await tested.getArmy()).toEqual(expectedArmy);
        });

        test('qualityOfLife', async () => {
            if (null === tested.qualityOfLife) await tested.collectMissingData();
            expect(tested.qualityOfLife).toEqual(expectedQualityOfLife);
        });

        test('reservesPerPerson', () => {
            expect(tested.reservesPerPerson).toEqual(expectedReservesPerPerson);
        });

        test('getGlobalReservesPerPerson', () => {
            expect(Fief.globalReservesPerPerson).toEqual(2 * expectedReservesPerPerson);
        });
    }

    beforeEach(() => {
        tested = usedFief;
    });

    describe('With full data', () => {
        runTests();
    });

    describe('With partial data', () => {
        let mockReadFief = jest.spyOn(ReadFief, 'readFief');
        mockReadFief.mockImplementation(async () => {
            return usedFief;
        });

        beforeEach(() => {
            tested = new Fief(
                location, 0,
                children, men, women, elders,
                0, 0, 0, reserves, false, 0,
                null, null);
        });

        runTests();

        test('get qualityOfLife without hitting the db', async () => {
            const anotherFief = new Fief(
                location, 0, children, men, women, elders,
                0, 0, 0, 2 * reserves, false,
                0, null, null
            );
            expect(anotherFief.qualityOfLife).toEqual(2 * expectedQualityOfLife);
        });
    });

    describe('buildFarm', () => {
        let mockBuildFarm = jest.spyOn(FiefActions, 'buildFarm').mockImplementation(() => null);
        beforeEach(() => {
            mockBuildFarm.mockClear();
        });

        test('', async () => {
            await tested.buildFarm();
            expect(mockBuildFarm).toHaveBeenCalledWith(location);
        });
    });
});