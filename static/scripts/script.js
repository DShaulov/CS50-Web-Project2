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
    // if field is empty, do nothing
    const name = document.querySelector('#channelName').value;
    if (name === ""){
        document.querySelector('#channelName').placeholder = "*cannot be empty";
        return;
    }

    // clear input field once enter is pressed
    document.querySelector('#channelName').value = "";

    // clear focus (blur!)
    document.querySelector('#channelName').blur();

    // get channel name and submit request to flask server //
    
    const data = new FormData();
    data.append('name', name);
    const request = new XMLHttpRequest();
    request.open('POST', '/create');
    request.onload = () => {

        // check if what came back is error that channel already exists
        const response = request.responseText;
        console.log(response);
        if (response === 'error') {
            // create new error paragraph
            const error = document.createElement('p');
            error.innerHTML = "*channel name already exists";
            error.style = "color: red;";
            error.id = "existsError"

            // add the paragraph to the div
            document.querySelector('#channelCreateDiv').append(error);
            return;
        }

        // remove error message if there was one previously
        else {
            console.log(document.querySelector('#existsError'));
            if (document.querySelector('#existsError') != null) {
                document.querySelector('#existsError').innerHTML = "";
            }
        }

        // add the new channel name
        const channelWrap = document.createElement('div');
        channelWrap.className = 'channelWrap';
        const channel = document.createElement('a');
        channel.innerHTML = name;
        channel.href = "/chatroom/" + name;

        // adding the anchor to the div
        channelWrap.append(channel)
        document.querySelector('#channelList').append(channelWrap)
    }
    request.send(data);
})

function requestChannels() {
    const request = new XMLHttpRequest();
    request.open('GET', '/channels')
    request.onload = () => {
        // get the response data (channel names), and for each one create
        // an anchor with an href to the chatroom
        const data = JSON.parse(request.responseText);
        const dataKeys = Object.keys(data);
        for (let i = 0; i < dataKeys.length; i++){
            // creating a div for each channel name
            const channelWrap = document.createElement('div');
            channelWrap.className = 'channelWrap';
            const channel = document.createElement('a');
            channel.innerHTML = dataKeys[i];
            // make the href point to the chatroom path with the name appeneded at the end
            channel.href = "/chatroom/" + dataKeys[i];

            // adding the anchor to the div
            channelWrap.append(channel)
            document.querySelector('#channelList').append(channelWrap);
        }

    };
    request.send();
}


// once user has started typing, set the placeholder of the channelName field to be regular
document.querySelector('#channelName').addEventListener('keydown', () => {
    document.querySelector('#channelName').placeholder = "channel name";
});



// adding click button on enter 

document.querySelector('#channelName').addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        document.querySelector('#createBtn').click();
    }
});