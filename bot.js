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

sql.connect(sqlConfig).then(pool => {
  // Query
  
  return pool.request()
      .input('input_parameter', sql.Int, 1)
      .query('select * from Test where Id = @input_parameter');
}).then(result => {
  console.dir(result);
}).catch(err => {
  console.log(err);
// ... error checks
});

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, userState, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  if (msg[0] !== '-') { return }

  const isBroadcaster = userState.badges !== null && userState.badges.broadcaster !== null;
  const isModerator = userState.mod !== null && userState.mod;
  console.log(`isBroadcaster: ${isBroadcaster}`);
  console.log(`isModerator: ${isModerator}`);

  if (!isBroadcaster && !isModerator) { return; }

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '-dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '-randomboss') {
    randomWorldBoss(target);
    console.log(`* Executed ${commandName} command`);
  }
  else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Function that returns a random world boss
function randomWorldBoss (target) {
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

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}