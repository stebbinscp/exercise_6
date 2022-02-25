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
  console.log("clicked");
  console.log(document.getElementById("username").value);
  console.log(document.getElementById('password').value);
  // get username and passcode

  fetch('/login?'+ new URLSearchParams({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }))
    // send username and passcode to backend
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (!"authkey" in Object.keys(data)) {
        console.log("failed");
        // if we do not get an authkey, we have failed
      } else {
        myStorage = window.localStorage;
        myStorage.setItem("authkey", authkey);
        // save authkey
        console.log("successful");
        document.getElementById("auth").style.display = "none";
        // remove auth from view
        document.getElementById("chat_index").style.display = "block";
        // displace the chat index

        fetch('/chat_list?'+ new URLSearchParams({
          authkey: document.getElementById('authkey').value
          // send authkey to get the username's chats
        }))
        .then(response => response.json())
        .then(data => {
          console.log(data);
          console.log("successful");
          const chats = datum.chats;
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
  console.log(document.getElementById("username").value);
  console.log(document.getElementById('password').value);

  fetch('/signup?'+ new URLSearchParams({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    }))
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (!"authkey" in Object.keys(data)) {
        console.log("failed");
      } else {
        myStorage = window.localStorage;
        myStorage.setItem("authkey", data.authkey);
        console.log("successful");
        document.getElementById("auth").style.display = "none";
        document.getElementById("chat_index").style.display = "block";
        
        myStorage = window.localStorage;
        authkey = myStorage.getItem('authkey');
        fetch('/chat_list?'+ new URLSearchParams({
          authkey: authkey
        }))
        .then(response => response.json())
        .then(data => {
          console.log(data);
          console.log("successful");
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
  console.log("clicked create chat");
  myStorage = window.localStorage;
  authkey = myStorage.getItem('authkey');
  fetch('/create_chat?'+ new URLSearchParams({
    authkey: authkey
  }))
  .then(response => response.json())
  .then(data => {
    console.log(data);
    console.log("successful");
    const chat_id = data.chat_id;
    document.getElementById("auth").style.display = "none";
    document.getElementById("chat_index").style.display = "none";
    // auto put the user at the chat page
    console.log(data.magic_passphrase);
    document.getElementById('invite_link').innerHTML = "chat/"+data.magic_passphrase;
      // magic passphrase to the link area
    window.history.pushState('', 'Chat '+chat_id, '/chat/'+chat_id);
    getMessages();
  })
}

/* For chat.html */

// TODO: Fetch the list of existing chat messages.
// POST to the API when the user posts a new message.
// Automatically poll for new messages on a regular interval.
function postMessage() {
  myStorage = window.localStorage;
  authkey = myStorage.getItem('authkey');
  const chat_id = window.location.href.split("/")[3];
  fetch('/chat/'+chat_id+"?"+ new URLSearchParams({
    authkey: authkey
  }), {method: 'POST'})
  .then(response => response.json())
  .then(data => {
    console.log(data);
    console.log("successful");
  })
  return;
}

function getMessages() {
  myStorage = window.localStorage;
  if ('authkey' in Object.keys(myStorage)) {
    authkey = myStorage.getItem('authkey');
    const chat_id = window.location.href.split("/")[3];
    fetch('/chat/'+chat_id+"?"+ new URLSearchParams({
      authkey: authkey
    }))
    .then(response => response.json())
    .then(data => {
      console.log(data);
      console.log("successful");
      document.getElementById("auth").style.display = "none";
      document.getElementById("chat_index").style.display = "none";
      document.getElementById("chat_section").style.display = "block";
      window.history.pushState('', 'Chat '+chat_id, '/chat/'+chat_id);
    })
  } else {
    console.log('interval');
  }
  return;
}

function startMessagePolling() {
  // check auth here too!
  // setInterval(getMessages(), 1000)
  setInterval(console.log('interval'), 5000);
  return;
}
