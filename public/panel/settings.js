function updateSettings() {
    document.querySelector('input.setting-evenmode').checked = window.dashboard.evenColumns;
}

function onChangeEvenmode() {
    window.dashboard.setColumnMode(document.querySelector('input.setting-evenmode').checked);
}