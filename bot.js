const tmi = require('tmi.js');
const config = require('config');
const sql = require('mssql');

// Define configuration options
const opts = {
  identity: {
    username: config.get('twitchConfig.username'),
    password: config.get('twitchConfig.password')
  },
  channels: config.get('twitchConfig.channels')
};

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

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, userState, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  if (msg[0] !== '-') { return }

  const isBroadcaster = userState.badges !== null && userState.badges.broadcaster !== null;
  const isModerator = userState.mod !== null && userState.mod;

  if (!isBroadcaster && !isModerator) { return; }

  // Remove whitespace from chat message
  const message = msg.trim();
  const splitMessage = message.split(" ");
  const commandName = splitMessage[0];

  // If the command is known, let's execute it
  try {
    if (commandName === '-dice') {
      const num = rollDice();
      client.say(target, `You rolled a ${num}`);
    } else if (commandName === '-randomboss') {
      randomWorldBoss(target);
    } else if (commandName === '-add') {
      const userName = splitMessage[1].replace('@', '');
      const amountToAdd = splitMessage[2];
      addWheelSpin(target, userName, amountToAdd);
    } else if (commandName === '-rm') {
      const userName = splitMessage[1].replace('@', '');
      const amountToRemove = splitMessage[2];
      removeWheelSpin(target, userName, amountToRemove);
    } else if (commandName === '-spins') {
      const userName = splitMessage[1].replace('@', '');
      checkWheelSpins(target, userName)
    }
    else {
      console.log(`* Unknown command ${commandName}`);
    }
    console.log(`* Executed ${commandName} command`);
  }
  catch (error) {
    console.log(`Error with command ${commandName} ${error}`)
  }
}

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Function that returns a random world boss
function randomWorldBoss(target) {
  sql.connect(sqlConfig).then(pool => {
    // Query

    return pool.request()
      .query('select * from Bosses');
  }).then(result => {
    console.dir(result);
    const recordSet = result.recordset;
    const randomNumber = Math.floor(Math.random() * recordSet.length);
    const chosenBoss = recordSet[randomNumber];
    client.say(target, `${chosenBoss.Id}: ${chosenBoss.BossName}`)
  }).catch(err => {
    console.log(err);
    client.say(target, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

function addWheelSpin(target, userName, amountToAdd) {
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
    client.say(target, `${userName} gained spins pog [+${valueToAdd}]`);
  }).catch(err => {
    console.log(err);
    client.say(target, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

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
    client.say(target, `${userName} spent spins pog [-${valueToRemove}]`);
  }).catch(err => {
    console.log(err);
    client.say(target, '¯\\_(ツ)_/¯');
    // ... error checks
  });
}

function checkWheelSpins(target, userName){
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

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}