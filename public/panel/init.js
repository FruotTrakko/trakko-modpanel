document.querySelector('div.notificationbar').classList.add('hidden');


window.dashboard = new Dashboard(document.querySelector('div.panel'), 2);
window.statusWidget = new StatusWidget(window.dashboard.getColumn(0).column);

onPageLoad();

let widget = new Widget(window.dashboard.getColumn(0).column, 'Test Title');
let widget3 = new Widget(window.dashboard.getColumn(1).column, 'Cool Widget');
let widget5 = new Widget(window.dashboard.getColumn(1).column, 'Even cooler Widget!');
let widget4 = new ChatWidget(window.dashboard.getColumn(0).column, '#overwatchleague');

cacheBadges('https://badges.twitch.tv/v1/badges/global/display','global-badges');
