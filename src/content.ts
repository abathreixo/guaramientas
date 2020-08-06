import {SpreadTroops} from "./features/spreadTroops";
import {XYPair} from "./dataContainers";
import {get_all_owned_fiefs} from "./serverCalls/get_all_owned_fiefs";
import {read_fief} from "./serverCalls/read_fief";
import {build_farm} from "./serverCalls/improve_fief";

let spread_troops_settings = {
    fief_x: 0,
    fief_y: 0,
    first_x: 0,
    first_y: 0,
    last_x: 0,
    last_y: 0,
    n_troops: 1,
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if ('reload' == request) {
        sendResponse(spread_troops_settings);
    }
    else if ('spread' == request) {
        const location = new XYPair(spread_troops_settings.fief_x, spread_troops_settings.fief_y);
        const first = new XYPair(spread_troops_settings.first_x, spread_troops_settings.first_y);
        const last = new XYPair(spread_troops_settings.last_x, spread_troops_settings.last_y);
        SpreadTroops.spread_troop_in_a_rectangle(location, first, last, spread_troops_settings.n_troops).then(value => {
            sendResponse('done');
        });
    }
    else {
        spread_troops_settings = request;
        sendResponse('ok');
    }
    return true;
});


async function run_me() {
}

run_me().then(value => {console.log("Done");});
