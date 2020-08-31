import {Troop} from "./Troop";


export class Army {
    public troops: Map<number, Troop>;

    constructor(
        troops: Troop[]
    ) {
        this.troops = new Map();
        for (let troop of troops) this.troops.set(troop.id, troop);
    }
}
