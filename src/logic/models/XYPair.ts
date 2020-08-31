export class XYPair {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) {

    }
    public toString = () : string => {
        return `${this.x}-${this.y}`;
    }
}
