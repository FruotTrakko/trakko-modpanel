class TempWidget extends Widget {

    constructor(columnElement, height) {
        super(columnElement, '');

        this.widget.classList.add('widget-temp');
        this.widget.style.height = `${height}px`;
        this.widgetMover.remove();

        window.dashboard.removeWidget(this);
    }
}

class NewWidget extends Widget {

    constructor(columnElement, dashboard) {
        super(columnElement, '', dashboard);

        this.widget.querySelector('.widget-handle').remove();
        this.widget.classList.add('widget-new-container', 'widget-new');

        let addIconWrapper = document.createElement('div');
        addIconWrapper.classList.add('widget-new-icon-wrapper', 'widget-new');
        addIconWrapper.onclick = this.onClickNew.bind(this);

        let addIcon = document.createElement('span');
        addIcon.classList.add('widget-icon', 'widget-new', 'fa-stack');

        let plus = document.createElement('i');
        plus.classList.add('widget-icon-part', 'widget-new', 'fas', 'fa-plus', 'fa-stack-1x')
        let circle = document.createElement('i');
        circle.classList.add('widget-icon-part', 'widget-new', 'far', 'fa-circle', 'fa-stack-2x')

        addIcon.appendChild(plus);
        addIcon.appendChild(circle);

        addIconWrapper.appendChild(addIcon);

        this.contentElement.appendChild(addIconWrapper);
        this.contentElement.classList.add('widget-new-content', 'widget-new');

        let selectionDiv = document.createElement('div');
        selectionDiv.classList.add('widget-new-selection-container', 'widget-hidden', 'widget-container', 'widget-new');
        this.selection = selectionDiv;

        let selectionHeader = document.createElement('h3');
        selectionHeader.classList.add('widget-new-selection-header', 'widget-new', 'heading');
        selectionHeader.innerText = 'ADD NEW WIDGET';
        let selectionSearchbox = document.createElement('input');
        selectionSearchbox.classList.add('widget-new-selection-searchbox', 'widget-new');
        selectionSearchbox.type = 'text';
        selectionSearchbox.placeholder = 'Search Widget';
        selectionSearchbox.onkeyup = this.updateSearch.bind(this);
        this.search = selectionSearchbox;

        let resultDiv = document.createElement('div');
        resultDiv.classList.add('widget-new-selection-results', 'widget-new');
        this.resultContainer = resultDiv;

        selectionDiv.appendChild(selectionHeader);
        selectionDiv.appendChild(selectionSearchbox);
        selectionDiv.appendChild(resultDiv);

        this.contentElement.appendChild(selectionDiv);
    }

    onClickNew(clickEvent) {
        this.toggleSelection();
    }

    toggleSelection() {
        this.selection.classList.toggle('widget-hidden');

        if (!this.selection.classList.contains('widget-hidden')) {
            this.updateSearch();
            this.search.focus();
            window.onclick = this.onWindowClick.bind(this);
        } else {
            window.onclick = '';
            this.search.value = '';
        }
    }

    updateSearch(keyEvent) {
        let searchString = "";
        if (keyEvent) {
            if (keyEvent.keyCode == 13) {
                this.onSelect({srcElement: this.resultContainer.firstElementChild});
            }

            searchString = keyEvent.srcElement.value.toUpperCase();
        }

        let oldElements = this.resultContainer.childElementCount;

        for (let i = 0; i < oldElements; i++) {
            this.resultContainer.firstElementChild.remove();
        }

        let widgets = new Map(window.dashboard.getAvailableWidgets());

        for (let widget of widgets.keys()) {
            if (!widget.toUpperCase().includes(searchString)) {
                widgets.delete(widget);
            }
        }

        widgets.forEach((value, key) => {
            let resultDiv = document.createElement('div');
            resultDiv.classList.add('widget-new-selection-result', 'widget-new');
            resultDiv.onclick = this.onSelect.bind(this);

            let plus = document.createElement('i');
            plus.classList.add('widget-icon-part', 'widget-new', 'fas', 'fa-plus');

            let nameParagraph = document.createElement('p');
            nameParagraph.classList.add('widget-new-selection-name', 'widget-new');
            nameParagraph.innerText = key;

            resultDiv.appendChild(plus);
            resultDiv.appendChild(nameParagraph);

            this.resultContainer.appendChild(resultDiv);
        });

        this.resultContainer.firstElementChild.classList.add('widget-new-selection-selected');
    }

    onSelect(mouseEvent) {
        let widgetKey = mouseEvent.srcElement.innerText;
        let argumentArray = [
            this.columnElement
        ];

        Reflect.construct(window.dashboard.getAvailableWidgets().get(widgetKey), argumentArray);

        this.toggleSelection();
    }

    onWindowClick(mouseEvent) {
        if (!mouseEvent.srcElement.classList.contains('widget-new')) {
            this.toggleSelection();
        }
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

    removeStatus(key) {
        let obj = this.stati.get(key);
        this.stati.delete(key);

        if (obj) {
            obj.parentNode.remove();
        }
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
        sendButton.onclick = this.sendMessage.bind(this);
        this.sendButton = sendButton;

        let modalDiv = document.createElement('div');
        modalDiv.classList.add('widget-chat-settings', 'widget-container');
        this.settingsModal = modalDiv;

        let settingsHeader = document.createElement('h3');
        settingsHeader.classList.add('heading', 'widget-chat-settings-header');
        settingsHeader.innerText = 'SETTINGS';
        let channelInput = document.createElement('input');
        channelInput.classList.add('widget-chat-settings-channel-input');
        channelInput.type = 'text';
        channelInput.value = '#';
        channelInput.onkeyup = this.checkSettingsKey.bind(this);
        this.channelInput = channelInput;
        let channelButton = document.createElement('button');
        channelButton.classList.add('widget-chat-settings-channel-button');
        channelButton.type = 'button';
        channelButton.innerText = 'JOIN';
        channelButton.onclick = this.bindNewChannel.bind(this);

        modalDiv.appendChild(settingsHeader);
        modalDiv.appendChild(channelInput);
        modalDiv.appendChild(channelButton);

        buttonDiv.appendChild(messageInput);
        buttonDiv.appendChild(sendButton);

        this.contentElement.appendChild(modalDiv);
        this.contentElement.appendChild(messageBoxDiv);
        this.contentElement.appendChild(buttonDiv);

        if (channel) {
            this.channel = channel;
            this.setTitle(`Chat - ${this.channel}`);
            this.bindChannel(this.channel);
            this.settingsModal.classList.add('widget-hidden');
        } else {
            this.input.classList.add('widget-chat-blocked');
            this.input.setAttribute('disabled', '');
            this.sendButton.classList.add('widget-chat-blocked');
            this.sendButton.setAttribute('disabled', '');
            this.messageBox.classList.add('widget-chat-overlay-blur');
            this.input.parentNode.classList.add('widget-chat-overlay-blur');
        }

        this.addSettings();
    }

    checkSendKey(event) {
        if (event.keyCode == 13) {
            this.sendMessage();
        }
    }

    checkSettingsKey(event) {
        let input = event.srcElement;

        if (input.value === '') {
            input.value = '#';
            showWarning('Important', 'Channelname must start with a numbersign/hashtag!');
        }

        if (event.keyCode == 13) {
            this.bindNewChannel(null, input);
        }
    }

    sendMessage(event) {
        if (event) {
            if (event.srcElement.classList.contains('widget-chat-blocked')) {
                return;
            }
        }

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
            this.clearMessages();
        }).catch((error) => {
            console.error(error);
            showError('Error', 'Couldn\'t bind channel to chat widget!');
        });

        checkStreamStatus(channel.slice(1))
            .then((status) => {
                window.statusWidget.addStatus(channel, status ? 'Streaming' : 'Offline', status ? 'rgb(173, 97, 224)' : 'rgb(238, 169, 43)');
            });
    }

    bindNewChannel(event, inputElement) {
        let input;
        if (event) {
            input = this.channelInput;
        } else {
            input = inputElement;
        }

        let newChannel = input.value;
        input.value = '#';

        window.chatClient.leaveChannel(this.channel);
        window.statusWidget.removeStatus(this.channel);

        this.channel = newChannel;
        this.setTitle(`Chat - ${this.channel}`);
        this.bindChannel(newChannel);

        this.toggleSettings();
    }

    onMessage(message) {
        console.log(message);
        console.log(`Listening for ${this.channel}`);
        if (!this.channel) {
            return;
        }

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
                false,
                message.tags.id
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
                    true,
                    null
                );

                this.selfMessage = null;
            }
        } else if (message.command === 'CLEARMSG') {
            if (message.channel !== this.channel) {
                return;
            }
            this.messageBox.childNodes.forEach((child) => {
                if (child.id == message.tags.targetMsgId) {
                    markDeleted(child);
                }
            });
        }
    }

    toggleSettings(event) {
        this.settingsModal.classList.toggle('widget-hidden');

        this.input.classList.toggle('widget-chat-blocked');
        this.input.toggleAttribute('disabled');
        this.sendButton.classList.toggle('widget-chat-blocked');
        this.sendButton.toggleAttribute('disabled');

        this.messageBox.classList.toggle('widget-chat-overlay-blur');
        this.input.parentNode.classList.toggle('widget-chat-overlay-blur');
    }

    clearMessages() {
        let messages = this.messageBox.childElementCount;
        for (let j = 0; j < messages; j++) {
            this.messageBox.firstElementChild.remove();
        }
    }
}