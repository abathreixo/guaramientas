export class XYPair {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {

    }

}


export class TroopData {
    constructor(
        public readonly id: number,
        public readonly type: number,
        public readonly amount: number,
        public readonly power: number,
        public readonly skill: number,
        public readonly morale: number,
        public readonly destination: XYPair | null
    ) {
    }
}


export class FiefData {
    constructor(
        public readonly location: XYPair,
        public readonly terrain: string,
        public readonly children: number,
        public readonly men: number,
        public readonly women: number,
        public readonly elders: number,
        public readonly farms: number,
        public readonly villages: number,
        public readonly last_harvest: number,
        public readonly reserves: number,
        public readonly rebellious: boolean
    ) {
    }

    get_reserves_per_person(): number {
        return this.reserves / (2 * this.women + this.children + this.elders);
    }
}


export class CompleteFiefData extends FiefData {
    constructor(
        public readonly location: XYPair,
        public readonly terrain: string,
        public readonly children: number,
        public readonly men: number,
        public readonly women: number,
        public readonly elders: number,
        public readonly farms: number,
        public readonly villages: number,
        public readonly last_harvest: number,
        public readonly reserves: number,
        public readonly rebellious: boolean,
        public readonly own_troops: Map<number, TroopData>,
        public readonly displayed_quality_of_life: number
    ) {
        super(location, terrain, children, men, women, elders, farms, villages, last_harvest, reserves, rebellious);
    }

    get_global_reserves_per_person(): number {
        return this.get_reserves_per_person() / (0.01 * this.displayed_quality_of_life);
    }
}
