function retrieveToken(){
    let parameters = document.location.hash;
    let token = parameters.slice(parameters.indexOf('=') + 1, parameters.indexOf('&'));
    
    sessionStorage.setItem('authToken', token);

    Promise.resolve(getUserName(token))
    .then((user) => {
        sessionStorage.setItem('authUser', user);
        redirect();
    });
}

function getUserName(token){
    let url = 'https://api.twitch.tv/kraken/user';
    let options = {
        credentials: "omit",
        headers: {
            "Client-ID": "oh2pvwrn4l1cirpbcz8ec60lsfan60",
            "Authorization": `OAuth ${token}`
        }
    }
    return fetch(url, options)
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
        //console.log(json);
        let jsonObject = JSON.parse(JSON.stringify(json));
        return jsonObject.name;
    })
    .catch((error) => {
        console.log(error);
    });
}

function redirect(){
    document.location.href = `${document.location.origin}/panel`;
}