import {post} from "../utils/calls";
import {XYPair} from "../../models/XYPair";


export async function splitTroop(id: number, nRemainingUnits: number): Promise<void> {
    await post('/api/acciones/tropas/separar', {
        idTropa: id,
        cantidadgrupo: nRemainingUnits
    });
}


export async function moveTroop(troopId: number, fief: XYPair, destination: XYPair): Promise<void> {
    await post('/api/acciones/tropas/mover', {
        x: fief.x,
        y: fief.y,
        xdestino: destination.x,
        ydestino: destination.y,
        'tropasel%5B%5D': troopId,
        personajeseleccionado: 0,
    });
}
