import {SpreadTroops} from "./features/spreadTroops";
import {FiefData, XYPair} from "./dataContainers";
import {get_all_owned_fiefs} from "./serverCalls/get_all_owned_fiefs";
import {read_fief} from "./serverCalls/read_fief";
import {build_farm} from "./serverCalls/improve_fief";
import {get_money} from "./serverCalls/read_info";

let spread_troops_settings = {
  fief_x: 0,
  fief_y: 0,
  first_x: 0,
  first_y: 0,
  last_x: 0,
  last_y: 0,
  n_troops: 1,
  type : "Llanura"
};

async function levelup(): Promise<number> {
  let upgraded = 0;
  let allFiefs = await get_all_owned_fiefs();
  let filterfiefs = allFiefs.filter(function (el) {
    return el.terrain == spread_troops_settings.type;
  });
  let money = await get_money();
  for (let i = 0; i < filterfiefs.length; i++) {
    let farmCost = filterfiefs[i].farms * 3000;
    if(money > farmCost) {
      build_farm(filterfiefs[i].location).then(value => {
        upgraded++;
        money = money - farmCost;
      });
    } else {
      break;
    }
  }
  return upgraded;
}

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
  else if ('levelup' == request) {
    levelup()
        .then(value => {
          sendResponse(value);
        });
  }
  else {
    spread_troops_settings = request;
    sendResponse('ok');
  }
  return true;
});


function filter_fiefs(fiefs: FiefData[], n_farms: number, reserves_per_person: number): FiefData[] {
  return fiefs.filter((fief: FiefData, index, array) => {
    return fief.get_reserves_per_person() <= reserves_per_person && fief.farms <= n_farms;
  });
}


async function run_me() {
  let fiefs = await get_all_owned_fiefs();
  fiefs.sort((a: FiefData, b: FiefData) => a.get_reserves_per_person() - b.get_reserves_per_person())
  const best_fief = await read_fief(fiefs[fiefs.length - 1].location);

  const global_reserves_per_person = best_fief.get_global_reserves_per_person();
  const quality_of_life_threshold = 1.0;
  const max_farms = 2;
  const max_reserves = quality_of_life_threshold * global_reserves_per_person;

  fiefs = filter_fiefs(fiefs, max_farms, max_reserves);

  console.info("Global Reserves per Person:", global_reserves_per_person);
  for (let n_farms = 0; n_farms <= max_farms; ++n_farms) {
    const selection = filter_fiefs(fiefs, n_farms, max_reserves);
    console.info("Fiefs with low reserves:", n_farms, selection.length);

    for (let fief of selection) {
      // await build_farm(fief.location);
    }
  }
}

run_me().then(value => {console.log("Done");});
