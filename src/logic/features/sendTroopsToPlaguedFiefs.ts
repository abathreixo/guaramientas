import {FiefSet} from "../fiefSet/FiefSet";
import {Army} from "../models/Army";
import {Troop} from "../models/Troop";
import {XYPair} from "../models/XYPair";


class ArmyDispatcher {
    private readonly troops: Troop[];
    private readonly location: XYPair;
    private activeTroopIndex = 0;
    private amount = 0;

    constructor(army: Army) {
        this.troops = [...army.troops.values()];
        this.location = army.location;
    }

    public async detachUnits(amount: number): Promise<Army> {
        this.amount = amount;
        let result = [];
        while (this.amount > 0) {
            const detachedTroop = await this.getDetachedTroop();
            if (null === detachedTroop) return null;
            this.amount -= detachedTroop.amount;
            result.push(detachedTroop);
            if (this.amount > 0) this.activeTroopIndex += 1;
        }
        return new Army(result, this.location);
    }

    private async getDetachedTroop(): Promise<Troop> {
        let result = this.getActiveTroop();
        if (null === result) return null;
        if (this.amount < result.amount) {
            result = (await result.createMultipleGroups(1, this.amount))[0];
        }
        return result;
    }

    private getActiveTroop(): Troop {
        if (this.activeTroopIndex >= this.troops.length) return null;
        let result = this.troops[this.activeTroopIndex];
        if (null !== result.destination) {
            this.activeTroopIndex += 1;
            return this.getActiveTroop();
        }
        return result;
    }
}


export async function sendTroopsToPlaguedFiefs(
    allFiefs: FiefSet, army: Army, useMaxPopulation: boolean=true
): Promise<void > {
    const plaguedFiefs = await allFiefs.getFiefsWithActivePlague();
    const armyDispatcher = new ArmyDispatcher(army);

    for (let fief of plaguedFiefs) {
        const nUnitsNeeded = useMaxPopulation ? fief.villages * 1001: fief.children + fief.men + fief.women + fief.elders;
        const dispatchedArmy = await armyDispatcher.detachUnits(nUnitsNeeded);
        if (null === dispatchedArmy) return;
        await dispatchedArmy.move(fief.location);
    }
}
