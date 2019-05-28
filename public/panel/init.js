document.querySelector('div.notificationbar').classList.add('hidden');


window.dashboard = new Dashboard(document.querySelector('div.panel'), 2);
window.statusWidget = new StatusWidget(window.dashboard.getColumn(0).column);

onPageLoad();

new ChatWidget(window.dashboard.getColumn(0).column);

cacheBadges('https://badges.twitch.tv/v1/badges/global/display','global-badges');
