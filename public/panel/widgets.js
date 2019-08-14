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
        this.icon = addIconWrapper;

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
        this.icon.classList.toggle('widget-new-icon-wrapper-selected');

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
                this.onSelect({ srcElement: this.resultContainer.firstElementChild });
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

            this.channelInput.focus();
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

        if (!this.settingsModal.classList.contains('widget-hidden')) {
            this.channelInput.focus();
        }
    }

    clearMessages() {
        let messages = this.messageBox.childElementCount;
        for (let j = 0; j < messages; j++) {
            this.messageBox.firstElementChild.remove();
        }
    }
}

class ConfigurationWidget extends Widget {

    constructor(columnElement, title) {
        super(columnElement, title);

        for (let widget of window.dashboard.widgets) {
            if (widget !== this && widget.title === title) {
                window.dashboard.removeWidget(this);
                this.widget.remove();
                showError('Error', 'A configuration widget must only be opened once!');
            }
        }
    }

}

class HighlightConfigWidget extends ConfigurationWidget {

    constructor(columnElement) {
        super(columnElement, 'Highlight Configuration');

        this.updateOptions();
    }

    updateOptions() {
        this.clearOptions();

        window.highlightFilter.forEach((value, key) => {
            let optionElement = document.createElement('div');
            optionElement.classList.add('widget-highlight-option');

            let optionHandle = document.createElement('div');
            optionHandle.classList.add('widget-highlight-option-handle');
            optionHandle.onclick = this.toggleOption.bind(this, key, optionElement, value);

            let optionIcon = document.createElement('i');
            optionIcon.classList.add('widget-highlight-option-icon', 'widget-highlight-option-arrow', 'fas', 'fa-angle-right', 'fa-lg');
            let optionText = document.createElement('input');
            optionText.classList.add('heading', 'blocked', 'widget-highlight-option-text', 'widget-highlight-option-text-hideinput');
            optionText.type = 'text';
            optionText.value = `${key}`;
            optionText.disabled = true;
            optionText.onclick = this.clickOptionTitle.bind(this);
            let editIcon = document.createElement('i');
            editIcon.classList.add('widget-highlight-option-icon', 'widget-highlight-option-edit', 'fas', 'fa-pencil-alt');
            editIcon.onclick = this.editOption.bind(this, key, optionElement, value);
            let removeIcon = document.createElement('i');
            removeIcon.classList.add('widget-highlight-option-icon', 'widget-highlight-option-remove', 'fas', 'fa-trash-alt');
            removeIcon.onclick = this.removeOption.bind(this, key);

            optionHandle.appendChild(optionIcon);
            optionHandle.appendChild(optionText);
            optionHandle.appendChild(editIcon);
            optionHandle.appendChild(removeIcon);

            optionElement.appendChild(optionHandle);

            this.contentElement.appendChild(optionElement);
        });

        let addElement = document.createElement('div');
        addElement.classList.add('widget-highlight-add');
        addElement.onclick = this.addOption.bind(this);

        let addIcon = document.createElement('i');
        addIcon.classList.add('widget-highlight-add-icon', 'fas', 'fa-plus');

        let addText = document.createElement('p');
        addText.classList.add('heading', 'widget-highlight-add-text');
        addText.innerText = 'ADD NEW';

        addElement.appendChild(addIcon);
        addElement.appendChild(addText);

        this.contentElement.appendChild(addElement);
    }

    clearOptions() {
        let options = this.contentElement.childElementCount;
        for (let j = 0; j < options; j++) {
            this.contentElement.firstElementChild.remove();
        }
    }

    addOption(mouseEvent) {
        //TODO
        console.log(mouseEvent);
    }

    removeOption(option, mouseEvent) {
        mouseEvent.stopPropagation();

        promptCheck(`Delete option "${option}"`)
            .then((success) => {
                if (success) {
                    window.highlightFilter.delete(option);
                    this.updateOptions();
                } else {
                    showWarning('Abort', `Aborted deletion of option "${option}"!`);
                }
            });
    }

    toggleOption(option, optionElement, optionSettings, mouseEvent) {
        if (optionElement.classList.contains('expanded')) {
            this.collapseOption(option, optionElement);
            optionElement.classList.remove('expanded');
            optionElement.querySelector('i.widget-highlight-option-arrow').style.transform = '';
        } else {
            this.expandOption(option, optionElement, optionSettings);
            optionElement.classList.add('expanded');
            optionElement.querySelector('i.widget-highlight-option-arrow').style.transform = 'rotate(90deg)';
        }
    }

    expandOption(option, optionElement, optionSettings) {
        let settingsDiv = document.createElement('div');
        settingsDiv.classList.add('widget-highlight-option-settings');

        let colorDiv = document.createElement('div');
        colorDiv.classList.add('widget-highlight-option-setting');
        let colorLabel = document.createElement('p');
        colorLabel.classList.add('widget-highlight-option-label');
        colorLabel.innerText = 'Color:';
        let colorInput = document.createElement('input');
        colorInput.classList.add('widget-highlight-option-color', 'blocked');
        colorInput.type = 'color';
        colorInput.disabled = true;
        colorInput.onchange = this.onValueChange.bind(this, option);
        //TODO MORE OPTIONS

        colorDiv.appendChild(colorLabel);
        colorDiv.appendChild(colorInput);

        let inverseDiv = document.createElement('div');
        inverseDiv.classList.add('widget-highlight-option-setting');
        let inverseLabel = document.createElement('p');
        inverseLabel.classList.add('widget-highlight-option-label');
        inverseLabel.innerText = 'Inverse scheme?';
        let inverseSwitch = document.createElement('label');
        inverseSwitch.classList.add('switch');

        let inverseSwitchInput = document.createElement('input');
        inverseSwitchInput.classList.add('widget-highlight-option-inverse');
        inverseSwitchInput.type = 'checkbox';
        inverseSwitchInput.disabled = true;
        inverseSwitchInput.onchange = this.onValueChange.bind(this, option);
        let inverseSwitchSlider = document.createElement('span');
        inverseSwitchSlider.classList.add('slider', 'blocked');

        inverseSwitch.appendChild(inverseSwitchInput);
        inverseSwitch.appendChild(inverseSwitchSlider);

        inverseDiv.appendChild(inverseLabel);
        inverseDiv.appendChild(inverseSwitch);

        let caseDiv = document.createElement('div');
        caseDiv.classList.add('widget-highlight-option-setting');
        let caseLabel = document.createElement('p');
        caseLabel.classList.add('widget-highlight-option-label');
        caseLabel.innerText = 'Is case sensitive?';
        let caseSwitch = document.createElement('label');
        caseSwitch.classList.add('switch');

        let caseSwitchInput = document.createElement('input');
        caseSwitchInput.classList.add('widget-highlight-option-case');
        caseSwitchInput.type = 'checkbox';
        caseSwitchInput.disabled = true;
        caseSwitchInput.onchange = this.onValueChange.bind(this, option);
        let caseSwitchSlider = document.createElement('span');
        caseSwitchSlider.classList.add('slider', 'blocked');

        caseSwitch.appendChild(caseSwitchInput);
        caseSwitch.appendChild(caseSwitchSlider);

        caseDiv.appendChild(caseLabel);
        caseDiv.appendChild(caseSwitch);

        let emptyDiv = document.createElement('div');
        emptyDiv.classList.add('widget-highlight-option-setting');

        let advancedDiv = document.createElement('div');
        advancedDiv.classList.add('widget-highlight-option-setting');
        let advancedLabel = document.createElement('p');
        advancedLabel.classList.add('heading', 'widget-highlight-option-label');
        advancedLabel.innerText = 'ADVANCED OPTIONS'

        advancedDiv.appendChild(advancedLabel);

        let spaceDiv = document.createElement('div');
        spaceDiv.classList.add('widget-highlight-option-setting');

        let regexDiv = document.createElement('div');
        regexDiv.classList.add('widget-highlight-option-setting');
        let regexLabel = document.createElement('p');
        regexLabel.classList.add('widget-highlight-option-label');
        regexLabel.innerText = 'Is regular expression?';
        let regexSwitch = document.createElement('label');
        regexSwitch.classList.add('switch');

        let regexSwitchInput = document.createElement('input');
        regexSwitchInput.classList.add('widget-highlight-option-regex');
        regexSwitchInput.type = 'checkbox';
        regexSwitchInput.disabled = true;
        regexSwitchInput.onchange = this.onValueChange.bind(this, option);
        let regexSwitchSlider = document.createElement('span');
        regexSwitchSlider.classList.add('slider', 'blocked');

        regexSwitch.appendChild(regexSwitchInput);
        regexSwitch.appendChild(regexSwitchSlider);

        regexDiv.appendChild(regexLabel);
        regexDiv.appendChild(regexSwitch);

        settingsDiv.appendChild(colorDiv);
        settingsDiv.appendChild(inverseDiv);
        settingsDiv.appendChild(caseDiv);
        settingsDiv.appendChild(emptyDiv);
        settingsDiv.appendChild(advancedDiv);
        settingsDiv.appendChild(spaceDiv);
        settingsDiv.appendChild(regexDiv);

        optionElement.appendChild(settingsDiv);

        console.log(optionSettings);

        let colors = optionSettings.color;
        colorInput.value = rgbToHex(
            parseInt(colors.slice(colors.indexOf('(') + 1, colors.indexOf(','))),
            parseInt(colors.slice(colors.indexOf(',') + 1, colors.indexOf(',', colors.indexOf(',') + 1))),
            parseInt(colors.slice(colors.indexOf(',', colors.indexOf(',') + 1) + 1, colors.indexOf(')')))
        );
        inverseSwitchInput.checked = optionSettings.inverse;
        caseSwitchInput.checked = optionSettings.caseSensitive;
        regexSwitchInput.checked = optionSettings.regex;
    }

    collapseOption(option, optionElement) {
        optionElement.querySelector('div.widget-highlight-option-settings').remove();
    }

    editOption(option, optionElement, optionSettings, mouseEvent) {
        mouseEvent.stopPropagation();
        //TODO

        if (!optionElement.classList.contains('expanded')) {
            this.toggleOption(option, optionElement, optionSettings);
        }

        optionElement.querySelectorAll('.blocked').forEach((element) => {
            console.log(element);
            if (element.tagName === 'SPAN') {
                element.classList.remove('blocked');
                let target = element.parentElement.querySelector('input');
                target.disabled = false;
            } else {
                if (element.classList.contains('widget-highlight-option-text')) {
                    element.classList.remove('widget-highlight-option-text-hideinput');
                }
                element.classList.remove('blocked');
                element.disabled = false;
            }
        });

        console.log(option, optionElement, mouseEvent);
    }

    onValueChange(option, changeEvent) {
        console.log(option, changeEvent);
    }

    clickOptionTitle(mouseEvent) {
        mouseEvent.stopPropagation();
    }

}