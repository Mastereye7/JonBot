const tmi = require('tmi.js');
const config = require('config');

// Define configuration options
const opts = {
  identity: {
    username: config.get('username'),
    password: config.get('password')
  },
  channels: config.get('channels')
};

console.log('reached here');
const sql = require('mssql');
const sqlConfig = {
  user: 'jonbot',
  password: 'PMCw3Esuv#!AZv',
  database: 'JonBot',
  server: 'JON-DESKTOP',
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

sql.connect(sqlConfig);

async () => {
 try {
  // make sure that any items are correctly URL encoded in the connection string
  console.log('Trying mssql...');
  await sql.connect(sqlConfig);
  const result = await sql.query`select * from JonBot where id = 1`;
  console.dir(result);
 } catch (err) {
  // ... error checks
 }
};

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
  if (msg[0] !== '!') { return }

  const isBroadcaster = userState.badges !== null && userState.badges.broadcaster !== null;
  const isModerator = userState.mod !== null && userState.mod;
  console.log(`isBroadcaster: ${isBroadcaster}`);
  console.log(`isModerator: ${isModerator}`);

  if (!isBroadcaster && !isModerator) { return; }

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else if (commandName === '!randomboss') {

    const boss = randomWorldBoss();
    client.say(target, `${boss}`)
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
function randomWorldBoss () {
    const bosses = [
        'Anemo Hypostasis',
        'Cryo Hypostasis',
        'Cryo Regisvine',
        'Electro Hypostasis',
        'Geo Hypostasis',
        'Oceanid',
        'Primo Geovishap',
        'Pyro Regisvine',
        'Ruin Serpent',
        'Bathysmal Vishap Herd',
        'Golden Wolflord',
        'Hydro Hypostasis',
        'Maguu Kenki',
        'Perpetual Mechanical Array',
        'Pyro Hypostasis',
        'Thunder Manifestation',
        'Jadeplume Terrorshroom',
        'Electro Regisvine',
        'Aeonblight Drake',
        'Algorithm of Semi-Intransient Matrix of Overseer Network',
        'Dendro Hypostasis',
        'Setekh Wenut',
        'Iniquitous Baptist',
        'Icewind Suite: Dirge of Coppelia',
        'Icewind Suite: Nemesis of Coppelius',
        'Emperor of Fire and Iron',
        'Experimental Field Generator',
        'Millennial Pearl Seahorse',
        'Hydro Tulpa'
    ];

    const randomNumber = Math.floor(Math.random() * bosses.length);

    const chosenBoss = bosses[randomNumber];
    return chosenBoss;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}