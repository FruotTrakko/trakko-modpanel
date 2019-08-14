function constructMessageContainer(parentElement, senderName, senderColor, senderMessage,
    senderBadges, messageIsAction, targetChannel, timestamp, self, messageId) {
    let messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (self) {
        messageDiv.classList.add('message-self');
    }
    messageDiv.setAttribute('id', messageId);
    messageDiv.setAttribute('channel', targetChannel);
    messageDiv.setAttribute('username', senderName);

    if (senderBadges !== '') {
        var badgeSpan = document.createElement('span');
        badgeSpan.classList.add('badge-container');

        constructBadgeContainer(senderBadges, badgeSpan, targetChannel);
    }

    let usernameParagraph = document.createElement('span');
    usernameParagraph.innerText = senderName;
    usernameParagraph.style.color = translateColorToReadable(senderColor);
    usernameParagraph.addEventListener('click', onClickUsername);
    usernameParagraph.classList.add('username');

    let messageSeperator = document.createElement('span');
    let message;
    if (!messageIsAction) {
        messageSeperator.innerText = ': ';
        message = senderMessage;
    } else {
        messageSeperator.innerText = ' ';
        message = senderMessage.slice(senderMessage.indexOf(' ') + 1, senderMessage.length - 3)
    }
    messageSeperator.classList.add('message-seperator');

    let messageParagraph = document.createElement('span');
    messageParagraph.classList.add('message-text');
    if (messageIsAction) {
        messageParagraph.style.color = translateColorToReadable(senderColor);
        messageParagraph.innerText = message;
    } else {
        messageParagraph.innerText = message;
    }
    //TODO MAKE LEGACY
    //highlightPings(senderMessage, messageParagraph);

    window.highlightFilter.forEach((value, key) => {
        highlight(messageParagraph, message, key, value.color, value.inverse, value.caseSensitive, value.regex);
    });

    let deletedParagraph = document.createElement('p');
    deletedParagraph.setAttribute('name', 'deleted-text');
    deletedParagraph.classList.add('deleted-text');

    let endContainer = document.createElement('div');
    endContainer.classList.add('end-container');

    let deleteText = document.createElement('p');
    deleteText.classList.add('delete-text');
    deleteText.innerText = 'delete';
    deleteText.onclick = deleteMessage;

    let timeoutText = document.createElement('p');
    timeoutText.classList.add('timeout-text');
    timeoutText.innerText = 'timeout';
    timeoutText.onclick = banUser;

    let timestampAndChannelParagraph = document.createElement('span');
    let timeObject = new Date(parseInt(timestamp, 10));

    timestampAndChannelParagraph.innerText = `${targetChannel} @ ${timeObject.getHours()}:${timeObject.getMinutes()}:${timeObject.getSeconds()} - ${timeObject.getDate()}.${timeObject.getMonth() + 1}.${timeObject.getFullYear()}`;
    timestampAndChannelParagraph.classList.add('timestamp');

    endContainer.appendChild(deleteText);
    endContainer.appendChild(timeoutText);
    endContainer.appendChild(timestampAndChannelParagraph);

    if (senderBadges !== '') {
        messageDiv.appendChild(badgeSpan);
    }
    messageDiv.appendChild(usernameParagraph);
    messageDiv.appendChild(messageSeperator);
    messageDiv.appendChild(messageParagraph);
    messageDiv.appendChild(deletedParagraph);
    messageDiv.appendChild(endContainer);

    let scroll = parentElement.clientHeight + parentElement.scrollTop - 100 <= parentElement.scrollHeight
        && parentElement.clientHeight + parentElement.scrollTop + 100 >= parentElement.scrollHeight;
    console.log(parentElement.clientHeight + parentElement.scrollTop);
    console.log(parentElement.scrollHeight);
    console.log(scroll);

    parentElement.appendChild(messageDiv);

    if (scroll) {
        parentElement.scrollTop = parentElement.scrollHeight;
    }

    checkMessageCount(parentElement);
}

function constructBadgeContainer(badges, parentElement, channel) {
    var channelBadgeObject = JSON.parse(sessionStorage.getItem(`${channel.substr(1)}-badges`));
    var globalBadgeObject = JSON.parse(sessionStorage.getItem('global-badges'));

    badges.forEach((variant, badge) => {

        let badgeElement = document.createElement('img');

        badgeElement.classList.add('badge');

        if (!channelBadgeObject) {
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

function highlightPings(senderMessage, messageParagraph) {
    if (senderMessage.toLowerCase().match(`@${window.chatClient.username.toLowerCase()}`)) {
        let nameIndex = senderMessage.toLowerCase().indexOf(`@${window.chatClient.username.toLowerCase()}`);

        let nameParagraph = document.createElement('span');
        nameParagraph.innerText = senderMessage.slice(nameIndex, nameIndex + 1 + window.chatClient.username.length);
        nameParagraph.classList.add('message-username-ping');
        let messageBefore = document.createElement('span');
        messageBefore.innerText = senderMessage.slice(0, nameIndex);
        messageBefore.classList.add('message-text');
        let messageAfter = document.createElement('span');
        messageAfter.innerText = senderMessage.slice(nameIndex + 1 + window.chatClient.username.length);
        messageAfter.classList.add('message-text');

        messageParagraph.innerText = '';
        messageParagraph.appendChild(messageBefore);
        messageParagraph.appendChild(nameParagraph);
        messageParagraph.appendChild(messageAfter);
    }
}

function highlight(messageParagraph, message, highlightText, highlightColor, inverseColors, caseSensitive, isRegex) {
    console.log(`Searching ${message} for ${highlightText} with params color ${highlightColor}, inverse ${inverseColors} and case sensitvity ${caseSensitive}`);
    
    let regex = new RegExp(`${highlightText}`, `g${!caseSensitive ? 'i' : ''}`);
    let occurences = message.match(regex);
    if (occurences === null) {
        return;
    }
    
    console.log(message.match(regex)[0]);
    let regexString;
    if (isRegex) {
        regexString = occurences[0];
    } else {
        regexString = highlightText;
    }

    let textElements = [];

    console.log(message.indexOfRegex(regex));

    textElements.push(message.slice(0, message.indexOfRegex(regex)));

    let offset = 0;
    textElements.push(message.slice(message.indexOfRegex(regex), message.indexOfRegex(regex) + regexString.length));
    offset = message.indexOfRegex(regex) + 1;

    for (let i = 1; i < occurences.length; i++) {
        textElements.push(message.slice(message.indexOfRegex(regex, offset - 1) + regexString.length, message.indexOfRegex(regex, offset)));
        textElements.push(message.slice(message.indexOfRegex(regex, offset), message.indexOfRegex(regex, offset) + regexString.length));
        offset = message.indexOfRegex(regex, offset) + 1;
    }

    textElements.push(message.slice(message.indexOfRegex(regex, offset - 1) + regexString.length));

    console.log(textElements);

    messageParagraph.innerText = '';
    for (let element of textElements) {
        let paragraph = document.createElement('span');
        paragraph.innerText = element;


        if (element.match(regex) !== null) {
            if (!inverseColors) {
                paragraph.style.backgroundColor = highlightColor;
                paragraph.style.color = 'rgb(46, 46, 46)';
            } else {
                paragraph.style.backgroundColor = 'whitesmoke';
                paragraph.style.color = highlightColor;
            }
            paragraph.style.padding = '.25em';
        }

        messageParagraph.appendChild(paragraph);
    }
}

function translateColorToReadable(color) {
    switch (color) {
        case null:
        case '':
            return '#1DC58D';
        case '#B22222':
            return '#DB4A3F';
        case '#8A2BE2':
            return '#B454FF';
        case '#B60606':
            return '#EF4B31';
        case '#B31919':
            return '#EC5241';
        case '#0000FF':
            return '#8B58FF';
        case '#5A032B':
            return '#C26883';
        case '#8F0081':
            return '#C84CB6';
        case '#3E0101':
            return '#B0696B';
        case '#8B00CC':
            return '#BF49FF';
        case '#6620FE':
            return '#9F54FF';
        case '#484153':
            return '#8C8398';
        default:
            return color;
    }
}

function checkMessageCount(parentElement) {
    let messages = parentElement.childElementCount;
    if (messages >= 100) {
        clearMessages(parentElement, messages - 90);
        console.log(`Cleaned up and cleared ${messages - 90} messages!`);
    }
}

// function clearAllMessages(parentElement) {
//     clearMessages(parentElement, parentElement.childElementCount);
// }

function clearMessages(parentElement, count) {
    for (let i = 1; i <= count; i++) {
        parentElement.firstElementChild.remove();
    }
    if (count > 10) {
        showInformation('Clear', `Cleared ${count} messages!`);
    }
}

function closeNotificationbar(event, isNotEvent) {
    let barElement;
    if (!isNotEvent) {
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
    }, 1000);
}

let timeouts = [];

function showNotificationbar(title, detail, color) {
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

function createNotificationbar(parentElement, title, detail, color) {
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

function showError(title, detail) {
    showNotificationbar(title, detail, 'rgb(240, 94, 94)');
}

function showWarning(title, detail) {
    showNotificationbar(title, detail, 'rgb(238, 169, 43)');
}

function showInformation(title, detail) {
    showNotificationbar(title, detail, 'rgb(84, 195, 48)');
}

// function checkNotEmpty(event) {
//     let input = event.srcElement;
//     if (input.value === '') {
//         input.value = '#'
//         showWarning('Important', 'Channelname must start with a numbersign/hashtag!')
//     }

//     if (event.keyCode == 13) {
//         bindChannel();
//     }
// }

// function checkForEnter(event) {
//     if (event.keyCode == 13) {
//         sendMessage();
//     }
// }

function checkStreamStatus(streamName) {
    return Promise.resolve(sendRequest(`https://api.twitch.tv/helix/streams?user_login=${streamName}`, false))
        .then((res) => {
            if (res === '{"data":[],"pagination":{}}') {
                return false;
            } else {
                return true;
            }
        });
}

function markDeleted(message) {
    message.classList.add('deleted');

    let scroll = message.parentNode.clientHeight + message.parentNode.scrollTop - 2 <= message.parentNode.scrollHeight
        && message.parentNode.clientHeight + message.parentNode.scrollTop + 2 >= message.parentNode.scrollHeight;

    console.log('DELETED:');
    console.log(message.parentNode.clientHeight + message.parentNode.scrollTop);
    console.log(message.parentNode.scrollHeight);
    console.log(scroll);

    let deletedText = message.children.namedItem('deleted-text');
    deletedText.innerText = '<deleted>';
    deletedText.classList.add('deleted-text');


    if (scroll) {
        message.parentNode.scrollTop = message.parentNode.scrollHeight;
    }
}

function redirect(location) {
    switch (location) {
        case 'contact':
            document.location.href = `${document.location.origin}/contact`;
            break;
    }
}

function togglePanelEditmode() {
    let settignsPane = document.querySelector('div.settings-pane');
    if (settignsPane.style.width === '0vw') {
        settignsPane.style.width = '25vw';
    } else {
        settignsPane.style.width = '0vw';
    }
    document.querySelector('div.settings-container').classList.toggle('hidden');
}

function deleteMessage(clickEvent) {
    let messageElement = clickEvent.srcElement.parentNode.parentNode;

    if (messageElement.id === null) {
        return;
    }

    window.chatClient.clearMessage(messageElement.getAttribute('channel'), messageElement.id);
}

function banUser(clickEvent) {
    //TODO CHANGE TO CUSTOM POPUP MASK
    let duration = prompt('Ban duration and corresponding unit [s,m,h,d,w]', '');
    let messageElement = clickEvent.srcElement.parentNode.parentNode;

    window.chatClient.timeoutUser(messageElement.getAttribute('channel'), messageElement.getAttribute('username'), duration);
}

function onClickUsername(event) {
    let user = event.srcElement.innerText;
    let messageInput = event.srcElement.parentNode.parentNode.parentNode.parentNode.querySelector('input.widget-chat-message-input');

    messageInput.value += `@${user} `;
    messageInput.focus()
    messageInput.scrollIntoView(false);
}

function promptCheck(action) {
    return new Promise((resolve) => {
        let prompt = document.querySelector('div.prompt-container');
        prompt.classList.remove('hidden');

        let title = prompt.querySelector('h3.prompt-title');
        title.innerText = action.toUpperCase();

        let yesButton = prompt.querySelector('button.prompt-button-yes');
        yesButton.onclick = () => {
            resolve(true);
        };

        let noButton = prompt.querySelector('button.prompt-button-no');
        noButton.onclick = () => {
            resolve(false);
        };

        let closeButton = prompt.querySelector('i.prompt-icon-close');
        closeButton.onclick = () => {
            resolve(false);
        };
    }).then((result) => {
        let prompt = document.querySelector('div.prompt-container');
        prompt.classList.add('hidden');

        return result;
    });
}

function clearDevStorage() {
    sessionStorage.removeItem('dev');
    sessionStorage.removeItem('devConnect');
}