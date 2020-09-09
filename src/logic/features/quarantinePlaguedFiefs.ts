import {FiefSet} from "../fiefSet/FiefSet";


export async function quarantinePlaguedFiefs(allFiefs: FiefSet): Promise<void > {
    const plaguedFiefs = await allFiefs.getFiefsWithActivePlague();

    for (let fief of plaguedFiefs) {
        await fief.quarantine();
    }
}
