import {Fief} from "../models/Fief";
import {TerrainType} from "../utils/types";
import {XYPair} from "../models/XYPair";


export class FiefSet extends Set<Fief> {
    constructor(fiefs: Fief[]) {
        super(fiefs);
    }

    public contains(other: FiefSet): boolean {
        for (let fief of other) {
            if (! this.has(fief)) return false;
        }
        return true;
    }

    public equals(other: FiefSet): boolean {
        return (this.size === other.size) && this.contains(other);
    }

    public getLocations(): XYPair[] {
        let result = [];
        this.forEach((fief: Fief) => {
            result.push(fief.location);
        });
        return result;
    }

    public async loadAllData(): Promise<void> {
        for (let fief of this) await fief.getArmy();
    }

    //Filters
    public filterFiefs(fn: (fief: Fief) => boolean): FiefSet {
        const result = [];
        this.forEach((fief: Fief) => {
            if (fn(fief)) result.push(fief);
        });
        return new FiefSet(result);
    }

    public filterByFieldValue(fieldName: string, allowed: any[]): FiefSet {
        const allowedSet = new Set(allowed);
        return this.filterFiefs((fief: Fief) => {
            return allowedSet.has(fief[fieldName]);
        });
    }

    public filterByFieldRange(
        fieldName: string, min: number=Number.NEGATIVE_INFINITY, max: number=Number.POSITIVE_INFINITY
    ): FiefSet {
        return this.filterFiefs((fief: Fief) => {
            const value = fief[fieldName];
            return min <= value && value <= max;
        });
    }

    public async filterIfArmyExists(exists: boolean): Promise<FiefSet> {
        const result = [];
        for (let fief of this) {
            const army = await fief.getArmy();
            const thisHasArmy: boolean = army.troops.size > 0;
            if (thisHasArmy === exists) result.push(fief);
        }
        return new FiefSet(result);
    }

    public filterLocationXY(minX: number, maxX: number, minY: number, maxY: number): FiefSet {
        return this.filterFiefs((fief: Fief) => {
            return minX <= fief.location.x && fief.location.x <= maxX && minY <= fief.location.y && fief.location.y <= maxY
        });
    }

    public filterTerrain(allowed: TerrainType[]): FiefSet {
        return this.filterByFieldValue('terrain', allowed);
    }

    public filterFarms(allowed: number[]): FiefSet {
        return this.filterByFieldValue('farms', allowed);
    }

    public filterVillages(allowed: number[]): FiefSet {
        return this.filterByFieldValue('villages', allowed);
    }

    public filterReserves(min: number=0, max: number=Number.POSITIVE_INFINITY): FiefSet {
        return this.filterByFieldRange('reserves', min, max);
    }

    public filterQualityOfLife(min: number=0, max: number=Number.POSITIVE_INFINITY): FiefSet {
        return this.filterByFieldRange('qualityOfLife', min, max);
    }

    public filterIsRebellious(allowed: boolean[]): FiefSet {
        return this.filterByFieldValue('isRebellious', allowed);
    }

    public filterIncome(min: number=Number.NEGATIVE_INFINITY, max: number=Number.POSITIVE_INFINITY): FiefSet {
        return this.filterByFieldRange('income', min, max);
    }

    // Composite filters
    public getRebellingFiefs(): FiefSet {
        return this.filterIsRebellious([true]).filterIncome(0);
    }
}
