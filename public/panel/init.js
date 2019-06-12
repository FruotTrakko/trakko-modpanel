document.querySelector('div.notificationbar').remove();


window.dashboard = new Dashboard(document.querySelector('div.panel'), 2);
window.statusWidget = new StatusWidget(window.dashboard.getColumn(0).column);

onPageLoad();
updateSettings();

new ChatWidget(window.dashboard.getColumn(0).column, '#fruottrakko');
new HighlightConfigWidget(window.dashboard.getColumn(1).column);

cacheBadges('https://badges.twitch.tv/v1/badges/global/display', 'global-badges');
