document.querySelector('div.notificationbar').classList.add('hidden');


window.dashboard = new Dashboard(document.querySelector('div.panel'), 2);
window.statusWidget = new StatusWidget(window.dashboard.getColumn(0).column);

onPageLoad();

new Widget(window.dashboard.getColumn(0).column, 'Test Title');
new Widget(window.dashboard.getColumn(1).column, 'Cool Widget');
new Widget(window.dashboard.getColumn(1).column, 'Even cooler Widget!');
new ChatWidget(window.dashboard.getColumn(0).column, '#clym');
new ChatWidget(window.dashboard.getColumn(1).column, '#skate702');

cacheBadges('https://badges.twitch.tv/v1/badges/global/display','global-badges');
