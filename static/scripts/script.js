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
        
    }
    request.send(data);
})

function requestChannels() {
    console.log('im in the func')
    const request = new XMLHttpRequest();
    request.open('GET', '/channels')
    request.onload = () => {
        console.log("The data has been recieved")
        const data = JSON.parse(request.responseText);
        console.log(data)
        for (let i = 0; i < data.length; i++){
            const channel = document.createElement('p');
            channel.innerHTML = data[i];
            document.querySelector('#channelList').append(channel);
        }

    };
    request.send();
}