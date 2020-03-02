import os

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
    return "The name is {}".format(name)


@app.route("/postMessage")
def postMessage():
    return ""

if __name__ == "__main__":
    socketio.run(app)
