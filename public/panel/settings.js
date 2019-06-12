function updateSettings() {
    window.highlightFilter = new Map();
    window.highlightFilter.set('clymHerz', {color: 'rgb(255, 0, 0)', inverse: false, caseSensitive: true, regex: false});
    window.highlightFilter.set('a', {color: 'rgb(0, 0, 255)', inverse: true, caseSensitive: true, regex: false})

    document.querySelector('input.setting-evenmode').checked = window.dashboard.evenColumns;
}

function onChangeEvenmode() {
    window.dashboard.setColumnMode(document.querySelector('input.setting-evenmode').checked);
}