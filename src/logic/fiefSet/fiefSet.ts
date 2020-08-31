import {Fief} from "../models/Fief";
import {TerrainType} from "../utils/types";


export class FiefSet {
    private readonly _fiefs: Set<Fief>;

    constructor(fiefs: Fief[]) {
        this._fiefs = new Set<Fief>(fiefs);
    }

    public contains(other: FiefSet): boolean {
        for (let fief of other._fiefs) {
            if (! this._fiefs.has(fief)) return false;
        }
        return true;
    }

    public equals(other: FiefSet): boolean {
        return (this._fiefs.size === other._fiefs.size) && this.contains(other);
    }

    public getFiefs(): Fief[] {
        return [...this._fiefs.values()];
    }

    public filterFiefs(fn: (fief: Fief) => boolean): FiefSet {
        this._fiefs.forEach((fief: Fief) => {
            if (! fn(fief)) this._fiefs.delete(fief);
        });
        return this;
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
        for (let fief of this._fiefs) {
            const army = await fief.getArmy();
            const thisHasArmy: boolean = army.troops.size > 0;
            if (thisHasArmy !== exists) this._fiefs.delete(fief);
        }
        return this;
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
}
