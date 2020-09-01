import {XYPair} from "../models/XYPair";
import {Troop} from "../models/Troop";
import {Fief} from "../models/Fief";
import {readFief} from "../serverCalls/retrieve/readFief";
import {FiefSet} from "../fiefSet/FiefSet";


export class SpreadTroops {
    private constructor(
        private readonly allFiefs: FiefSet,
        private readonly troop: Troop,
        private readonly unitsPerGroup: number
    ) {
    }

    public static async buildFromTroop(allFiefs: FiefSet, troop: Troop, unitsPerGroup: number): Promise<SpreadTroops> {
        return new SpreadTroops(allFiefs, troop, unitsPerGroup);
    }

    public static async buildFromFief(allFiefs: FiefSet, fief: Fief, unitsPerGroup: number): Promise<SpreadTroops> {
        const army = await fief.getArmy();
        if (0 == army.troops.size) throw 'Fief has no friendly troops';
        const usedTroop = army.troops.values().next().value;

        return new SpreadTroops(allFiefs, usedTroop, unitsPerGroup);
    }

    public static async buildFromFiefLocation(
        allFiefs: FiefSet, fiefLocation: XYPair, unitsPerGroup: number
    ): Promise<SpreadTroops> {
        const fief = await readFief(fiefLocation);
        return this.buildFromFief(allFiefs, fief, unitsPerGroup);
    }

    public async toDestinations(destinations: XYPair[]): Promise<void> {
        const newTroops = await this.troop.createMultipleGroups(destinations.length, this.unitsPerGroup);
        for (let i = 0; i < newTroops.length; ++i) await newTroops[i].move(destinations[i]);
    }

    public async toRectangle(minX: number, maxX: number, minY: number, maxY: number): Promise<void> {
        const selectedFiefs = this.allFiefs.filterLocationXY(minX, maxX, minY, maxY);
        return await this.toDestinations(selectedFiefs.getLocations());
    }

    public async toUndefended(): Promise<void> {
        const selectedFiefs = await this.allFiefs.filterIfArmyExists(false);
        return await this.toDestinations(selectedFiefs.getLocations());
    }
}
