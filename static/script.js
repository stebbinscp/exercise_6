/* For index.html */

// TODO: If a user clicks to create a chat, create an auth key for them
// and save it. Redirect the user to /chat/<chat_id>

// function checkAuth() {
//   const myStorage = window.localStorage;
//   if ("authkey" in Object.keys(myStorage)) {
    // hit backend to check if authkey is valid
    // if not valid
      // clear storage authkey
      // direct to login
    // if it is
      // hit the backend for the chats registered to the user
      // render a list of them
  // } else {
    // request username and password
    // return authkey
    // render index of chats
  // }
  // fetch(currentUrl+'/check_creds?'+ new URLSearchParams({
  //   username: myStorage.getItem('username'),
  //   authkey: myStorage.getItem('authkey')
  // }))
  // .then(response => response.json())
  // .then(data => {
  //   console.log(data);
  //   if (data.message !== "works") {
  //     window.location.replace("/");
  //   }
  // })
// }

function login() {
  // get username and passcode
  fetch('/login?'+ new URLSearchParams({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }))
    // send username and passcode to backend
    .then(response => response.json())
    .then(data => {
      if (!Object.keys(data).includes('authkey')) {
        // if we do not get an authkey, we have failed
      } else {
        myStorage = window.localStorage;
        myStorage.setItem("authkey", data.authkey);
        // save authkey
        document.getElementById("auth").style.display = "none";
        // remove auth from view
        document.getElementById("chat_index").style.display = "block";
        // displace the chat index

        fetch('/chat_list?'+ new URLSearchParams({
          authkey: window.localStorage.getItem('authkey')
          // send authkey to get the username's chats
        }))
        .then(response => response.json())
        .then(data => {
          const chats = data.chats;
          const chat_index = document.getElementById("chat_index");
          // map each chat
          chats.map((chat) => {
            var text = document.createTextNode("chat id: "+chat);
            text.addEventListener("onClick", getMessages());
            // onclick event added to the text node which cal
            chat_index.appendChild(text);
          })
        })
      }
    })
}

function signup() {
  fetch('/signup?'+ new URLSearchParams({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }))
    .then(response => response.json())
    .then(data => {
      if (!Object.keys(data).includes("authkey")) {
        console.log("failed");
      } else {
        myStorage = window.localStorage;
        myStorage.setItem("authkey", data.authkey);
        document.getElementById("auth").style.display = "none";
        document.getElementById("chat_index").style.display = "block";
        
        myStorage = window.localStorage;
        authkey = myStorage.getItem('authkey');
        fetch('/chat_list?'+ new URLSearchParams({
          authkey: authkey
        }))
        .then(response => response.json())
        .then(data => {
          if ("chats" in Object.keys(data)) {
            const chats = data.chats;
            const chat_index = document.getElementById("chat_index");
            chats.map((chat) => {
              var text = document.createTextNode("chat id: "+chat);
              text.addEventListener("onClick", getMessages())
              chat_index.appendChild(text);
            })
          } else {
            var text = document.createTextNode("Oops! No available chats!");
            chat_index.appendChild(text);
          }
          
          document.getElementById("auth").style.display = "none";
          document.getElementById("chat_index").style.display = "block";
        })
      }
    })
}

function createChat() {
  myStorage = window.localStorage;
  authkey = myStorage.getItem('authkey');
  fetch('/create_chat?'+ new URLSearchParams({
    authkey: authkey
  }))
  .then(response => response.json())
  .then(data => {
    const chat_id = data.chat_id;
    document.getElementById("auth").style.display = "none";
    document.getElementById("chat_index").style.display = "none";
    // auto put the user at the chat page
    document.getElementById('invite_link').innerHTML = "chat/"+data.magic_passphrase;
      // magic passphrase to the link area
    window.history.pushState('', 'Chat '+chat_id, '/chat/'+chat_id);
    document.getElementById("chat_section").style.display = "block";
    getMessages();
  })
}

/* For chat.html */

function postMessage() {
  myStorage = window.localStorage;
  authkey = myStorage.getItem('authkey');
  const chat_id = window.location.href.split("/")[4];
  fetch(chat_id+"?"+ new URLSearchParams({
    authkey: authkey,
    message: document.getElementById("comment").value
  }), {method: 'POST'})
  return;
}

function getMessages() {
  myStorage = window.localStorage;
  if (Object.keys(myStorage).includes('authkey')) {
    authkey = myStorage.getItem('authkey');
    const chat_id = window.location.href.split("/")[4].replace("?","").replace("#", "");
    fetch('/chat/'+chat_id+"/messages?"+ new URLSearchParams({
      authkey: authkey
    }))
    .then(response => response.json())
    .then(data => {
      console.log(data);
      document.getElementById("auth").style.display = "none";
      document.getElementById("chat_index").style.display = "none";
      document.getElementById("chat_section").style.display = "block";
      document.getElementById("invite_link").innerHTML = "127.0.0.1:5000/chat/"+data.magic_passphrase;
      window.history.pushState('', 'Chat '+data.chat_id, '/chat/'+data.chat_id);
      const messageHolder = document.getElementById("messages");
        while (messageHolder.firstChild) {
          messageHolder.removeChild(messageHolder.firstChild);
        }
        data.messages.map((message) => {
          var item = document.createElement("message");
          var commenter = document.createElement("author");
          commenter.innerText = message.username;
          var comment = document.createElement("content");
          comment.innerText = message.message;
          item.appendChild(commenter);
          item.appendChild(comment);
          messageHolder.appendChild(item);
        })
    })
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("chat_index").style.display = "none";
    document.getElementById("chat_section").style.display = "none";
    window.history.pushState('', '/');
  }
  return
}