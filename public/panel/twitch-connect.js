function onPageLoad(){
    if(credentialsPresent()){
        window.chatClient = new chatClient({
            username: sessionStorage.getItem('authUser'),
            password: `oauth:${sessionStorage.getItem('authToken')}`
        });
        window.chatClient.open(); 
    } else {
        showWarning('Important', 'You have to login with your twitch account to use our service!');
        let statusText = document.querySelector('p.status');
        statusText.innerText = 'NOT LOGGED IN';
        statusText.classList.remove('green-text');
        statusText.classList.remove('orange-text');
        statusText.classList.add('red-text');
        let statusButton = document.querySelector('button.status-button');
        statusButton.innerText = 'LOG IN';
        statusButton.classList.remove('blocked');
        statusButton.setAttribute('onclick', 'initAuth();');

        widget2.setStatus('Not logged in', 'rgb(240, 94, 94)', 'log in', initAuth);
        widget2.setButtonBlocked(false);
    }
}

function credentialsPresent(){
    return sessionStorage.getItem('authUser') !== null && sessionStorage.getItem('authToken') !== null;
}

function initAuth(){
    let authEndpoint = 'https://id.twitch.tv/oauth2/authorize?client_id=oh2pvwrn4l1cirpbcz8ec60lsfan60&redirect_uri=http://localhost/auth&response_type=token&scope=chat:read+chat:edit+channel:moderate+user_read';
    document.location.href = authEndpoint;
}

var chatClient = function chatClient(options){
    this.username = options.username;
    this.password = options.password;

    this.server = 'irc-ws.chat.twitch.tv';
    this.port = 443;
}

chatClient.prototype.open = function open(){
    this.webSocket = new WebSocket('wss://' + this.server + ':' + this.port + '/', 'irc');

    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onopen = this.onOpen.bind(this);
};

chatClient.prototype.onError = function onError(message){
    console.log('Error: ' + message);
    showError('Error', `${message}. Please report the error to FruotTrakko(site administrator)!`);
};

chatClient.prototype.onMessage = function onMessage(message){
    if(message !== null){
        let parsed = this.parseMessage(message.data);
        if(parsed !== null){
            if(parsed.command === "PRIVMSG") {
                let messageBox = document.querySelector('div.message-box');
                constructMessageContainer(messageBox, 
                    (parsed.tags.displayName !== '' ? parsed.tags.displayName : parsed.username), 
                    parsed.tags.color, 
                    parsed.message,
                    parsed.tags.badges,
                    (parsed.message.startsWith('ACTION')),
                    parsed.channel,
                    parsed.tags.tmiSentTs,
                    false
                    );
            } else if(parsed.command === "PING") {
                this.webSocket.send("PONG :" + parsed.message);
                checkStreams();
            } else {
                console.log('Unidentified command!');
                if(parsed.command === null){
                    return;
                }
                showWarning('Warning', `Recieved unregistered command \'${parsed.command.trim()}\'!`);
            }
        }
    }
};

chatClient.prototype.onOpen = function onOpen(){
    var socket = this.webSocket;

    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');

        socket.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        showInformation('Connected', 'Successfully connected to a Twitch IRC server! Good luck!');
        
        let statusText = document.querySelector('p.status');
        statusText.innerText = 'CONNECTED';
        statusText.classList.remove('red-text');
        statusText.classList.remove('orange-text');
        statusText.classList.add('green-text');
        let statusButton = document.querySelector('button.status-button');
        statusButton.innerText = 'DISCONNECT';
        statusButton.classList.remove('blocked');
        statusButton.setAttribute('onclick', 'window.chatClient.close();');
    }
};

chatClient.prototype.channels = [];

chatClient.prototype.joinChannel = function joinChannel(channel){
    if(this.channels.includes(channel)){
        console.log(`Already connected to channel ${channel}!`);
        showError('Error', `Already connected to channel ${channel}! Try with new connection!`);
        return;
    }
    if(this.webSocket !== undefined){
        this.webSocket.send('JOIN ' + channel);
        this.channels.push(channel);
        showInformation('Joining', `Joining chat channel \'${channel}\'`);
    } else {
        showError('Error', 'You have to connect to a Twitch server before you can join a channel!');
    }
}

chatClient.prototype.leaveChannel = function leaveChannel(channel){
    if(!this.channels.includes(channel)){
        console.log(`Not connected to channel ${channel}!`);
        showError('Error', `Not connected to channel ${channel}! Try connecting to it first!`);
        return;
    }
    this.webSocket.send('PART ' + channel);
    this.channels.pop(channel);
    showInformation('Leaved', `Successfully left chat channel \'${channel}\'`);
}

chatClient.prototype.getChannels = function getChannels(){
    return this.channels;
}

chatClient.prototype.sendMessage = function(channel, message){
    this.webSocket.send(`PRIVMSG ${channel} :${message}`);

    let messageBox = document.querySelector('div.message-box');
    constructMessageContainer(messageBox, this.username, null, message, '', false, channel, Date.now(), true);
}

chatClient.prototype.onClose = function onClose(){
    this.channels = [];
    let parentElement = document.querySelector('div.channel-container');
    parentElement.childNodes.forEach((child) => {
        child.remove();
    });
    console.log('Disconnected from the chat server.');
    showInformation('Disconnected', 'Successfully disconnected from the Twitch IRC servers!');

    let statusText = document.querySelector('p.status');
    statusText.innerText = 'NOT CONNECTED';
    statusText.classList.remove('red-text');
    statusText.classList.remove('green-text');
    statusText.classList.add('orange-text');
    let statusButton = document.querySelector('button.status-button');
    statusButton.innerText = 'CONNECT';
    statusButton.classList.remove('blocked');
    statusButton.setAttribute('onclick', 'window.chatClient.open();');
};

chatClient.prototype.close = function close(){
    if(this.webSocket){
        this.webSocket.close();
    } else {
        showError('Error', 'Connect before trying to disconnect!');
    }
};

//Original message (message.data)
/* "@badge-info=subscriber/2;
    badges=subscriber/0,sub-gifter/1;
    color=#0000FF;
    display-name=felstasche;
    emotes=;
    flags=;
    id=730736c7-b5a0-41df-a76a-36532e1fb8f7;
    mod=0;
    room-id=21045643;
    subscriber=1;
    tmi-sent-ts=1555682808597;
    turbo=0;
    user-id=254916435;
    user-type= 
    :felstasche!felstasche@felstasche.tmi.twitch.tv PRIVMSG #clym :Sub Server noch ein bisschen ?"
*/
chatClient.prototype.parseMessage = function parseMessage(rawMessage) {
    var parsedMessage = {
        message: null,
        tags: null,
        command: null,
        original: rawMessage,
        channel: null,
        username: null
    };

    if(rawMessage[0] === '@'){
        //calculating indicies
        var tagIndex = rawMessage.indexOf(' '),
        userIndex = rawMessage.indexOf(' ', tagIndex + 1),
        commandIndex = rawMessage.indexOf(' ', userIndex + 1),
        channelIndex = rawMessage.indexOf(' ', commandIndex + 1),
        messageIndex = rawMessage.indexOf(':', channelIndex + 1);

        //parsing into parsedMessage
        parsedMessage.tags = rawMessage.slice(0, tagIndex);
        parsedMessage.username = rawMessage.slice(tagIndex + 2, rawMessage.indexOf('!'));
        parsedMessage.command = rawMessage.slice(userIndex + 1, commandIndex);
        parsedMessage.channel = rawMessage.slice(commandIndex + 1, channelIndex);
        parsedMessage.message = rawMessage.slice(messageIndex + 1);

        if(parsedMessage.command === 'PRIVMSG'){
            var tags = {
                badgeInfo: null,
                badges: null,
                color: null,
                displayName: null,
                emotes: null,
                flags: null,
                id: null,
                mod: null,
                roomId: null,
                subscriber: null,
                tmiSentTs: null,
                turbo: null,
                userId: null,
            };

            //get indecies of position of single elements
            var badgeInfoIndex = parsedMessage.tags.indexOf(';'),
            badgesIndex = parsedMessage.tags.indexOf(';', badgeInfoIndex + 1),
            colorIndex = parsedMessage.tags.indexOf(';', badgesIndex + 1),
            displayNameIndex = parsedMessage.tags.indexOf(';', colorIndex + 1),
            emotesIndex = parsedMessage.tags.indexOf(';', displayNameIndex + 1),
            flagsIndex = parsedMessage.tags.indexOf(';', emotesIndex + 1),
            idIndex = parsedMessage.tags.indexOf(';', flagsIndex + 1),
            modIndex = parsedMessage.tags.indexOf(';', idIndex + 1),
            roomIdIndex = parsedMessage.tags.indexOf(';', modIndex + 1),
            subscriberIndex = parsedMessage.tags.indexOf(';', roomIdIndex + 1),
            tmiSentTsIndex = parsedMessage.tags.indexOf(';', subscriberIndex + 1),
            turboIndex = parsedMessage.tags.indexOf(';', tmiSentTsIndex + 1),
            userIdIndex = parsedMessage.tags.indexOf(';', turboIndex + 1);
    
            //slice the string an assaign to coresponding object member
            tags.badgeInfo = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=') + 1, badgeInfoIndex),
            tags.badges = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', badgeInfoIndex) + 1 , badgesIndex),
            tags.color = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', badgesIndex) + 1 , colorIndex),
            tags.displayName = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', colorIndex) + 1 , displayNameIndex),
            tags.emotes = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', displayNameIndex) + 1 , emotesIndex),
            tags.flags = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', emotesIndex) + 1 , flagsIndex),
            tags.id = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', flagsIndex) + 1 , idIndex),
            tags.mod = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', idIndex) + 1 , modIndex),
            tags.roomId = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', modIndex) + 1 , roomIdIndex),
            tags.subscriber = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', roomIdIndex) + 1 , subscriberIndex),
            tags.tmiSentTs = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', subscriberIndex) + 1 , tmiSentTsIndex),
            tags.turbo = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', tmiSentTsIndex) + 1 , turboIndex),
            tags.userId = parsedMessage.tags.slice(parsedMessage.tags.indexOf('=', turboIndex) + 1 , userIdIndex);

            let badgeCount = (tags.badges.match(/\//g) || []).length;
            if(badgeCount > 0){
                let badgeMap = new Map();

                for(let i = 0; i < badgeCount; i++){                    
                    slashIndex = i == 0 ? tags.badges.indexOf('/') : tags.badges.indexOf('/', slashIndex + 1);
                    commaIndex = i == 0 ? -1 : tags.badges.indexOf(',', commaIndex + 1);
                    badgeMap.set(tags.badges.slice(commaIndex + 1, slashIndex), tags.badges.slice(slashIndex + 1, tags.badges.indexOf(',', slashIndex) !== -1 ? tags.badges.indexOf(',', slashIndex) : tags.badges.length));
                }

                tags.badges = badgeMap;
            }

            parsedMessage.tags = tags;
        }

    } else if(rawMessage.startsWith("PING")) {
        parsedMessage.command = "PING";
        parsedMessage.message = rawMessage.split(":")[1];
    }

    console.log(parsedMessage);
    return parsedMessage;
}
