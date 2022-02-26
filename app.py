from crypt import methods
from sre_constants import MAGIC
import string
import random
from datetime import datetime
from flask import Flask, render_template, request
from functools import wraps

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

### Global data ###

## User dict of username and password combination
USERS = {}

# chat dict with keys magic_passphrase, authorized (usernames), 
# messages => list of dict username, message
CHATS = {}

# dict of the form magic_passphrase: real chat id
MAGIC_CHATS = {}
CHATS_MAGIC = {}

# dict of the form authkey: username to be able to reconstruct the user who visits
AUTHKEY_USER = {}

@app.route('/')
def index_html():
    return render_template('/index.html')   

@app.route('/signup')
def signup():
    username = request.args['username']
    password = request.args['password']
    # get username and passcode
    if username in USERS.keys():
        return {"message": "user already exists"}
        # enforce uniqueness
    else:
        USERS[username] = password
        # save the username and passcode combo
        authkey = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
        AUTHKEY_USER[authkey] = username
        print(USERS, AUTHKEY_USER)
        # save the authkey to the username 
        # return authkey for future requests
        return {"authkey": authkey}

@app.route('/login')
def login():
    username = request.args['username']
    password = request.args['password']
    if username not in USERS.keys():
        return {"message": "user does not exist"}
    else:
        if USERS[username] != password:
            return {"message": "password incorrect"}
        else:
            # if user and password match
            authkey = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
            AUTHKEY_USER[authkey] = username
            # save authkey to username and return
            print(USERS, AUTHKEY_USER)
            return {"authkey": authkey}
        
@app.route('/chat_list')
def get_chat_list():
    authkey = request.args['authkey']
    print("authkey and users")
    print(USERS, AUTHKEY_USER)
    print("chats")
    print(CHATS)
    return_chats = []
    if authkey == "undefined":
        return {"message": "not a chats page"}
    if len(CHATS) > 0:
        for chat in CHATS:
            # if the username associated with the authkey is in the CHATS chat authorized
            if AUTHKEY_USER[authkey] in CHATS[chat]["authorized"]:
                # add to the chat list for the user
                return_chats.append(chat)
                # return all chats for that user
    return {"chats": return_chats}

@app.route('/create_chat')
def create_chat():
    print("auth and users")
    print(USERS)
    print(AUTHKEY_USER)
    if "authkey" in request.args:
        # ensure we have a key and an authorized user
        authkey = request.args['authkey']
        username = AUTHKEY_USER[authkey]
        print(username, authkey)
    else:
        return {"message": "error"}
    chat_id = str(len(CHATS) + 1)
    # generate new chat id and passphrase
    magic_passphrase = ''.join(random.choices(string.ascii_lowercase + string.digits, k=15))
    CHATS[chat_id] = {}
    # init authorized users
    CHATS[chat_id]["authorized"] = [username]
    CHATS[chat_id]["messages"] = []
    # store magic passphrase
    CHATS[chat_id]['magic'] = magic_passphrase
    MAGIC_CHATS[magic_passphrase] = chat_id
    CHATS_MAGIC[chat_id] = [magic_passphrase]
    print(USERS, AUTHKEY_USER)
    print(CHATS, MAGIC_CHATS)
    return {"chat_id": chat_id, "magic_passphrase": magic_passphrase}

@app.route('/chat/<chat_id>/messages', methods=['GET'])
def get_chat_messages(chat_id):
    if "authkey" in request.args:
        # ensure we have a key and an authorized user
        authkey = request.args['authkey']
        username = AUTHKEY_USER[authkey]
        print(username, authkey)
    else: return {'message': 'no authkey provided'}
    if authkey == "undefined":
        return {"message": "not a chats page"}
    if chat_id in CHATS.keys():
        CHATS[chat_id]['authorized'].append(username)
        return {
            "messages": CHATS[chat_id]['messages'],
            "chat_id": chat_id,
            'magic_passphrase': CHATS_MAGIC[chat_id]
            }
    elif chat_id in MAGIC_CHATS.keys():
        chat_to_save = CHATS_MAGIC[chat_id]
        if username not in CHATS[chat_to_save]['authorized']:
            CHATS[chat_to_save]['authorized'].append(username)
        # magic passcode
        # get the original chat with MAGIC_CHATS[chat_id] and authorize user
        # pass the chat id back and the magic pass
        return {
            "messages": CHATS[MAGIC_CHATS[chat_id]],
            "chat_id": MAGIC_CHATS[chat_id],
            'magic_passphrase': chat_id
            }

@app.route('/chat/<chat_id>', methods=['GET'])
def get_chat(chat_id):
    if chat_id in CHATS.keys():
        return render_template('/index.html')  
    elif chat_id in MAGIC_CHATS.keys():
        # magic passcode
        # get the original chat with MAGIC_CHATS[chat_id] and authorize user
        # pass the chat id back and the magic pass
        return render_template('/index.html')  
        # how do I get the user in here as authorized?
        # get messages I think @TODO

@app.route('/chat/<chat_id>', methods=['POST'])
def post_chat(chat_id):
    print("in post chat")
    print(chat_id)
    print(CHATS)
    if "authkey" in request.args:
        authkey = request.args['authkey']
        username = AUTHKEY_USER[authkey]
        message = request.args['message']
    else:
        return {"message": "error"}

    if username in CHATS[chat_id]["authorized"]:
        print(username)
        CHATS[chat_id]["messages"].append(
            {
                "username": username,
                "message": message
            }
        )
    return {"message": "successful"}

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)