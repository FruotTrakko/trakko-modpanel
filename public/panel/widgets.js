class TempWidget extends Widget {

    constructor(columnElement, height) {
        super(columnElement, '');

        this.widget.classList.add('widget-temp');
        this.widget.style.height = `${height}px`;
        this.widgetMover.remove();

        window.dashboard.removeWidget(this);
    }
}

/**
 *  Not fully implemented. Missing adding capability. A modal window should appear with a dropdown of possible widgets.
 */
class NewWidget extends Widget {

    constructor(columnElement, dashboard) {
        super(columnElement, '', dashboard);

        this.widget.querySelector('.widget-handle').remove();
        this.widget.classList.add('widget-new-container');

        let addIconWrapper = document.createElement('div');
        addIconWrapper.classList.add('widget-new-icon-wrapper');

        let addIcon = document.createElement('span');
        addIcon.classList.add('widget-icon', 'fa-stack');

        let plus = document.createElement('i');
        plus.classList.add('widget-icon-part', 'fas', 'fa-plus', 'fa-stack-1x')
        let circle = document.createElement('i');
        circle.classList.add('widget-icon-part', 'far', 'fa-circle', 'fa-stack-2x')

        addIcon.appendChild(plus);
        addIcon.appendChild(circle);

        addIconWrapper.appendChild(addIcon);

        this.contentElement.appendChild(addIconWrapper);
        this.contentElement.classList.add('widget-new-content');
    }
}

class StatusWidget extends Widget {

    constructor(columnElement) {
        super(columnElement, 'Status');

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('widget-status-container');

        let infoText = document.createElement('p');
        infoText.classList.add('widget-status-infotext', 'heading');
        infoText.innerText = 'Twitch: ';
        let statusText = document.createElement('p');
        statusText.classList.add('widget-status-statustext', 'heading');
        statusText.innerText = 'WAITING';
        statusText.style.color = 'rgb(238, 169, 43)';
        this.statusText = statusText;

        containerDiv.appendChild(infoText);
        containerDiv.appendChild(statusText);

        let buttonDiv = document.createElement('div');
        buttonDiv.classList.add('widget-status-buttoncontainer');

        let statusButton = document.createElement('button');
        statusButton.classList.add('widget-status-statusbutton', 'blocked');
        statusButton.innerText = 'WAITING';
        statusButton.type = 'button';
        this.statusButton = statusButton;

        buttonDiv.appendChild(statusButton);

        this.contentElement.appendChild(containerDiv);
        this.contentElement.appendChild(buttonDiv);
    }

    setStatus(status, color, buttonText, buttonCallback, bind) {
        this.statusText.innerText = status.toUpperCase();
        this.statusText.style.color = color;

        this.statusButton.innerText = buttonText.toUpperCase();
        if (bind) {
            this.statusButton.onclick = buttonCallback.bind(bind);
        } else {
            this.statusButton.onclick = buttonCallback
        }
    }

    setButtonBlocked(value) {
        if (value) {
            this.statusButton.classList.add('blocked');
        } else {
            this.statusButton.classList.remove('blocked');
        }
    }
}

class ChatWidget extends Widget {

    constructor(columnElement, channel) {
        super(columnElement, 'Chat');
        this.contentElement.classList.add('widget-chat-container');

        let messageBoxDiv = document.createElement('div');
        messageBoxDiv.classList.add('widget-chat-box');
        this.messageBox = messageBoxDiv;
        let buttonDiv = document.createElement('div');
        buttonDiv.classList.add('widget-chat-buttons');

        let messageInput = document.createElement('input');
        messageInput.classList.add('widget-chat-message-input');
        messageInput.type = 'text';
        messageInput.placeholder = 'Type your message here!';
        messageInput.onkeyup = this.checkSendKey.bind(this);
        this.input = messageInput;
        let sendButton = document.createElement('button');
        sendButton.classList.add('widget-chat-button-send');
        sendButton.innerText = 'Send';
        sendButton.type = 'button';
        sendButton.onclick = this.sendMessage;
        this.sendButton = sendButton;

        if (channel) {
            this.channel = channel;
            this.setTitle(`Chat - ${this.channel}`);
            this.bindChannel(this.channel);
        } else {
            this.contentElement.classList.add('widget-chat-overlay-blur');
            this.input.classList.add('widget-chat-blocked');
            this.sendButton.classList.add('widget-chat-blocked');

            //TODO ADD CHANNEL SELECT
        }

        buttonDiv.appendChild(messageInput);
        buttonDiv.appendChild(sendButton);

        this.contentElement.appendChild(messageBoxDiv);
        this.contentElement.appendChild(buttonDiv);
    }

    checkSendKey(event) {
        if (event.keyCode == 13) {
            this.sendMessage();
        }
    }

    sendMessage() {
        let message = this.input.value;
        if(!message) {
            showError('Error', 'The message to send must not be empty!');
            return;
        }
        window.chatClient.sendMessage(this.channel, message);
        this.input.value = '';
    }

    bindChannel(channel) {
        if (!window.chatClient.joinChannel) {
            console.log('Not connected to twitch thus not able to bind channel')
            return;
        }
        if (channel === '#' || channel === '' || !channel.startsWith('#')) {
            showError('Error', 'The channel name must be at least one character long and start with a numbersign!');
            return;
        }

        //TODO CHANGE TO PROMISE GIVEN WHEN WEBSOCKET IS CONNECTED
        setTimeout(() => {
            window.chatClient.joinChannel(channel);
            cacheChannelBadges(channel, `${channel.substr(1)}-badges`);
        }, 1000);

        //TODO ADD STREAM STATUS TO STATUS PANEL
    }

    onMessage(message) {
        console.log(message);
        if (message.command === "PRIVMSG") {
            constructMessageContainer(this.messageBox,
                (message.tags.displayName !== '' ? message.tags.displayName : message.username),
                message.tags.color,
                message.message,
                message.tags.badges,
                (message.message.startsWith('ACTION')),
                message.channel,
                message.tags.tmiSentTs,
                false
            );
        }
    }
}