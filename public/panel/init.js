document.querySelector('div.notificationbar').classList.add('hidden');


window.dashboard = new Dashboard(document.querySelector('div.panel'), 2);
let widget = new Widget(window.dashboard.getColumn(0).column, 'Test Title');
let widget2 = new StatusWidget(window.dashboard.getColumn(0).column);
let widget3 = new StatusWidget(window.dashboard.getColumn(1).column);

onPageLoad();

cacheBadges('https://badges.twitch.tv/v1/badges/global/display','global-badges');
