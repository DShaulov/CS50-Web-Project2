// Checking if user already provided display name
document.addEventListener('DOMContentLoaded', () => {
    let check = localStorage.getItem("displayName");
    // if not, hide rest of site, reveal displayname creation
    if (check === null) {
        document.querySelector('#restOfApp').hidden = true;
        document.querySelector('#nameForm').hidden = false;
    }

    // if there is a username, reveal rest of site
    else {
        document.querySelector('#restOfApp').hidden = false;
        document.querySelector('#userName').innerHTML = "Welcome " + check;
    }


    // populate list of channels
    requestChannels();
})


function addDisplayName() {
    let name = document.querySelector("#displayName").value;
    localStorage.setItem("displayName", name);
}

document.querySelector('#createBtn').addEventListener('click', () => {
    const name = document.querySelector('#channelName').value;
    const data = new FormData();
    data.append('name', name);
    const request = new XMLHttpRequest();
    request.open('POST', '/create');
    request.onload = () => {

        // ! maybe replace with some handlebars ////////////
        // add the new channel name
        const channelWrap = document.createElement('div');
        channelWrap.className = 'channelWrap';
        const channel = document.createElement('a');
        channel.innerHTML = name;
        channel.href = "/chatroom";

        // adding the anchor to the div
        channelWrap.append(channel)
        document.querySelector('#channelList').append(channelWrap)
    }
    request.send(data);
})

function requestChannels() {
    console.log('im in the func')
    const request = new XMLHttpRequest();
    request.open('GET', '/channels')
    request.onload = () => {
        // get the response data (channel names), and for each one create
        // an anchor with an href to the chatroom
        const data = JSON.parse(request.responseText);
        for (let i = 0; i < data.length; i++){
            // creating a div for each channel name
            const channelWrap = document.createElement('div');
            channelWrap.className = 'channelWrap';
            const channel = document.createElement('a');
            channel.innerHTML = data[i];
            channel.href = "/chatroom";

            // adding the anchor to the div
            channelWrap.append(channel)
            document.querySelector('#channelList').append(channelWrap);
        }

    };
    request.send();
}

// adding click button on enter 

document.querySelector('#channelName').addEventListener('keyup', () => {
    console.log('Key up!');
});