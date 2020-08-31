import {FiefSet} from "./fiefSet";
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
    return new Army(troops);
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
    const fiefs = generateRandomFiefs(20);
    const superSet = new FiefSet([...fiefs, ...generateRandomFiefs(5)]);
    const twin = new FiefSet(fiefs);
    let tested: FiefSet = null;


    beforeEach( () => {
        tested = new FiefSet(fiefs);
    });

    function assertState(fiefs: Fief[]) {
        expect(tested.equals(new FiefSet((fiefs)))).toBeTruthy();
    }

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

    test('getFief', () => {
        assertState(tested.getFiefs());
    });

    test('filterFiefs', async () => {
        function filterFunction(fief: Fief) {
            return fief.isRebellious;
        }

        const output = tested.filterFiefs(filterFunction);
        expect(output).toEqual(tested);
        assertState(fiefs.filter(filterFunction));
    });

    test('filterByFieldValue', () => {
        const allowed = new Set([1, 3]);
        tested.filterByFieldValue('terrain', [...allowed]);
        assertState(fiefs.filter((fief: Fief) => {
            return allowed.has(fief.terrain);
        }));
    });

    test('filterByFieldRange', () => {
        tested.filterByFieldRange('terrain', 3, 5);
        assertState(fiefs.filter((fief: Fief) => {
            return 3 <= fief.terrain && fief.terrain <= 5;
        }));
    });

    test('filterIfArmyExists', async () => {
        await tested.filterIfArmyExists(false);
        await twin.filterIfArmyExists(true);

        const unarmedFiefs = tested.getFiefs();
        const armedFiefs = twin.getFiefs();

        expect(unarmedFiefs.length + armedFiefs.length).toEqual(fiefs.length);

        for (let fief of unarmedFiefs) {
            const army = await fief.getArmy();
            expect(army.troops.size).toEqual(0);
        }

        for (let fief of armedFiefs) {
            const army = await fief.getArmy();
            expect(army.troops.size).toBeGreaterThan(0);
        }
    });
});
