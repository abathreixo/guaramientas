import {Troop} from "./Troop";
import {XYPair} from "./XYPair";
import {moveTroops} from "../serverCalls/actions/troops";


export class Army {
    public troops: Map<number, Troop>;

    constructor(
        troops: Troop[],
        public readonly location: XYPair
    ) {
        this.troops = new Map();
        for (let troop of troops) this.troops.set(troop.id, troop);
    }

    public async move(destination: XYPair): Promise<void> {
        await moveTroops([...this.troops.keys()], this.location, destination);
    }
}
