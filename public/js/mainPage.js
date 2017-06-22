const mainRoom = (function () {
  //http://192.168.219.166:3000

  const socket = io.connect('/', { secure: true, transports: ['websocket'] });
  let gloChatInWrap = document.getElementById('globalChatInnerWrapper');
  const gloalChat = document.getElementById('globalChat');

  const star = document.getElementById('star1');
  const star1 = document.getElementById('star2');
  const clicked = document.getElementById('clicked');
  const beepSound = document.getElementById('counter');
  beepSound.volume = '0.5';
  clicked.volume = '0.8';
  let multiButtonChk = true;
  let matchMenuEle;
  let player1 = false;
  let player2 = false;
  let ready1;
  let ready2;
  let gamechk1 = false;
  let gamechk2 = false;


  socket.emit('enter lobby');


  /**
   * [broadcast message]
   */
  socket.on('broadcast message', function (data, username) {
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

  function btnEvent() {
    gloChatInWrap = document.getElementById('globalChatInnerWrapper');
    let sendBtn = document.getElementById('globalSendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', function (e) {
        // e.preventDefault();
        let message = document.getElementById('globalChatVal').value;
        if (message) socket.emit('newMessage', message);
        document.getElementById('globalChatVal').value = '';
      });
    }
    let sendInput = document.getElementById('globalChatVal');
    if (sendInput) {
      sendInput.addEventListener('keypress', function (e) {
        if (event.key === 'Enter') {
          let message = document.getElementById('globalChatVal').value;
          if (message) socket.emit('newMessage', message);
          document.getElementById('globalChatVal').value = '';
        }
      });
    }
  }

  btnEvent();





  socket.on('join room', (roomNum) => {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.innerHTML = '';
    const roomLayout = document.getElementById('roomLayout').innerHTML;
    mainContainer.innerHTML = roomLayout;
    btnEvent();
    socket.emit('join gameRoom', roomNum);
  });

  socket.on('Matchroom display', (host, opp) => {
    if (host.socketId === socket.id) player1 = true;
    if (opp.socketId === socket.id) player2 = true;
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
    player1Img.src = host.picture;
    player1InfoWrap.appendChild(player1Img);

    const player1NameDiv = document.createElement('div');
    player1NameDiv.className = 'playersName';
    player1NameDiv.innerHTML = host.name;
    player1InfoWrap.appendChild(player1NameDiv);



    const player2InfoDiv = document.createElement('div');
    player2InfoDiv.id = 'player2InfoWrap';
    player2InfoDiv.className = 'playersInfo';
    player2Info.appendChild(player2InfoDiv);

    const player2InfoWrap = document.getElementById('player2InfoWrap');

    const player2Img = document.createElement('img');
    player2Img.className = 'playersImg';
    player2Img.src = opp.picture;
    player2InfoWrap.appendChild(player2Img);

    const player2NameDiv = document.createElement('div');
    player2NameDiv.className = 'playersName';
    player2NameDiv.innerHTML = opp.name;
    player2InfoWrap.appendChild(player2NameDiv);


    ready1 = document.getElementById('player1ReadyBtn');
    ready2 = document.getElementById('player2ReadyBtn');

    if (ready1) {
      if (player1) {
        ready1.addEventListener('click', (e) => {
          gamechk1 = true;
          star.play();
          ready1.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
          ready1.style.paddingTop = '45px';
          ready1.innerHTML = 'GAME<br>READY';
          socket.emit('game readyBtn', 'player1', opp, host);
        });
      }
      if (player2) {
        ready2.addEventListener('click', (e) => {
          gamechk2 = true;
          star.play();
          ready2.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
          ready2.style.paddingTop = '45px';
          ready2.innerHTML = 'GAME<br>READY';
          socket.emit('game readyBtn', 'player2', host, opp);
        });
      }
    }

    const exitBtn = document.getElementById('exitBtn');
    exitBtn.addEventListener('click', (e) => {
      clicked.play();
      socket.emit('exit btn', host, opp, '/');
    });

  });

  socket.on('readyBtn', (from, to, host) => {
    if (from === 'player1' && player2 === true) {
      gamechk1 = true;
      star.play();
      ready1.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      ready1.style.paddingTop = '45px';
      ready1.innerHTML = 'GAME<br>READY';
      if (gamechk1 === true && gamechk2 === true) socket.emit('ready checker', host, to);
    }
    if (from === 'player2' && player1 === true) {
      gamechk2 = true;
      star1.play();
      ready2.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      ready2.style.paddingTop = '45px';
      ready2.innerHTML = 'GAME<br>READY';
      if (gamechk1 === true && gamechk2 === true) socket.emit('ready checker', host, to);
    }
  });




  socket.on('inviteRoom', function (roomNum, host, users) {
    const inviteWindowDiv = document.createElement('div');
    inviteWindowDiv.id = 'inviteWindow';
    inviteWindowDiv.innerHTML = "<div class='col-xs-12'>You've got a<br>Match Invitation</div>";
    inviteWindowDiv.innerHTML += "<div class='col-xs-6' id='inviteBtnC'><p>CONFIRM</p></div>";
    inviteWindowDiv.innerHTML += "<div class='col-xs-6' id='inviteBtnD'><p>DECLINE</p></div>";
    gloChatInWrap.appendChild(inviteWindowDiv);
    beepSound.play(); // ding dong??

    multiPlayer.removeEventListener('click', multiBtnEvent);

    document.getElementById('inviteBtnC').addEventListener('click', (e) => {
      let player1;
      let player2;
      clicked.play();
      const mainContainer = document.getElementById('mainContainer');
      mainContainer.innerHTML = '';
      const roomLayout = document.getElementById('roomLayout').innerHTML;
      mainContainer.innerHTML = roomLayout;
      btnEvent();
      socket.emit('invitation confirmed', roomNum, host);
    });

    const declineBtn = document.getElementById('inviteBtnD');
    declineBtn.addEventListener('click', (e) => {
      const inviteWindow = document.getElementById('inviteWindow');
      clicked.play();
      gloChatInWrap.removeChild(inviteWindow);
      if (multiPlayer) {
        multiPlayer.addEventListener('click', multiBtnEvent);
      }
      socket.emit('invitation declined', host);
    });

    // after 10 sec, automatically decline the invitation
    setTimeout(() => {
      if (document.getElementById('inviteBtnD')) declineBtn.click();
    }, 10000);
  });

  socket.on('exit room', (path) => {
    let msg = document.createElement('div');
    msg.innerHTML = 'Exit buttom pressed.';
    msg.className = 'errorText';
    gloChatInWrap.appendChild(msg);
    gloChatInWrap.scrollTop = 1000;
    setTimeout(() => {
      location.href = path;
    }, 1500);
  });




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
            clicked.play();
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
      clicked.play();
      socket.emit('singleplay starter');
    });
  }


  const singlePlayer = document.getElementById('singlePlay');
  if (singlePlayer) {
    singlePlayer.addEventListener('click', (e) => {
      clicked.play();
      socket.emit('singleplay starter');
    });
  }

  const multiPlayer = document.getElementById('multiPlay');

  function multiBtnEvent(e) {
    clicked.play();
    matchMenuSwap(multiButtonChk);
    multiButtonChk = !multiButtonChk;
  }


  if (multiPlayer) {
    multiPlayer.addEventListener('click', multiBtnEvent);
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
      clicked.play();
      console.log('1VS1 mode on');
      vsModeEle.style.backgroundColor = 'rgba(180, 180, 180, 0.53)';
      coopModeEle.style.backgroundColor = 'rgba(255, 255, 255, 0)';
      document.getElementById('descriptMode').style.display = 'none';
      document.getElementById('descriptUser').style.display = 'block';

    });
    coopModeEle.addEventListener('click', (e) => {
      clicked.play();
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

  socket.on('multi start', () => {
    setTimeout(() => {
      let msg = document.createElement('div');
      msg.innerHTML = 'Game Start .................. 3';
      msg.className = 'startText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
      beepSound.play();
    }, 1000);
    setTimeout(() => {
      let msg = document.createElement('div');
      msg.innerHTML = 'Game Start ............ 2';
      msg.className = 'startText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
      beepSound.play();
    }, 2000);
    setTimeout(() => {
      let msg = document.createElement('div');
      msg.innerHTML = 'Game Start ...... 1';
      msg.className = 'startText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
      beepSound.play();
    }, 3000);
    setTimeout(() => {
      let msg = document.createElement('div');
      msg.innerHTML = 'Game Start ...';
      msg.className = 'startText';
      gloChatInWrap.appendChild(msg);
      gloChatInWrap.scrollTop = 1000;
      beepSound.play();
    }, 4000);
    setTimeout(() => {
      const player = player1 ? 'player1' : 'player2';
      socket.emit('multiplay starter', player);
    }, 5000);
  });

  gameStart(socket);
  // scoreSockets(socket);
  // gameOverAndResult(socket);

  return {
    socket: socket
  }

}());
