document.querySelector('div.notificationbar').classList.add('hidden');


let dashboard = new Dashboard(document.querySelector('div.panel'), 2);
let widget = new Widget(document.querySelector('div.dashboard-column'), 'Test Title');
let widget2 = new StatusWidget(document.querySelector('div.dashboard-column'));
let widget3 = new StatusWidget(document.querySelector('div.dashboard-column'));

onPageLoad();

cacheBadges('https://badges.twitch.tv/v1/badges/global/display','global-badges');