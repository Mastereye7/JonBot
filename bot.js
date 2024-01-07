const tmi = require('tmi.js');
const config = require('config');
const sql = require('mssql');
console.log(`Jon Bot Version ${require("./package").version}`)
console.log(`NODE_ENV: ${process.env['NODE_ENV']}`)

const restrictedCommands =
  [
    'commands',
    'dice',
    'randomboss',
    'spins',
    'add',
    'spend',
    'timer'
  ];
const commonCommands =
  [
    'commands',
    'dice',
    'spins'
  ]
const commandPrefix = config.get('commandPrefix');

// Define configuration options
const opts = {
  identity: {
    username: config.get('twitchConfig.username'),
    password: config.get('twitchConfig.password')
  },
  channels: config.get('twitchConfig.channels')
};

console.dir(opts.channels);

const sqlConfig = {
  user: config.get('dbConfig.user'),
  password: config.get('dbConfig.password'),
  database: config.get('dbConfig.database'),
  server: config.get('dbConfig.server'),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

// sql.connect(sqlConfig).then(pool => {
//   // Query

//   return pool.request()
//       .input('input_parameter', sql.Int, 1)
//       .query('select * from Test where Id = @input_parameter');
// }).then(result => {
//   console.dir(result);
// }).catch(err => {
//   console.log(err);
// // ... error checks
// });

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on("subscription", onSubscriptionHandler);
client.on('subgift', onGiftSubHandler);

// Connect to Twitch:
client.connect();

process.on('SIGINT', handleSignalReceived);
process.on('SIGTERM', handleSignalReceived);

/**
 * 
 * @param {NodeJS.Signals} signal 
 */
function handleSignalReceived(signal) {
  console.info(`${signal} signal received`);
  if (config.get('enableLoggingStartAndShutdown')){
    try {
      for (let i = 0; i < opts.channels.length; i++) {
        client.say(opts.channels[i], 'Shutting down');
      }
    } catch (error) {
      console.log(`Unable to send shutdown message ${error}`);
    }
  }
  process.exit();
}

// Called every time a message comes in
/**
 * Received a message. This event is fired whenever you receive a chat, action or whisper message
 * @param {string} channel 
 * @param {tmi.ChatUserstate} userState 
 * @param {string} msg 
 * @param {boolean} self 
 * @returns 
 */
function onMessageHandler(channel, userState, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  if (msg[0] !== commandPrefix) { return }
  console.log(new Date());
  const callerUserName = userState['display-name'];

  const isBroadcaster = userState.badges != null && userState.badges.broadcaster != null;
  const isModerator = userState.mod != null && userState.mod;
  const restrictedAccess = isBroadcaster || isModerator;
  console.log(`isBroadCaster ${isBroadcaster}`)
  console.log(`isModerator ${isModerator}`)
  console.dir(userState);

  const enableRemoteCommands = config.get('enableRemoteCommands');
  if (enableRemoteCommands && channel === config.get('remoteFromChannel')) channel = config.get('remoteToChannel');

  // Remove whitespace from chat message
  const message = msg.trim();
  const splitMessage = message.split(" ");
  const commandName = splitMessage[0];
  console.log(`${callerUserName} writes ${message}`);

  // If the command is known, let's execute it
  let unknownCommand = false;
  try {
    if (commandName === `${commandPrefix}commands`) {
      if (restrictedAccess) {
        client.say(channel, restrictedCommands.toString());
      } 
      else {
        client.say(channel, commonCommands.toString());
      }
    } 
    else if (commandName === `${commandPrefix}dice`) {
      const num = rollDice();
      client.say(channel, `You rolled a ${num}`);
    } 
    else if (commandName === `${commandPrefix}randomboss` && restrictedAccess) {
      randomWorldBoss(channel);
    } 
    else if (commandName === `${commandPrefix}add` && restrictedAccess) {
      const userName = splitMessage[1].replace('@', '');
      const amountToAdd = splitMessage[2];
      addWheelSpin(channel, userName, amountToAdd);
    } 
    else if (commandName === `${commandPrefix}spend` && restrictedAccess) {
      const userName = splitMessage[1].replace('@', '');
      const amountToRemove = splitMessage[2];
      removeWheelSpin(channel, userName, amountToRemove);
    } 
    else if (commandName === `${commandPrefix}spins` || commandName === `${commandPrefix}spings`) {
      let userName;
      if (restrictedAccess) {
        if (splitMessage[1] != null) {
          userName = splitMessage[1].replace('@', '');
        } else {
          userName = callerUserName;
        }
      } else {
        userName = callerUserName;
      }
      checkWheelSpins(channel, userName)
    } 
    else if (commandName === `${commandPrefix}timer` && restrictedAccess) {
      const nameOfTimer = splitMessage[1];
      const minutesToWait = splitMessage[2];
      client.say(channel, `${nameOfTimer} ${minutesToWait} min`)
      setTimeout(signalTimerEnd, minutesToWait * 1000 * 60, channel, nameOfTimer);
    }
    else {
      unknownCommand = true;
      console.log(`* Unknown command ${commandName} restrictedAccess [${restrictedAccess}]`);
    }
    if (!unknownCommand) {
      console.log(`* Executed ${commandName} command`);
    }
  }
  catch (error) {
    console.log(`Error with command ${commandName} ${error}`)
    client.say(channel, `${commandName} failed`)
  }
}

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 100;
  return Math.floor(Math.random() * sides) + 1;
}

// Function that returns a random world boss
/**
 * 
 * @param {string} channel 
 */
function randomWorldBoss(channel) {
  sql.connect(sqlConfig).then(pool => {
    // Query

    return pool.request()
      .query('select * from Bosses');
  }).then(result => {
    console.dir(result);
    const recordSet = result.recordset;
    const randomNumber = Math.floor(Math.random() * recordSet.length);
    const chosenBoss = recordSet[randomNumber];
    client.say(channel, `${chosenBoss.Id}: ${chosenBoss.BossName}`)
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

/**
 * 
 * @param {string} channel 
 * @param {string} userName 
 * @param {string} amountToAdd 
 */
function addWheelSpin(channel, userName, amountToAdd) {
  if (amountToAdd == null) amountToAdd = 1;
  const valueToAdd = amountToAdd;
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('userName', sql.NVarChar, userName)
      .input('value', sql.Int, valueToAdd)
      .query(`
        MERGE INTO WheelSpins AS target
    USING (VALUES (@userName, @value)) AS source (Username, NewValue)
    ON target.Username = source.Username
    WHEN MATCHED THEN
        UPDATE SET target.WheelSpins = target.WheelSpins + source.NewValue
    WHEN NOT MATCHED THEN
        INSERT (Username, WheelSpins) VALUES (source.Username, source.NewValue);
        `);
  }).then(result => {
    console.dir(result);
    client.say(channel, `${userName} gained spins [+${valueToAdd}]`);
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

/**
 * 
 * @param {string} target 
 * @param {string} userName 
 * @param {string} amountToRemove 
 */
function removeWheelSpin(target, userName, amountToRemove) {
  if (amountToRemove == null) amountToRemove = 1;
  const valueToRemove = amountToRemove;
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('userName', sql.NVarChar, userName)
      .input('value', sql.Int, valueToRemove)
      .query(
        `MERGE INTO WheelSpins AS target
    USING (VALUES (@userName, @value)) AS source (Username, NewValue)
    ON target.Username = source.Username
    WHEN MATCHED THEN
        UPDATE SET target.WheelSpins = target.WheelSpins - source.NewValue
    WHEN NOT MATCHED THEN
        INSERT (Username, WheelSpins) VALUES (source.Username, 0);`);
  }).then(result => {
    console.dir(result);
    client.say(target, `${userName} spent spins [-${valueToRemove}]`);
  }).catch(err => {
    console.log(err);
    client.say(target, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

/**
 * 
 * @param {string} target 
 * @param {string} userName 
 */
function checkWheelSpins(target, userName) {
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('userName', sql.NVarChar, userName)
      .query(
        `SELECT * FROM dbo.WheelSpins WHERE Username = @Username;`);
  }).then(result => {
    console.dir(result);
    const recordset = result.recordset;
    let spins = 0;
    if (recordset.length > 0) {
      spins = recordset[0].WheelSpins;
    }
    client.say(target, `${userName} spins: [${spins}]`);
  }).catch(err => {
    console.log(err);
    client.say(target, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

function signalTimerEnd(channel, name) {
  console.log(`Timer ${name} has ended`);
  client.say(channel, `Timer ${name} has ended`);
}

// Called every time the bot connects to Twitch chat
/**
 * 
 * @param {string} addr 
 * @param {number} port 
 */
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
  if (config.get('enableLoggingStartAndShutdown')) {
    for (let i = 0; i < opts.channels.length; i++) {
      client.say(opts.channels[i], 'Running');
    }
  }
}

/**
 * Username has subscribed to a channel
 * @param {string} channel Channel name
 * @param {string} username Username
 * @param {tmi.SubMethods} methods Methods and plan used to subscribe
 * @param {string} message Custom message
 * @param {tmi.SubUserstate} userstate Userstate object
 */
function onSubscriptionHandler(channel, username, methods, message, userstate) {
  const displayName = userstate.displayName;
  console.log(`Sub received ${displayName}`);

  addWheelSpin(channel, displayName, 1);
  console.log(`* Finished executing subscription handler ${displayName}`);
}

/**
 * Username gifted a subscription to recipient in a channel.
 * @param {string} channel Channel name
 * @param {string} username Sender username
 * @param {number} streakMonths Streak months
 * @param {string} recipient Recipient username
 * @param {tmi.SubMethods} methods Methods and plan used to subscribe
 * @param {tmi.SubGiftUserstate} userstate Userstate object
 */
function onGiftSubHandler(channel, username, streakMonths, recipient, methods, userstate){
  const displayName = userstate.displayName;
  console.log(`Gift sub received ${displayName} to ${recipient}`);
  addWheelSpin(channel, displayName, 1);
  console.log(`* Finished executing subscription handler ${displayName} to ${recipient}`);
}