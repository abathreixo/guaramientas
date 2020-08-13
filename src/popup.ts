const element_list = ['fief_x', 'fief_y', 'first_x', 'first_y', 'last_x', 'last_y', 'n_troops', 'type'];


function set_status(message: string='Esperando instrucciones'): void {
    let element = document.getElementById('status') as HTMLElement;
    element.innerText = message;
}

function set_inputs_status(is_disabled: boolean): void {
    for (let id of element_list) {
        let element = document.getElementById(id) as HTMLInputElement;
        element.disabled = is_disabled;
    }
}


function reload_data() {
    set_status('Cargando...');
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'reload', response => {
            for (const key of element_list) {
                let element = document.getElementById(key) as HTMLInputElement;
                element.value = response[key];
            }
            set_status();
        });
    });
}


function update_data() {
    set_status('...');
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        let payload = {};
        for (const key of element_list) {
            let element = document.getElementById(key) as HTMLInputElement;
            payload[key] = element.value;
        }
        chrome.tabs.sendMessage(tabs[0].id, payload, response => {
            set_status();
        });
    });
}


function trigger_spread() {
    set_inputs_status(true);
    set_status('Esparciendo...');
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'spread', response => {
            set_status('Finalizado');
            set_inputs_status(false);
        });
    });
}
function trigger_levelup() {
    set_inputs_status(true);
    set_status('Cargando...');
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'levelup', response => {
            set_status('Subidos ' + response + ' feudos');
            set_inputs_status(false);
        });
    });
}

function trigger_exportcsv() {
    set_inputs_status(true);
    set_status('Cargando...');
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, 'exportcsv', response => {
            set_status('Exportados ' + response + ' feudos');
            set_inputs_status(false);
        });
    });
}

reload_data();


document.getElementById('spread_button').addEventListener('click', trigger_spread);
document.getElementById('levelup_button').addEventListener('click', trigger_levelup);
document.getElementById('exportcsv_button').addEventListener('click', trigger_exportcsv);

for (const key of element_list) {
    document.getElementById(key).addEventListener('change', update_data);
}
