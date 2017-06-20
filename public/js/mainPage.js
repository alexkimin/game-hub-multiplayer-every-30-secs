(function () {
  //http://192.168.219.166:3000

  const socket = io.connect('/', { secure: true, transports: ['websocket'] });
  const gloChatInWrap = document.getElementById('globalChatInnerWrapper');
  const gloalChat = document.getElementById('globalChat');
  let multiButtonChk = true;
  let matchMenuEle;

  socket.emit('join room', location.href);
  socket.emit('join gameRoom', location.href);

  socket.on('Matchroom display', (data) => {
    // player1Info
    const player1Info = document.getElementById('player1Info');
    const player2Info = document.getElementById('player2Info');

    const player1InfoDiv = document.createElement('div');
    player1InfoDiv.id = 'player1InfoWrap';
    player1InfoDiv.className = 'playersInfo';
    player1Info.appendChild(player1InfoDiv);

    const player1InfoWrap = document.getElementById('player1InfoWrap');

    const player1Img = document.createElement('img');
    player1Img.className = 'playersImg';
    player1Img.src = data.player1.picture;
    player1InfoWrap.appendChild(player1Img);

    const player1NameDiv = document.createElement('div');
    player1NameDiv.className = 'playersName';
    player1NameDiv.innerHTML = data.player1.name;
    player1InfoWrap.appendChild(player1NameDiv);



    const player2InfoDiv = document.createElement('div');
    player2InfoDiv.id = 'player2InfoWrap';
    player2InfoDiv.className = 'playersInfo';
    player2Info.appendChild(player2InfoDiv);

    const player2InfoWrap = document.getElementById('player2InfoWrap');

    const player2Img = document.createElement('img');
    player2Img.className = 'playersImg';
    player2Img.src = data.player2.picture;
    player2InfoWrap.appendChild(player2Img);

    const player2NameDiv = document.createElement('div');
    player2NameDiv.className = 'playersName';
    player2NameDiv.innerHTML = data.player1.name;
    player2InfoWrap.appendChild(player2NameDiv);

  });

  socket.on('inviteRoom', function (roomNum, host, users) {
    const inviteWindowDiv = document.createElement('div');
    inviteWindowDiv.id = 'inviteWindow';
    inviteWindowDiv.innerHTML = "<div class='col-xs-12'>You've got a<br>Match Invitation</div>";
    inviteWindowDiv.innerHTML += "<div class='col-xs-6' id='inviteBtnC'><p>CONFIRM</p></div>";
    inviteWindowDiv.innerHTML += "<div class='col-xs-6' id='inviteBtnD'><p>DECLINE</p></div>";
    gloChatInWrap.appendChild(inviteWindowDiv);

    document.getElementById('inviteBtnC').addEventListener('click', (e) => {
      let player1;
      let player2;
      socket.emit('invitation confirmed', roomNum, host);
      users.forEach((e) => {
        if (e.socketId === host) player1 = e;
        if (e.socketId === socket.id) player2 = e;
      })
      socket.emit('Current GameRoom', player1, player2, roomNum);
      location.href = '/room' + roomNum;
    });
    document.getElementById('inviteBtnD').addEventListener('click', (e) => {
      const inviteWindow = document.getElementById('inviteWindow');
      gloChatInWrap.removeChild(inviteWindow);
      socket.emit('invitation declined', host);
    })
  });

  socket.on('Enter Room', (roomNum) => {
    location.href = '/room' + roomNum;
  })


  /**
   * [broadcast message]
   */
  socket.on('broadcast message', function (data, username) {
    //console.log(socket.userName);
    let msg = document.createElement('div');
    msg.innerHTML = '<span class="chatTextId">' + username + '</span> :  ' + data;
    msg.className = 'chatText';
    gloChatInWrap.appendChild(msg);
    gloChatInWrap.scrollTop = 1000;
  });
  socket.on('error message', function (data) {
    //console.log(socket.userName);
    if (data === 'busy') {
      let msg = document.createElement('div');
      msg.innerHTML = 'The Player busy now, try later.';
      msg.className = 'errorText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
    }
    if (data === 'wait') {
      let msg = document.createElement('div');
      msg.innerHTML = 'Invitaion Sent.';
      msg.className = 'errorText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
    }
    if (data === 'decline') {
      let msg = document.createElement('div');
      msg.innerHTML = 'The Player declined your invitation';
      msg.className = 'errorText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
    }
    if (data === 'guest') {
      let msg = document.createElement('div');
      msg.innerHTML = 'Can not play multiplayer with guests.';
      msg.className = 'errorText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
    }
  });

  const sendBtn = document.getElementById('globalSendBtn');
  if (sendBtn) {
    sendBtn.addEventListener('click', function (e) {
      // e.preventDefault();
      let message = document.getElementById('globalChatVal').value;
      if (message) socket.emit('newMessage', message);
      document.getElementById('globalChatVal').value = '';
    });
  }
  const sendInput = document.getElementById('globalChatVal');
  if (sendInput) {
    sendInput.addEventListener('keypress', function (e) {
      if (event.key === 'Enter') {
        let message = document.getElementById('globalChatVal').value;
        if (message) socket.emit('newMessage', message);
        document.getElementById('globalChatVal').value = '';
      }
    });
  }


  /**
   * User List
   */
  const scoreBoardEle = document.getElementById('boardInnerWrapper');
  if (scoreBoardEle) {
    socket.on('update user', (users) => {
      scoreBoardEle.innerHTML = '';

      users.forEach((e) => {
        let newUserDiv = document.createElement('div');
        newUserDiv.className = 'newUser';
        newUserDiv.id = e.id;
        scoreBoardEle.appendChild(newUserDiv);
        let theNewUserDiv = document.getElementById(e.id);
        /////
        theNewUserDiv.addEventListener('click', (event) => {
          if (!multiButtonChk) {
            if (matchMenuEle) {
              gloalChat.removeChild(matchMenuEle);
              gloChatInWrap.style.display = 'block';
              charInput.style.display = 'table';
              multiButtonChk = !multiButtonChk;
            }
            socket.emit('invitation', e.id);
          }
        });

        if (e.picture) {
          let newUserPicDiv = document.createElement('img');
          newUserPicDiv.setAttribute('src', e.picture);
          theNewUserDiv.appendChild(newUserPicDiv);
        }
        let newUserNameDiv = document.createElement('span');
        newUserNameDiv.innerHTML = e.name;
        theNewUserDiv.appendChild(newUserNameDiv);
      });
    });
  }


  /**
   * game related
   */

  /**
   * guestPlay (Single Only)
   */
  const guestPlay = document.getElementById('guestPlay');
  if (guestPlay) {
    guestPlay.addEventListener('click', (e) => {
      location.href = './single';
    });
  }



  const singlePlayer = document.getElementById('singlePlay');
  if (singlePlayer) {
    singlePlayer.addEventListener('click', (e) => {
      console.log('single play!!!');
      location.href = './single'
      // need login cheker
    });
  }

  const multiPlayer = document.getElementById('multiPlay');



  if (multiPlayer) {
    multiPlayer.addEventListener('click', (e) => {
      matchMenuSwap(multiButtonChk);
      multiButtonChk = !multiButtonChk;


    });
  }

  const charInput = document.getElementsByClassName('chatInput')[0];

  function matchMenuSwap(chk) {
    if (chk) {
      gloChatInWrap.style.display = 'none';
      charInput.style.display = 'none';
      let matchMenuDiv = document.createElement('div');
      matchMenuDiv.id = 'matchMenu';
      matchMenuDiv.className = 'container';
      gloalChat.appendChild(matchMenuDiv);
      matchMenuEle = document.getElementById('matchMenu');
      marchMenu();
    } else {
      gloChatInWrap.style.display = 'block';
      charInput.style.display = 'table';
      matchMenuEle = document.getElementById('matchMenu');
      if (matchMenuEle) gloalChat.removeChild(matchMenuEle);
    }
  }
  let matchtpl = document.getElementById('matchMenuTpl')
  if (matchtpl) matchtpl = matchtpl.innerHTML;
  const matchtplDiv = document.createElement('div');
  matchtplDiv.innerHTML = matchtpl;

  function marchMenu() {
    let matchMenuEle = document.getElementById('matchMenu');
    matchMenuEle.appendChild(matchtplDiv);

    let vsModeEle = document.getElementById('vsMode');
    let coopModeEle = document.getElementById('coopMode');
    vsModeEle.addEventListener('click', (e) => {
      console.log('1VS1 mode on');
      vsModeEle.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      coopModeEle.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      document.getElementById('descriptMode').style.display = 'none';
      document.getElementById('descriptUser').style.display = 'block';

    });
    coopModeEle.addEventListener('click', (e) => {
      console.log('Coop Mode on');
      vsModeEle.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      coopModeEle.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      document.getElementById('descriptMode').style.display = 'none';
      document.getElementById('descriptUser').style.display = 'block';
    })
  }

  /**
   * Room
   */
  const ready1 = document.getElementById('player1ReadyBtn');
  const ready2 = document.getElementById('player2ReadyBtn');
  let gamechk1 = false;
  let gamechk2 = false;
  if (ready1) {
    ready1.addEventListener('click', (e) => {
      gamechk1 = true;
      ready1.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      ready1.style.paddingTop = '45px';
      ready1.innerHTML = 'GAME<br>READY';
    });
    ready2.addEventListener('click', (e) => {
      gamechk2 = true;
      ready2.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      ready2.style.paddingTop = '45px';
      ready2.innerHTML = 'GAME<br>READY';
    });
  }


}());
