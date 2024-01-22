const tmi = require('tmi.js');
const config = require('config');
const sql = require('mssql');
console.log(`Jon Bot Version ${require("./package").version}`)
console.log(`NODE_ENV: ${process.env['NODE_ENV']}`)

const restrictedCommands =
  [
    'commands',
    'marco',
    'dice',
    'randomboss',
    'spins',
    'add',
    'spend',
    'timer',
    'goal',
    'goaladd',
    'goalremove'
  ];
const commonCommands =
  [
    'commands',
    'marco',
    'dice',
    'spins',
    'goal'
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
client.on('resub', onResubHandler);
client.on('cheer', onCheerHandler);
//client.on(`redeem`, onRedeemHandler);

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
  if (config.get('enableLoggingStartAndShutdown')) {
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
    else if (commandName === `${commandPrefix}marco`) {
      client.say(channel, `polo`);
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
      checkWheelSpins(channel, userName);
    }
    else if (commandName === `${commandPrefix}timer` && restrictedAccess) {
      const nameOfTimer = splitMessage[1];
      const minutesToWait = splitMessage[2];
      client.say(channel, `${nameOfTimer} ${minutesToWait} min`)
      setTimeout(signalTimerEnd, minutesToWait * 1000 * 60, channel, nameOfTimer);
    }
    else if (commandName === `${commandPrefix}goal`) {
      printGoalAmount(channel, 'Goal');
    }
    else if (commandName === `${commandPrefix}goaladd` && restrictedAccess) {
      const amountToAdd = splitMessage[1];
      addGoalAmount(channel, 'Goal', amountToAdd);
    }
    else if (commandName === `${commandPrefix}goalremove` && restrictedAccess) {
      const amountToRemove = splitMessage[1];
      removeGoalAmount(channel, 'Goal', amountToRemove);
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
 * @param {string} channel 
 * @param {string} userName 
 */
function checkWheelSpins(channel, userName) {
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
    client.say(channel, `${userName} spins: [${spins}]`);
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

function signalTimerEnd(channel, name) {
  console.log(`Timer ${name} has ended`);
  client.say(channel, `Timer ${name} has ended`);
}

/**
 * Gets the amount of money donated towards a goal and says it to the channel
 * @param {string} channel 
 * @param {string} nameOfGoal 
 */
function printGoalAmount(channel, nameOfGoal) {
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('name', sql.NVarChar, nameOfGoal)
      .query(
        `SELECT * FROM dbo.Goal WHERE Name = @Name;`);
  }).then(result => {
    console.dir(result);
    const recordset = result.recordset;
    if (recordset.length <= 0) {
      throw new Error(`No record found for ${nameOfGoal}`);
    }
    const amount = recordset[0].Amount;
    client.say(channel, `${nameOfGoal} amount: $${amount}`);
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

/**
 * 
 * @param {string} channel 
 * @param {string} nameOfGoal 
 * @param {number} amountToAdd 
 */
function addGoalAmount(channel, nameOfGoal, amountToAdd) {
  if (nameOfGoal == null) return;
  if (amountToAdd == null) return;
  const valueToAdd = amountToAdd;
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('nameOfGoal', sql.NVarChar, nameOfGoal)
      .input('value', sql.Int, valueToAdd)
      .query(`
        MERGE INTO Goal AS target
    USING (VALUES (@nameOfGoal, @value)) AS source (Name, NewValue)
    ON target.Name = source.Name
    WHEN MATCHED THEN
        UPDATE SET target.Amount = target.Amount + source.NewValue
    WHEN NOT MATCHED THEN
        INSERT (Name, Amount) VALUES (source.Name, source.NewValue);
        `);
  }).then(result => {
    console.dir(result);
    client.say(channel, `${nameOfGoal} increased $${valueToAdd}`);
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

function removeGoalAmount(channel, nameOfGoal, amountToRemove) {
  if (nameOfGoal == null) return;
  if (amountToRemove == null) return;
  const valueToRemove = amountToRemove;
  sql.connect(sqlConfig).then(pool => {
    // Query
    return pool.request()
      .input('nameOfGoal', sql.NVarChar, nameOfGoal)
      .input('value', sql.Int, valueToRemove)
      .query(
        `MERGE INTO Goal AS target
    USING (VALUES (@nameOfGoal, @value)) AS source (Name, NewValue)
    ON target.Name = source.Name
    WHEN MATCHED THEN
        UPDATE SET target.Amount = target.Amount - source.NewValue
    WHEN NOT MATCHED THEN
        INSERT (Name, Amount) VALUES (source.Name, 0);`);
  }).then(result => {
    console.dir(result);
    client.say(channel, `${nameOfGoal} decreased $${valueToRemove}`);
  }).catch(err => {
    console.log(err);
    client.say(channel, '¯\\_(ツ)_/¯');
    // ... error checks
  });
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
      client.say(opts.channels[i], `Running  ${require("./package").version}`);
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
  const displayName = userstate['display-name'];
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
function onGiftSubHandler(channel, username, streakMonths, recipient, methods, userstate) {
  const displayName = userstate['display-name'];
  console.log(`Gift sub received ${displayName} to ${recipient}`);
  addWheelSpin(channel, displayName, 1);
  console.log(`* Finished executing subscription handler ${displayName} to ${recipient}`);
}

/**
 * This event will only be received for rewards and custom rewards with user text
 * Not in use due to this restriction ;_;
 * @param {string} channel 
 * @param {string} username 
 * @param {string} rewardType 
 * @param {tmi.ChatUserstate} tags 
 */
function onRedeemHandler(channel, username, rewardType, tags) {
  const displayName = tags['display-name'];
  console.log(`Redeem received ${displayName} ${rewardType}`);
  client.say(channel, `${rewardType}`);
}

/**
 * Username has resubbed on a channel
 * streakMonths will be 0 unless the user shares their streak. userstate will have a lot of other data pertaining to the message
 * @param {string} channel Channel name
 * @param {string} username Username
 * @param {number} months Streak months
 * @param {string} message Custom message
 * @param {tmi.SubUserstate} userstate Userstate object userstate["msg-param-cumulative-months"]: String - Cumulative months
userstate["msg-param-should-share-streak"]: Boolean - User decided to share their sub streak
 * @param {tmi.SubMethods} methods Resub methods and plan (such as Prime)
 */
function onResubHandler(channel, username, months, message, userstate, methods) {
  const displayName = userstate['display-name'];
  console.log(`Resub received ${displayName}`);
  addWheelSpin(channel, displayName, 1);
  console.log(`* Finished executing resub handler ${displayName}`);
}

/**
 * Username has cheered to a channel.
 * Note: The amount of bits the user sent is inside the userstate (userstate.bits) - Read the Twitch API documentation for more information.
 * @param {string} channel Channel name
 * @param {tmi.ChatUserstate} userstate Userstate object
 * @param {string} message Message
 */
function onCheerHandler(channel, userstate, message) {
  const displayName = userstate['display-name'];
  const bits = userstate.bits;
  console.log(`Cheer received ${displayName} ${bits} bits`);
  const bitsPerSpin = config.get('bitsPerSpin');
  const amountOfSpins = bits / bitsPerSpin;
  console.log(`amountOfSpins: ${amountOfSpins}`);
  const amountOfSpinsWholeNumber = Math.floor(amountOfSpins);
  console.log(`amountOfSpinsWholeNumber: ${amountOfSpinsWholeNumber}`);
  if (amountOfSpinsWholeNumber >= 1) {
    addWheelSpin(channel, displayName, amountOfSpinsWholeNumber);
  }
  
  const bitsPerDollar = config.get('bitsPerDollar');
  const amountOfDollars = bits / bitsPerDollar;
  console.log(`amountOfDollars: ${amountOfDollars}`);
  const amountOfDollarsWholeNumber = Math.floor(amountOfDollars);
  console.log(`amountOfDollarsWholeNumber: ${amountOfDollarsWholeNumber}`);
  if (amountOfDollarsWholeNumber >= 1) {
    const timeToWaitbetweenMessagesMillis = config.get('timeToWaitbetweenMessagesMillis');
    console.log(`timeToWaitbetweenMessagesMillis: ${timeToWaitbetweenMessagesMillis}`);
    setTimeout(addGoalAmount, timeToWaitbetweenMessagesMillis, channel, 'Goal', amountOfDollarsWholeNumber);
    // addGoalAmount(channel, 'Goal', amountOfDollarsWholeNumber);
  }
  console.log(`* Finished executing cheer handler ${displayName} ${bits} bits`);
}