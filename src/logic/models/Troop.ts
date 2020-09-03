import {TroopType} from "../utils/types";
import {moveTroops, splitTroop} from "../serverCalls/actions/troops";
import {XYPair} from "./XYPair";
import {Army} from "./Army";
import {readFief} from "../serverCalls/retrieve/readFief";


export enum TroopTypes {
    LEVIES = 1,
    SOLDIERS = 2,
    SAILORS = 3,
    SPEARMEN = 4,
    ARCHERS = 5,
    CROSSBOWMEN = 6,
    HORSEMEN = 7,
    KNIGHTS = 8,
    OFFICERS = 9,
    SCOUTS = 10,
    RAMS = 50
}


export class Troop {
    constructor(
        public readonly id: number,
        public readonly type: TroopType,
        private _amount: number,
        public readonly power: number,
        public readonly skill: number,
        public readonly morale: number,
        public readonly location: XYPair,
        private _destination: XYPair
    ) {
    }

    public get amount(): number {
        return this._amount;
    }

    public get destination(): XYPair {
        return this._destination;
    }

    public async move(destination: XYPair): Promise<void> {
        await moveTroops([this.id], this.location, destination);
        this._destination = destination;
    }

    public async split(nRemainingUnits: number): Promise<void> {
        if (0 >= nRemainingUnits || nRemainingUnits >= this._amount) return ;
        await splitTroop(this.id, nRemainingUnits);
        this._amount = nRemainingUnits;
    }

    public async createMultipleGroups(nGroups: number, unitsPerGroup: number): Promise<Troop[]> {
        const oldArmy = await this.getFiefArmy();
        let amount = this._amount;
        for (let i = 0; i < nGroups; ++i) {
            amount -= unitsPerGroup;
            await this.split(amount);
        }
        const newArmy = await this.getFiefArmy();
        return [...newArmy.troops.values()].filter( (x: Troop) => ! oldArmy.troops.has(x.id));
    }

    private async getFiefArmy(): Promise<Army> {
        const fief = await readFief(this.location);
        return await fief.getArmy();
    }
}
