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
        this.stati = new Map();

        let containerDiv = document.createElement('div');
        containerDiv.classList.add('widget-status-container');
        this.statusContainer = containerDiv;

        let statusContainer = document.createElement('div');
        statusContainer.classList.add('widget-status-status-container');

        let infoText = document.createElement('p');
        infoText.classList.add('widget-status-infotext', 'heading');
        infoText.innerText = 'Twitch: ';
        let statusText = document.createElement('p');
        statusText.classList.add('widget-status-statustext', 'heading');
        statusText.innerText = 'WAITING';
        statusText.style.color = 'rgb(238, 169, 43)';
        this.statusText = statusText;
        this.stati.set('twitch', statusText);

        statusContainer.appendChild(infoText);
        statusContainer.appendChild(statusText);

        containerDiv.appendChild(statusContainer);

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

    addStatus(key, initialState, color) {
        let statusContainer = document.createElement('div');
        statusContainer.classList.add('widget-status-status-container');

        let infoText = document.createElement('p');
        infoText.classList.add('widget-status-infotext', 'heading');
        infoText.innerText = `${key}: `;
        let statusText = document.createElement('p');
        statusText.classList.add('widget-status-statustext', 'heading');
        statusText.innerText = initialState.toUpperCase();
        statusText.style.color = color;
        this.stati.set(key, statusText);

        statusContainer.appendChild(infoText);
        statusContainer.appendChild(statusText);

        this.statusContainer.appendChild(statusContainer);
    }

    setStatus(key, status, color, buttonText, buttonCallback, bind) {
        let obj = this.stati.get(key);
        obj.innerText = status.toUpperCase();
        obj.style.color = color;

        if (buttonText) {
            this.statusButton.innerText = buttonText.toUpperCase();
            if (bind) {
                this.statusButton.onclick = buttonCallback.bind(bind);
            } else {
                this.statusButton.onclick = buttonCallback
            }
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
        if (!message) {
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

        new Promise((resolve, reject) => {
            tryUntilTrue(window.chatClient.isReady.bind(window.chatClient), 1000, 10, resolve, reject);
        }).then(() => {
            window.chatClient.joinChannel(channel);
            cacheChannelBadges(channel, `${channel.substr(1)}-badges`);
        }).catch((error) => {
            console.error(error);
            showError('Error', 'Couldn\'t bind channel to chat widget!');
        });

        checkStreamStatus(channel.slice(1))
            .then((status) => {
                window.statusWidget.addStatus(channel, status ? 'Streaming' : 'Offline', status ? 'rgb(173, 97, 224)' : 'rgb(238, 169, 43)');
            });
    }

    onMessage(message) {
        console.log(message);
        if (message.command === 'PRIVMSG') {
            if (message.channel !== this.channel) {
                return;
            }
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
        } else if (message.command === 'PING') {
            checkStreamStatus(this.channel.slice(1))
                .then((status) => {
                    window.statusWidget.setStatus(this.channel, status ? 'Streaming' : 'Offline', status ? 'rgb(173, 97, 224)' : 'rgb(238, 169, 43)');
                });
        } else if (message.command === 'SELF') {
            if (message.channel !== this.channel) {
                return;
            }

            this.selfMessage = message;
        } else if (message.command === 'USERSTATE') {
            if (this.selfMessage) {
                constructMessageContainer(this.messageBox,
                    (message.tags.displayName !== '' ? message.tags.displayName : message.username),
                    message.tags.color,
                    this.selfMessage.message,
                    message.tags.badges,
                    (message.message.startsWith('ACTION')),
                    this.selfMessage.channel,
                    Date.now(),
                    true
                );

                this.selfMessage = null;
            }
        }
    }
}