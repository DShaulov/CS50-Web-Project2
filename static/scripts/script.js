// Checking if user already provided display name
document.addEventListener('DOMContentLoaded', () => {
    // checking how it looks when local storage is cleared
    //! localStorage.clear();
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


///////////////////////////////////////////////////////////////////////////////////////////////

function addDisplayName() {
    let name = document.querySelector("#displayName").value;
    localStorage.setItem("displayName", name);
}


///////////////////////////////////////////////////////////////////////////////////////////////
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
            if (document.querySelector('#existsError') != null) {
                document.querySelector('#existsError').innerHTML = "";
            }
        }

        // add the new channel name
        const channelWrap = document.createElement('div');
        channelWrap.className = 'channelWrap';
        const channel = document.createElement('button');
        channel.innerHTML = name;
        channel.className = "form-control btn btn-primary";

        // adding an event listener to each button!

        channel.addEventListener('click',() => {
            // on click, execute the funtion that goes to the chatroom route

            console.log('it tickles :3')
            getChannel(name);
        } );

        // adding the anchor to the div
        channelWrap.append(channel)
        document.querySelector('#channelList').append(channelWrap)
    }
    request.send(data);
})


///////////////////////////////////////////////////////////////////////////////////////////
// gets the list of channels from the flask server, and creates a button for each one in the sidebar

function requestChannels() {
    const request = new XMLHttpRequest();
    request.open('GET', '/channels')
    request.onload = () => {
        // get the response data (channel names), and for each one create
        // an anchor with an href to the chatroom
        const data = JSON.parse(request.responseText);
        const dataKeys = Object.keys(data);
        for (let i = 0; i < dataKeys.length; i++){
            const channelWrap = document.createElement('div');
            channelWrap.className = 'channelWrap';
            const channel = document.createElement('button');
            channel.innerHTML = dataKeys[i];
            channel.className = "form-control btn btn-primary";
    
            // adding an event listener to each button!
    
            channel.addEventListener('click',() => {
                // on click, execute the funtion that goes to the chatroom route
    
                getChannel(dataKeys[i]);
            } );
    

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



// making sure its not possbile to submit empty message

function checkEmptyMessage(){
    if (document.querySelector('#messageType').value == ''){
        document.querySelector('#messageType').placeholder = "*cant send empty message";
        return false;
    }
    else {
        document.querySelector('#messageType').placeholder = "message";
    }
}


////////////////////////////////////////////////////////////////////////////////////
// a function that is getting the channel name and messages

function getChannel(name){
    const request = new XMLHttpRequest();
    request.open('GET', "/chatroom/" + name);
    request.onload = () => {
        const response = JSON.parse(request.responseText);
        console.log(response[0])
        // set the title to be the channel name

        document.querySelector('#channelNameHeader').innerHTML = response[1].channelName;

        // set the posterChannelName input field to be the channel name

        document.querySelector('#posterChannelName').value = response[1].channelName;

        // set the posterName input  field to be the name of the current user

        document.querySelector('#posterName').value = localStorage.getItem('displayName');

        // add the messages associated with the channel to postdiv
        for (let i = 0; i < response[0].length; i++){
            const textWrapper = document.createElement('div');
            const text = document.createElement('p');
        }
    };
    request.send();
}


// an event listener to clear the message input field once a message has been submitted
