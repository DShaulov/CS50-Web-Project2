import os
import requests
import datetime

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

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

@socketio.on('message submitted')
def messageSubmitted(channelName):
    emit('updateMessages', {'channelName': channelName}, broadcast=True)


@socketio.on('channelCreated')
def channelCreated():
    emit('updateChannels', broadcast=True)

@socketio.on('disconnected')
def disconnected(data):
    print("eyyy got the disconnected message!")
    print("The user who disconnected is: " + data['userName'])
    emit('userDisconnected', broadcast=True)
    

if __name__ == "__main__":
    socketio.run(app)
