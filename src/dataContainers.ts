export class XYPair {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {

    }

}
export class TroopData {
    constructor(
        public readonly n_units: number
    ) {

    }
}

export class FiefData {
    constructor(
        public readonly location: XYPair,
        public readonly troops: Map<number, TroopData>
    ) {

    }
}
