function sendRequest(url, useCredentials, credentials){
    let options = {
        credentials: "omit",
        headers: {
            "Client-ID": "oh2pvwrn4l1cirpbcz8ec60lsfan60"
        }
    };
    let credentialsOptions = {
        credentials: "omit",
        headers: {
            "Authorization": `Bearer ${credentials}`
        }
    }
    return fetch(url, useCredentials ? credentialsOptions : options)
    .then((response) => {
        if(response.ok) {
            var contentType = response.headers.get('content-type');
            if(contentType && contentType.includes('application/json')){
                return response.json();
            }
            throw new TypeError('Got non json response');
        }
        throw new Error('Bad network response');
    })
    .then((json) => {
        //console.log(JSON.stringify(json));
        return JSON.stringify(json);
    })
    .catch((error) => {
        console.log(error);
        showError('Error', `Caching error: ${error.message}!`);
    });
}

function cacheBadges(url, name){
     Promise.resolve(sendRequest(url, false))
     .then((json) => {
         sessionStorage.setItem(name, json);
     });
}

function cacheChannelBadges(channelName, storageName){
    Promise.resolve(sendRequest(`https://api.twitch.tv/helix/users?login=${channelName.substr(1)}`, true, window.chatClient.password.substr(window.chatClient.password.indexOf(':') + 1)))
    .then((userInformation) => {
        if(userInformation === '{"data":[]}'){
            showError('Error', `Couldn\'t connect to chat channel! Channel \'${channelName}\' doesn\'t exist!`);
            document.querySelector('input.channel-name').value = channelName;
            unbindChannel(false);
            return;
        }
        let user = JSON.parse(userInformation);
        Promise.resolve(sendRequest(`https://badges.twitch.tv/v1/badges/channels/${user.data[0].id}/display`), false)
        .then((json) => {
            sessionStorage.setItem(storageName, json);
            showInformation('Joined', `Successfully joined chat channel \'${channelName}\'!`);
        })
    });
}