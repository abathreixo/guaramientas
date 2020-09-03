import {FiefSet} from "./FiefSet";
import {Fief} from "../models/Fief";
import {XYPair} from "../models/XYPair";
import {Army} from "../models/Army";
import {Troop} from "../models/Troop";


function randomInt(max: number=100, min: number=0): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomArmy(nTroops: number, location: XYPair): Army {
    let troops = [];
    for (let i=0; i < nTroops; ++i) {
        let troop = new Troop(i, randomInt(10), randomInt(), randomInt(), randomInt(), randomInt(), location, null);
        troops.push(troop);
    }
    return new Army(troops, location);
}


function getRandomFief(): Fief {
    const location = new XYPair(randomInt(450), randomInt(450));
    const terrain = randomInt(9);
    const children = randomInt();
    const men = randomInt();
    const women = randomInt();
    const elders = randomInt();
    const farms = randomInt(7);
    const villages = randomInt(4, 1);
    const lastHarvest = randomInt();
    const reserves = randomInt();
    const isRebellious: boolean = 1 === randomInt(1);
    const income = randomInt();
    const qualityOfLife = randomInt(200);
    const army = getRandomArmy(randomInt(2), location);
    return new Fief(
        location, terrain, children, men, women, elders,
        farms, villages, lastHarvest, reserves, isRebellious, income, qualityOfLife,
        army
    );
}


function generateRandomFiefs(nFiefs: number): Fief[] {
    let result = [];
    for (let i=0; i < nFiefs; ++i) result.push(getRandomFief());
    return result;

}


describe('FiefSet', function () {
    let fiefs: Fief[] = null;
    let superSet: FiefSet = null;
    let twin: FiefSet = null;
    let tested: FiefSet = null;

    beforeEach( () => {
        fiefs = generateRandomFiefs(100);
        superSet = new FiefSet([...fiefs, ...generateRandomFiefs(5)]);
        twin = new FiefSet(fiefs);
        tested = new FiefSet(fiefs);
    });

    describe('basic functionality', function () {
        test('contains', () => {
            expect(tested.contains(tested)).toBeTruthy();
            expect(tested.contains(twin)).toBeTruthy();
            expect(tested.contains(superSet)).toBeFalsy();
            expect(superSet.contains(tested)).toBeTruthy();
        });

        test('equals', () => {
            expect(tested.equals(tested)).toBeTruthy();
            expect(tested.equals(twin)).toBeTruthy();
            expect(tested.equals(superSet)).toBeFalsy();
        });

        test('getLocations', () => {
            const expected = [];
            for (let fief of fiefs) expected.push(fief.location);
            expect(tested.getLocations()).toEqual(expected);
        });

        test('loadAllData', async () => {
            for (let fief of fiefs) fief.getArmy = jest.fn();
            await tested.loadAllData();
            for (let fief of fiefs) expect(fief.getArmy).toHaveBeenCalled();
        });
    });

    describe('filters', function () {
        function assertOriginalUnchanged() {
            expect(new Set(tested)).toEqual(new Set(twin));
        }
        function assertState(fiefSet: FiefSet, fiefs: Fief[]) {
            assertOriginalUnchanged();
            expect(new Set(fiefSet)).toEqual(new Set(fiefs));
        }

        test('filterFiefs', async () => {
            function filterFunction(fief: Fief) {
                return fief.isRebellious;
            }

            assertState(tested.filterFiefs(filterFunction), fiefs.filter(filterFunction));
        });

        test('filterByFieldValue', () => {
            const allowed = new Set([1, 3]);
            assertState(tested.filterByFieldValue('terrain', [...allowed]),
                fiefs.filter((fief: Fief) => {
                    return allowed.has(fief.terrain);
                }));
        });

        test('filterByFieldRange', () => {
            assertState(
                tested.filterByFieldRange('terrain', 3, 5),
                fiefs.filter((fief: Fief) => {
                    return 3 <= fief.terrain && fief.terrain <= 5;
                }));
        });

        test('filterIfArmyExists', async () => {
            const undefendedFiefs = await tested.filterIfArmyExists(false);
            const armedFiefs = await twin.filterIfArmyExists(true);
            assertOriginalUnchanged();

            expect(undefendedFiefs.size + armedFiefs.size).toEqual(fiefs.length);

            for (let fief of undefendedFiefs) {
                const army = await fief.getArmy();
                expect(army.troops.size).toEqual(0);
            }

            for (let fief of armedFiefs) {
                const army = await fief.getArmy();
                expect(army.troops.size).toBeGreaterThan(0);
            }
        });

        test('filterLocationXY', () => {
            const output = tested.filterLocationXY(100, 300, 200, 400);
            assertOriginalUnchanged();
            for (let fief of output) {
                expect(fief.location.x).toBeGreaterThanOrEqual(100);
                expect(fief.location.x).toBeLessThanOrEqual(300);
                expect(fief.location.y).toBeGreaterThanOrEqual(200);
                expect(fief.location.y).toBeLessThanOrEqual(400);
            }
        });
    });
});
