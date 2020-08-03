import {SpreadTroops} from "./features/spreadTroops";
import {XYPair} from "./dataContainers";

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
        let action = SpreadTroops.spread_troop_in_a_rectangle(location, first, last, spread_troops_settings.n_troops);
        sendResponse('ok');
    }
    else {
        spread_troops_settings = request;
        sendResponse('ok');
    }
});
