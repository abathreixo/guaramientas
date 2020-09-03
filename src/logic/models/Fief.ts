import {XYPair} from "./XYPair";
import {Army} from "./Army";
import {PlagueType, TerrainType} from "../utils/types";
import {readFief} from "../serverCalls/retrieve/readFief";
import {buildFarm, exemptTaxes} from "../serverCalls/actions/fief";


export enum TerrainTypes {
    SEA=0,
    PLAINS=1,
    COAST=2,
    UNKNOWN=3,
    MOUNTAIN=4,
    FOREST=5,
    SWAMP=6,
    DESERT=7,
    RIVER=8,
    CITY=9
}


export enum PlagueTypes {
    NONE=0,
    QUARANTINE=1,
    ACTIVE=2
}


export class Fief {
    private static _globalReservesPerPerson: number = null;
    private static _largestReserves: number = null;  // Used to update global reserves per person

    constructor(
        public readonly location: XYPair,
        public readonly terrain: TerrainType,
        public readonly children: number,
        public readonly men: number,
        public readonly women: number,
        public readonly elders: number,
        private _farms: number,
        public readonly villages: number,
        public readonly lastHarvest: number,
        public readonly reserves: number,
        public readonly isRebellious: boolean,
        public readonly income: number,
        private _qualityOfLife: number,
        private _army: Army,
        private _plague: PlagueType=null
    ) {
        if (null !== this._qualityOfLife) this.updateGlobalReservesPerPerson();
    }

    public static get globalReservesPerPerson(): number {
        return Fief._globalReservesPerPerson;
    }

    public async collectMissingData(): Promise<void> {
        if (null === this._qualityOfLife || null === this._army) {
            const fief = await readFief(this.location);
            this._qualityOfLife = fief._qualityOfLife;
            this._army = fief._army;
            this._plague = fief._plague;
        }
    }

    public get reservesPerPerson(): number {
        return this.reserves / (2 * this.women + this.children + this.elders);
    }

    public get qualityOfLife(): number {
        if (this._qualityOfLife) return this._qualityOfLife;
        if (Fief._globalReservesPerPerson) return 100 * this.reservesPerPerson / Fief._globalReservesPerPerson;
        return null;
    }

    public get farms(): number {
        return this._farms;
    }

    public async getArmy(): Promise<Army> {
        if (null === this._army) await this.collectMissingData();
        return this._army;
    }

    public async getPlague(): Promise<PlagueType> {
        if (null === this._plague) await this.collectMissingData();
        return this._plague;
    }

    public async buildFarm(): Promise<void> {
        await buildFarm(this.location);
        this._farms += 1;
    }

    public async exemptTaxes(): Promise<void> {
        await exemptTaxes(this.location);
    }

    private updateGlobalReservesPerPerson(): void {
        if (this.reserves > Fief._largestReserves) {
            Fief._largestReserves = this.reserves;
            Fief._globalReservesPerPerson = this.reservesPerPerson / (0.01 * this._qualityOfLife);
        }
    }
}
