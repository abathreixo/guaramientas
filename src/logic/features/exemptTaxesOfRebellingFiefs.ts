import {FiefSet} from "../fiefSet/FiefSet";


export async function exemptTaxesOfRebellingFiefs(allFiefs: FiefSet): Promise<void > {
    const selectedFiefs = allFiefs.getRebellingFiefs();
    for (let fief of selectedFiefs) await fief.exemptTaxes();
}
