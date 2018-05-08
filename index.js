// LOGIN

let renderMain = function() {

  cable = ActionCable.createConsumer('ws://localhost:3000/cable')
  // cable = ActionCable.createConsumer('ws://192.168.3.8:3000/cable')

  var channel = cable.subscriptions.create({channel:
       "ChatChannel", room: "new_room"},
      {
          connected: function() {
              console.log("connected");
          },
          disconnected: function() {
              console.log("disconnected");
          },
          received: function(data) {
              console.log('received');
              console.log(data);
              let newMessage = document.createElement('p')
              newMessage.innerText = `${data.message}`
              document.querySelector('body').appendChild(newMessage)
          }
      }
  );


  mainContentContainer.innerHTML = `
    <form id=message-form>
      Message:<br>
      <input type="text" id=message-box name="message"><br>
      <input id="submit" type="submit" value="Submit">
    </form>`

  const messageForm = document.querySelector('#message-form')
  const messageBox = messageForm.querySelector('#message-box')

  messageForm.addEventListener('submit', (e) => {

    e.preventDefault()
    channel.send({to: 'chat_new_room', message: messageBox.value })
  });
}

let renderLogin = function() {
  mainContentContainer.innerHTML = `
    <form id=loginForm>
      Username:<br>
      <input type="text" id=userName name="username"><br>
      Password:<br>
      <input type="password" id=password name="password"><br>
      <input id="submit" type="submit" value="Submit">
    </form>`
  loginForm.onsubmit = (e) => {
    e.preventDefault()

    const postData = {}
    postData.name = userName.value
    postData.password = password.value

    fetch('http://localhost:3000/authenticate', {
      method: 'POST',
      body: JSON.stringify(postData),
      headers: {
        mode:'no-cors',
        'Accept': 'application/json',
        "Content-Type" : 'application/json'
      }
    }).then((res) => res.json()).then((json) => {
      console.log(json)
      let token = json.auth_token
      get_user(token, postData.name)
    })

  }
  // renderMain()
}



let is_loggedin = function() {
  document.cookie ? renderMain() : renderLogin()
}

is_loggedin()



function get_user(token, name) {
fetch('http://localhost:3000/api/v1/users/' + name, {
  method: 'GET',
  headers: {
    Authorization: `token ${token}`,
    mode: 'no-cors',
    'Accept': 'application/json',
    'content-type': 'application/json'
  }
}).then(res => (res.json())).then(json => {
  console.log(json)
  var now = new Date();
now.setTime(now.getTime() + 1 * 36000 * 1000);
document.cookie = `user_id=${json.id}; expires=` + now.toUTCString() + "; path=/";




renderMain()
})
}
