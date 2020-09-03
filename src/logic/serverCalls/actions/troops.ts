import {post} from "../utils/calls";
import {XYPair} from "../../models/XYPair";


export async function splitTroop(id: number, nRemainingUnits: number): Promise<void> {
    await post('/api/acciones/tropas/separar', {
        idTropa: id,
        cantidadgrupo: nRemainingUnits
    });
}


export async function moveTroops(troopIds: number[], fief: XYPair, destination: XYPair): Promise<void> {
    const parameters = [];
    parameters.push({
        x: fief.x,
        y: fief.y,
        xdestino: destination.x,
        ydestino: destination.y,
        personajeseleccionado: 0,
    });

    for (let id of troopIds) {
        parameters.push({
            'tropasel%5B%5D': id
        });
    }

    await post('/api/acciones/tropas/mover', ...parameters);
}
