import os
import requests
import datetime

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# stores the channels created and the current users in each of them
participants = {}

# stores the channels created and the messages associated with them
channels = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create", methods=['POST'])
def create():
    name = request.form.get('name')
    
    # check that channel doesnt already exist
    for key in channels:
        if key == name:
            return "error"

    # add name as key to dictionary, with the value being an empty list
    channels[name] = []

    # add name as key to participants
    participants[name] = []
    return ""

@app.route("/channels", methods=["GET"])
def get_channels():
    return jsonify(channels)


@app.route("/chatroom/<string:name>")
def chatroom(name):
    messages = channels[name]
    channelName = {"channelName": name}
    response = []
    response.append(messages)
    response.append(channelName)
    return jsonify(response)


@app.route("/postMessage", methods=["POST"])
def postMessage():
    messageText = request.form.get('messageType')
    channelName = request.form.get('posterChannelName')
    userName = request.form.get('posterName')

    # create a timestamp
    now = datetime.datetime.now()
    timeStamp = str(now.hour) + ":" 
    if len(str(now.minute)) == 1:
        timeStamp = timeStamp + "0" + str(now.minute)
    else:
        timeStamp = timeStamp + str(now.minute)
    
    # create the message in the form of a dictionary with the key being the name of user of created it
    message = {userName: messageText, 'timeStamp': timeStamp}

    # get the the messages associated with the channel from the dictionary
    messageList = channels[channelName]

    # if there are 100 messages, delete the first
    if len(messageList) == 100:
        del messageList[0]

    # append the message into the list of messages stored in the dictionary
    messageList.append(message)
    return ('', 204)


@app.route('/getParticipants', methods=['POST'])
def getParticipants():
    return jsonify(participants[request.form.get('channel')])

@socketio.on('message submitted')
def messageSubmitted(channelName):
    emit('updateMessages', {'channelName': channelName}, broadcast=True)


@socketio.on('channelCreated')
def channelCreated():
    emit('updateChannels', broadcast=True)

@socketio.on('disconnected')
def disconnected(data):
    # remove the user that disconnected from the participants array
    participants[data['channelLeft']].remove(data['userName'])

    emit('userDisconnected',{'channelLeft': data['channelLeft']}, broadcast=True)
    
@socketio.on('user entered')
def userEntry(data):
    # remove the user from any other channels
    for key in participants:
        if  data["userName"] in participants[key]:
            participants[key].remove(data["userName"])

    users = participants[data['channelName']]
    if data['userName'] not in users:
        users.append(data['userName'])

    emit('userEntered', {'userName': data['userName'], 'channelName': data['channelName'],
         'previousChannel': data['previousChannel']},broadcast=True)

if __name__ == "__main__":
    socketio.run(app)
