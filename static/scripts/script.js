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


    


    // create a socket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        // add a function to the hidden button on the submit message form
        document.querySelector('#emitterBtn').onclick = () => {
            // pass along the channel name with the emitter
            const channelName = document.querySelector('#channelNameHeader').innerHTML;
            socket.emit('message submitted', {'channelName': channelName});
        };

        // add a function to emit a channel creation event
        document.querySelector('#emitterChannelCreated').onclick = () => {
            socket.emit('channelCreated');
        };
    })

    socket.on('disconnect', () => {
        socket.emit('disconnected')
    });

    socket.on('updateMessages', data => {
        getMessages(data['channelName']['channelName']);
    });

    socket.on('updateChannels', () => {
        requestChannels();
    });


    // once someone closes the window, disconnect the socket
    window.onbeforeunload = () => {
        socket.emit('disconnected', {"userName": localStorage.getItem('displayName')});
    }

    socket.on('userDisconnected', () => {
        console.log('ey a user was disconnected!');
    });
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
            if (document.querySelector('#existsError') != undefined) {
                document.querySelector('#existsError').innerHTML = "";
            }
        }

        // add the new channel name
        const channelWrap = document.createElement('div');
        channelWrap.className = 'channelWrap';
        const channel = document.createElement('button');
        channel.innerHTML = name;
        channel.className = "form-control btn btn-primary channelBorder";
        channel.id = "CH" + name;

        // adding an event listener to each button!

        channel.addEventListener('click',() => {
            // on click, execute the funtion that goes to the chatroom route

            getMessages(name);
        } );

        // adding the anchor to the div
        channelWrap.append(channel);
        document.querySelector('#channelList').append(channelWrap);

        // emit a signal that a new channel has been created
        document.querySelector('#emitterChannelCreated').click();
    }
    request.send(data);
})


///////////////////////////////////////////////////////////////////////////////////////////
// gets the list of channels from the flask server, and creates a button for each one in the sidebar

function requestChannels() {
    const request = new XMLHttpRequest();
    request.open('GET', '/channels')
    request.onload = () => {
        // remove the old div so as to not create duplicates
        document.querySelector('#channelList').remove();

        // create new one in order to append new channel names to
        const newDiv = document.createElement('div');
        newDiv.id = "channelList";

        // append the new div
        document.querySelector('#channelListDiv').append(newDiv);
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
            channel.id = "CH" + dataKeys[i];
    
            // adding an event listener to each button!
    
            channel.addEventListener('click',() => {
                // on click, execute the funtion that goes to the chatroom route
                // and enable message button
                document.querySelector('#messageType').disabled = "";
                document.querySelector('#messageType').placeholder = "enter message";

                // adding the name of the channel to local storage
                localStorage.setItem('channel', channel.innerHTML);
                
                getMessages(dataKeys[i]);

                // adding the name of the user who clicked to the list of people in the room
                //const newUser = document.createElement('p');
                //newUser.innerHTML = localStorage.getItem('displayName');
                //newUser.className = "announcement";
                //newUser.style = "text-align: center;";

                // if user already added, dont add him again
                //for (let i = 0; i < document.querySelector('#whosIn').childElementCount; i++) {
                   // if (document.querySelector('#whosIn').children[i]['innerText'] == localStorage.getItem('displayName')) {
                       // break;
                   // }

                   // else {
                        // if this is the last pass, append the element
                      //  if (i == document.querySelector('#whosIn').childElementCount - 1)
                       // document.querySelector('#whosIn').append(newUser);
                   // }
               // }
            } );
    

            // adding the anchor to the div
            channelWrap.append(channel)
            document.querySelector('#channelList').append(channelWrap);

        }

        // if a user has already visited a channel, go there!
        if (localStorage.getItem('channel') != null) {
            const previousChannel = "CH" + localStorage.getItem('channel');
            console.log(previousChannel)
            
            if (document.getElementById(previousChannel) != null) {
                document.getElementById(previousChannel).click();
            }
            
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
////////////////////////////////////////////////////////////////////////////////////
// a function that is getting the channel name and messages
// going the chatroom route

function getMessages(channel){
    const request = new XMLHttpRequest();
    request.open('GET', "/chatroom/" + channel);
    request.onload = () => {
        const response = JSON.parse(request.responseText);
        // set the title to be the channel name
        document.querySelector('#channelNameHeader').innerHTML = response[1].channelName;

        // if messageWrapper exists, remove it, so as to not display the same messages twice
        if (document.querySelector('#messageWrapper') != null) {
            document.querySelector('#messageWrapper').remove();
        }

        // add an aditional div wrapper so it can be easier to remove all messages
        const messageWrapper = document.createElement('div');
        messageWrapper.id = "messageWrapper";
        document.querySelector('#postsDiv').append(messageWrapper);
        // add the messages associated with the channel to postdiv
        for (let i = 0; i < response[0].length; i++){
            const textWrapper = document.createElement('div');
            const text = document.createElement('p');
            const senderName = document.createElement('p')

            text.innerHTML = (Object.values(response[0][i]))[0];
            text.className = "message";
            textWrapper.className = "textWrapper";
            
            senderName.className = "senderName";

            // if the user is the one who submitted the message, it should display his name as 'you'
            if (localStorage.getItem('displayName') == (Object.keys(response[0][i])[0])) {
                senderName.innerHTML = "You"
            }

            else {
                senderName.innerHTML = (Object.keys(response[0][i])[0]);
            }

            const lineBreak1 = document.createElement("br");
            const lineBreak2 = document.createElement("br");
            // if the message being added belongs to the current user,
            // dsiplay it on the left side of the screen
            // otherwise display it on the right
            if (localStorage.getItem('displayName') == Object.keys(response[0][i])[0]) {
                textWrapper.style = "text-align: left;";
            }
            else {
                textWrapper.style = "text-align: right;";
            }

            // create a timestamp paragraph
            const time = document.createElement('p');
            time.innerHTML = response[0][i]['timeStamp'];
            time.className = "timeStamp";


            
            textWrapper.append(senderName);
            textWrapper.append(time);
            textWrapper.append(lineBreak1);
            textWrapper.append(text);
            textWrapper.append(lineBreak2);
            document.querySelector('#messageWrapper').append(textWrapper);

            // auto-scroll to the bottom of the chat window
            document.querySelector('#chatroom').scrollTop = document.querySelector('#chatroom').scrollHeight;
        }
    };
    request.send();
}



// add an event listener to the message input field that listens on enter press
document.querySelector('#messageType').addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        document.querySelector('#submitterBtn').click();
    }
});



// posts the message the user has inputted to the flask server

function messagePost() {
    if (document.querySelector('#messageType').value == "") {
        return;
    }
    const request = new XMLHttpRequest();
    const data = new FormData();

    data.append('messageType', document.querySelector('#messageType').value);
    data.append('posterChannelName', document.querySelector('#channelNameHeader').innerHTML);
    data.append('posterName', localStorage.getItem('displayName'));

    request.open('POST', '/postMessage');
    request.onload = () => {
        document.querySelector('#emitterBtn').click();
        document.querySelector('#messageType').value = '';
    }

    request.send(data);

}