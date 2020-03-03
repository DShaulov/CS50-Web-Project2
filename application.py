import os
import requests

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
    print(channels)
    return jsonify(channels)


@app.route("/chatroom/<string:name>")
def chatroom(name):
    messages = channels[name]
    print(messages)
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
    
    # create the message in the form of a dictionary with the key being the name of user of created it
    message = {userName: messageText}

    # append the message into the list of messages stored in the dictionary
    messageList = channels[channelName]
    messageList.append(message)
    print(channels)

    return ('', 204)

@socketio.on('message submitted')
def messageSubmitted():
    emit('updateMessages')
    

if __name__ == "__main__":
    socketio.run(app)
