import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/create", methods=['POST'])
def create():
    name = request.form.get('name')
    channels.append(name)
    # checking that names are added
    print(channels)
    return ""

@app.route("/channels", methods=["GET"])
def get_channels():
    print(jsonify(channels))
    return jsonify(channels)

if __name__ == "__main__":
    socketio.run(app)
