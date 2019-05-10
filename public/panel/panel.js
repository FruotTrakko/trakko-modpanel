function test(){
    const messageBox = document.querySelector('div.message-box');
    constructMessageContainer(messageBox, 'Trakko', '#ff2304', randomString(100), new Map().set('moderator', '1'), false, '#fruottrakko', Date.now().toString(10));
}

function randomString(length){
    let str = '';
    for(let i = 0; i <= length; i++){
        str += String.fromCharCode(Math.random() * 26 + 97);
        str += (Math.random() < .2 ? ' ' : '');
    }
    return str;
}

function constructMessageContainer(parentElement, senderName, senderColor, senderMessage, 
    senderBadges, messageIsAction, targetChannel, timestamp, self){
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if(self){
        messageDiv.classList.add('message-self');
    }

    if(senderBadges !== ''){
        var badgeSpan = document.createElement('span');
        badgeSpan.classList.add('badge-container');

        constructBadgeContainer(senderBadges, badgeSpan, targetChannel);
    }

    let usernameParagraph = document.createElement('span');
    usernameParagraph.innerText = senderName;
    if(senderColor == null || senderColor === ''){
        usernameParagraph.style.color = '#ffffff';
    } else if(senderColor === '#0000FF' || senderColor === "#454545" || senderColor === '#6620fe'){
        usernameParagraph.style.color = '#9f54ff';
    } else {
        usernameParagraph.style.color = senderColor;
    }
    usernameParagraph.addEventListener('click', onClickUsername);
    usernameParagraph.classList.add('username');

    let messageSeperator = document.createElement('span');
    if(!messageIsAction){
        messageSeperator.innerText = ': ';
    } else {
        messageSeperator.innerText = ' ';
    }
    messageSeperator.classList.add('message-text');

    let messageParagraph = document.createElement('span');
    messageParagraph.classList.add('message-text');
    if(messageIsAction){
        if(senderColor == null || senderColor === ''){
            messageParagraph.style.color = '#ff0000';
        } else if(senderColor === '#b22222'){
            messageParagraph.style.color = '#db4a3f';
        } else if(senderColor === '#8a2be2'){
            messageParagraph.style.color = '#b454ff';
        } else {
            messageParagraph.style.color = senderColor;
        }

        messageParagraph.innerText = senderMessage.slice(senderMessage.indexOf(' ') + 1, senderMessage.length - 3);
    } else {
        messageParagraph.innerText = senderMessage;
    }
    highlightPings(senderMessage, messageParagraph);

    let deletedParagraph = document.createElement('p');
    deletedParagraph.setAttribute('name', 'deleted-text');
    deletedParagraph.classList.add('deleted-text');

    let timestampAndChannelParagraph = document.createElement('span');
    let timeObject = new Date(parseInt(timestamp, 10));
    
    timestampAndChannelParagraph.innerText = `${targetChannel} @ ${timeObject.getHours()}:${timeObject.getMinutes()}:${timeObject.getSeconds()} - ${timeObject.getDate()}.${timeObject.getMonth() + 1}.${timeObject.getFullYear()}`;
    timestampAndChannelParagraph.classList.add('timestamp');

    if(senderBadges !== ''){
        messageDiv.appendChild(badgeSpan);
    }
    messageDiv.appendChild(usernameParagraph);
    messageDiv.appendChild(messageSeperator);
    messageDiv.appendChild(messageParagraph);
    messageDiv.appendChild(deletedParagraph);
    messageDiv.appendChild(timestampAndChannelParagraph);

    let scroll = parentElement.clientHeight + parentElement.scrollTop - 2 <= parentElement.scrollHeight 
                && parentElement.clientHeight + parentElement.scrollTop + 2 >= parentElement.scrollHeight;
    console.log(parentElement.clientHeight + parentElement.scrollTop);
    console.log(parentElement.scrollHeight);
    console.log(scroll);

    parentElement.appendChild(messageDiv);

    if(scroll){
        parentElement.scrollTop = parentElement.scrollHeight;
    }

    checkMessageCount(parentElement);
}

function constructBadgeContainer(badges, parentElement, channel){
    var channelBadgeObject = JSON.parse(sessionStorage.getItem(`${channel.substr(1)}-badges`));
    var globalBadgeObject = JSON.parse(sessionStorage.getItem('global-badges'));

    badges.forEach((variant, badge) => {

        let badgeElement = document.createElement('img');

        badgeElement.classList.add('badge');
        
        if(!channelBadgeObject) {
            showError('Error', 'Couldn\'t load channel badges');
            return;
        }
        var badgeObject = channelBadgeObject !== '{"badge_sets":{}}' && channelBadgeObject.badge_sets[badge] && channelBadgeObject.badge_sets[badge].versions[variant] ? channelBadgeObject : globalBadgeObject;

        var badgeVariant = badgeObject.badge_sets[badge].versions[variant];
        badgeElement.src = badgeVariant.image_url_1x;
        badgeElement.alt = badgeVariant.title

        //console.log(badgeElement.src);
        //console.log(badgeElement.alt);

        parentElement.appendChild(badgeElement);
    });
}

function highlightPings(senderMessage, messageParagraph){
    if(senderMessage.toLowerCase().match(`@${window.chatClient.username.toLowerCase()}`)){
        let nameParagraph = document.createElement('span');
        nameParagraph.innerText = senderMessage.slice(senderMessage.indexOf('@'), senderMessage.indexOf('@') + 1 + window.chatClient.username.length);
        nameParagraph.classList.add('message-username-ping');
        let messageBefore = document.createElement('span');
        messageBefore.innerText = senderMessage.slice(0, senderMessage.indexOf('@'));
        messageBefore.classList.add('message-text');
        let messageAfter = document.createElement('span');
        messageAfter.innerText = senderMessage.slice(senderMessage.indexOf('@') + 1 + window.chatClient.username.length);
        messageAfter.classList.add('message-text');

        messageParagraph.innerText = '';
        messageParagraph.appendChild(messageBefore);
        messageParagraph.appendChild(nameParagraph);
        messageParagraph.appendChild(messageAfter);
    }
}

function checkMessageCount(parentElement){
    let messages = parentElement.childElementCount;
    if(messages >= 100){
        clearMessages(parentElement, messages-90);
        console.log(`Cleaned up and cleared ${messages-90} messages!`);
    }
}

function clearAllMessages(parentElement){
    clearMessages(parentElement, parentElement.childElementCount);
}

function clearMessages(parentElement, count){
    for(let i = 1; i <= count; i++){
        parentElement.firstElementChild.remove();
    }
    if(count > 10){
        showInformation('Clear', `Cleared ${count} messages!`);
    }
}

function closeNotificationbar(event, isNotEvent){
    let barElement;
    if(!isNotEvent){
        barElement = event.srcElement.parentNode.parentNode.parentNode;
    } else {
        barElement = event;
    }
    let index = barElement.getAttribute('id');
    clearTimeout(timeouts[index]);
    timeouts.splice(index, 1);
    barElement.classList.remove('run-down');
    barElement.classList.add('run-up');
    setTimeout(() => {
        barElement.remove();
    },1000);
}

let timeouts = [];

function showNotificationbar(title, detail, color){
    let parentElement = document.querySelector('div.notifications');
    let notificationbar = createNotificationbar(parentElement, title, detail, color);
    notificationbar.classList.add('run-down');
    let index = timeouts.length;
    let taskId = setTimeout((index) => {
        closeNotificationbar(notificationbar, true);
        timeouts.splice(index, 1);
    }, 10000);
    timeouts[index] = taskId;
    notificationbar.setAttribute('id', index);
}

function createNotificationbar(parentElement, title, detail, color){
    let notificationbarDiv = document.createElement('div');
    notificationbarDiv.style.backgroundColor = color;
    notificationbarDiv.classList.add('notificationbar');
    let containerDiv = document.createElement('div');
    containerDiv.classList.add('container');

    let headerText = document.createElement('h3');
    headerText.innerText = title.toUpperCase();
    headerText.classList.add('heading');
    headerText.classList.add('title');
    let detailText = document.createElement('p');
    detailText.innerText = detail;
    detailText.classList.add('heading');
    detailText.classList.add('detail');

    let closeDiv = document.createElement('div');
    closeDiv.addEventListener('click', closeNotificationbar);
    closeDiv.classList.add('close');
    let closeText = document.createElement('p');
    closeText.innerText = '[X]';
    //closeText.addEventListener('click', closeNotificationbar);
    closeText.classList.add('close');

    closeDiv.appendChild(closeText);

    containerDiv.appendChild(headerText);
    containerDiv.appendChild(detailText);
    containerDiv.appendChild(closeDiv);

    notificationbarDiv.appendChild(containerDiv);
    parentElement.appendChild(notificationbarDiv);
    return notificationbarDiv;
}

function showError(title, detail){
    showNotificationbar(title, detail, 'rgb(240, 94, 94)');
}

function showWarning(title, detail){
    showNotificationbar(title, detail, 'rgb(238, 169, 43)');
}

function showInformation(title, detail){
    showNotificationbar(title, detail, 'rgb(84, 195, 48)');
}

function bindChannel(){
    let channel = document.querySelector('input.channel-name').value;
    if(channel === '#' || channel === ''){
        showError('Error', 'The channel name must be at least one character long');
        return;
    }
    window.chatClient.joinChannel(channel);
    cacheChannelBadges(channel, `${channel.substr(1)}-badges`);

    document.querySelector('input.channel-name').value = '#';
    let parentElement = document.querySelector('div.channel-container');
    let channelDiv = document.createElement('div');
    channelDiv.addEventListener('click', selectChannel);
    channelDiv.setAttribute('name', channel);
    channelDiv.classList.add('channel');

    let channelParagraph = document.createElement('p');
    channelParagraph.innerText = channel;
    channelParagraph.classList.add('channel-name');
    channelParagraph.classList.add('heading');
    let channelStatus = document.createElement('p');
    channelStatus.classList.add('channel-status');
    channelStatus.classList.add('heading');
    let channelLeaver = document.createElement('p');
    channelLeaver.innerText = 'X';
    channelLeaver.addEventListener('click', unbindChannel)
    channelLeaver.classList.add('channel-leaver');

    var selectedChannel = getSelectedChannel();
    console.log(selectedChannel);
    if(!selectedChannel){
        channelDiv.classList.add('channel-selected');
    }

    channelDiv.appendChild(channelParagraph);
    channelDiv.appendChild(channelStatus);
    channelDiv.appendChild(channelLeaver);

    parentElement.appendChild(channelDiv);

    checkStreams();
}

function unbindChannel(event){
    let channel = event.srcElement.parentNode.getAttribute('name');
    if(channel === '#' || channel === ''){
        showError('Error', 'The channel name must be at least one character long');
        return;
    }
    window.chatClient.leaveChannel(channel);

    let parentElement = document.querySelector('div.channel-container');
    parentElement.removeChild(parentElement.children.namedItem(channel));
}

function getSelectedChannel(){
    let channelParent = document.querySelector('div.channel-container');
    for(let child of channelParent.childNodes){
        if(isSelectedChannel(child)){
            return child;
        }
    }
}

function isSelectedChannel(channel){
    return channel.classList.contains('channel-selected');
}

function selectChannel(event){
    var channel;
    if(event.srcElement.tagName !== 'DIV'){
        if(event.srcElement.classList.contains('channel-leaver')){
            return;
        }
        channel = event.srcElement.parentNode;
    } else {
        channel = event.srcElement;
    }
    for(let child of channel.parentNode.childNodes){
        child.classList.remove('channel-selected');
    }
    channel.classList.add('channel-selected');

    let messageInput = document.querySelector('input.message-input');
    messageInput.placeholder = `Type your message here! - ${getSelectedChannel().getAttribute('name').toUpperCase()}`;
}

function checkNotEmpty(event){
    let input = event.srcElement;
    if(input.value === ''){
        input.value = '#'
        showWarning('Important', 'Channelname must start with a numbersign/hashtag!')
    }

    if(event.keyCode == 13){
        bindChannel();
    }
}

function checkForEnter(event){
    if(event.keyCode == 13){
        sendMessage();
    }
}

function sendMessage(){
    let messageInput = document.querySelector('input.message-input');
    let message = messageInput.value;
    messageInput.value = '';

    let channel = getSelectedChannel().getAttribute('name');

    console.log(message);
    console.log(channel);

    if(!channel){
        if(window.chatClient.getChannels().length === 0){
            showError('Error', 'Join a channel before trying to send a message!');
            return;
        }
        showError('Error', 'You must select a channel to send a message to first!');
        return;
    }
    if(!message){
        showError('Error', 'The message to send must not be empty!');
        return;
    }

    window.chatClient.sendMessage(channel, message);
}

function checkStreams(){
    let channelContainer = document.querySelector('div.channel-container');
    channelContainer.childNodes.forEach((child) => {
        let streamerName = child.getAttribute('name').slice(1);
        checkStreamStatus(streamerName)
        .then((res) => {
            let statusElement = child.childNodes[1];
            if(res){
                statusElement.innerText = 'STREAMING';
                statusElement.classList.remove('orange-text');
                statusElement.classList.add('purple-text');
            } else {
                statusElement.innerText = 'OFFLINE';
                statusElement.classList.remove('purple-text');
                statusElement.classList.add('orange-text');
            }
        });
    });
}

function checkStreamStatus(streamName){
    return Promise.resolve(sendRequest(`https://api.twitch.tv/helix/streams?user_login=${streamName}`, false))
    .then((res) => {
        if(res === '{"data":[],"pagination":{}}'){
            return false;
        } else {
            return true;
        }
    });
}

function markDeleted(message){
    message.classList.add('deleted');
    let deletedText = message.children.namedItem('deleted-text');
    deletedText.innerText = '<deleted>';
    deletedText.classList.add('deleted-text');
}

function onClickUsername(event){
    let user = event.srcElement.innerText;
    let messageInput = document.querySelector('input.message-input');

    messageInput.value += `@${user} `;
    messageInput.focus()
    messageInput.scrollIntoView(false);
}