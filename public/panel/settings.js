function updateSettings() {
    window.highlightFilter = new Map();
    window.highlightFilter.set(`@${window.chatClient.username}`, {color: 'rgb(46, 46, 46)', inverse: true, caseSensitive: false, regex: false});

    //TESTING
    window.highlightFilter.set('clymHerz', {color: 'rgb(255, 0, 0)', inverse: false, caseSensitive: true, regex: false});
    window.highlightFilter.set('@?[Cc]lym', {color: 'rgb(0, 0, 255)', inverse: true, caseSensitive: true, regex: true});
    //

    document.querySelector('input.setting-evenmode').checked = window.dashboard.evenColumns;
}

function onChangeEvenmode() {
    window.dashboard.setColumnMode(document.querySelector('input.setting-evenmode').checked);
}