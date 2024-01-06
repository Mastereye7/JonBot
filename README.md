# Jon Bot

Bot created to listen to and integrate with Twitch chat.<br>
Version: 1.5.1

## Description

The bot will connect to a Twitch chat set in the config and listen for commands and events.

## Features

- Commands called in chat with '-'
- Checks whether the caller is a broadcaster or a moderator
- MSSQL Database for writing and reading data
- Remotely send commands through other channel chats

## Available commands

* **-dice**<br>
Picks a random number from 1-6
* **-randomboss**<br>
Picks a random Genshin world boss from a list.
* **-spins @user**<br>
Shows wheel spins a user has.
* **-add @user**<br>
Adds 1 spin to the wheel spins of a user.
* **-add @user (amount)**<br>
Adds amount of spins to the wheel spins of a user.
* **-rm @user**<br>
Spends 1 spin of the wheel for a user.
* **-rm @user (amount)**<br>
Spends an amount of spins of the wheel for a user.
* **-timer (name) (minutes)**<br>
Sets a named timer in minutes.

### `-randomboss`
Example: `-randomboss`<br>
Output: `1: Anemo Hypostasis`<br> 
Description:<br> 
Picks a random world boss in Genshin Impact and prints it out to the chat.<br>
List of potential bosses is gotten from a local database.<br>
Jon maintains this database

### Wheel spin commands
#### `-spins {@userName}`
Example: `-spins @TwitchJonBot`<br>
Output: `TwitchJonBot spins: [4]`<br> 
Description:<br> 
Shows the spins available for @user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Yes | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |

#### `-add {@userName} opt: {amountToAdd = 1}`
Example: <br>
`-add @TwitchJobBot 5`<br>
Output: <br>
`TwitchJonBot gains spins [+5]`<br> 
Description:<br> 
Adds an amount of spins to a @user.<br>
If user does not exist in database, creates the user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Yes | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |
| amountToAdd | No | Positive integer number of spins to add to @userName (ex. 4) |

#### `-rm {@userName} opt: {amountToRemove = 1}`
Example: <br>
`-rm @TwitchJonBot 6`<br>
Output: <br>
`TwitchJonBot spends spins [-6]`<br> 
Description:<br> 
Spends an amount of spins of a @user.<br>
If user does not exist in database, creates user with 0 spins.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Yes  | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |
| amountToRemove | No | Positive integer number of spins to spend of @userName (ex. 3) |

### `-timer {nameOfTimer} {minutesToDelay}`
Example: <br>
`-timer MyTimer 1`<br>
Output: <br>
`MyTimer 1 min` <br>
`Timer MyTimer has ended`<br> 
Description:<br> 
Sets a timer with a certain amount of time. When timer ends, bot chats the timer name ending.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| nameOfTimer | Yes | Name of the timer to start. Cannot have any spaces. (ex. MyTimer) |
| minutesToDelay |  Yes | Amount of minutes to wait. Decimals are okay (ex. 5, 0.5, 2) |

## Getting Started

### Dependencies

* Describe any prerequisites, libraries, OS version, etc., needed before installing program.
* ex. Windows 10

### Installing

* How/where to download your program
* Any modifications needed to be made to files/folders

- Make sure to create a /config folder with a default.json file to run the software.

#### Config
```json
{
    "twitchConfig":{
        "username": "string",
        "password": "oauth:{token}",
        "channels": 
        [
            "string",
            "string"
        ]
    },
    "dbConfig":{
        "user": "string",
        "password": "string",
        "database": "string",
        "server": "string"
    },
    "enableRemoteCommands": false,
    "remoteFromChannel": "#{channel}",
    "remoteToChannel": "#{channel}"
}
```

### Executing program

* How to run the program
* Step-by-step bullets
```
code blocks for commands
```

## Help

Any advise for common problems or issues.
```
command to run if program contains helper info
```

## Authors

Contributors names and contact info

[@Mastereye7](https://twitter.com/Mastereye7)

## Version History
* 1.5.1
    * Fixed issue with regular chatters being able to call commands [#19](https://github.com/Mastereye7/JonBot/issues/19)
    * Added logging caller of command
    * Added logging userState of caller
    * Added chat to be sent when starting a timer
* 1.5.0
    * Added config for remote chat commands [#6](https://github.com/Mastereye7/JonBot/issues/6)
    * Add command -timer [#11](https://github.com/Mastereye7/JonBot/issues/11)
    * Change readme with outputs of commands
* 1.4
    * Added ability to remotely send commands through another channel chat
    * Added enableRemoteCommands config
    * Removed "pog" from command results
* 1.3.1
    * Fix -spins just showing 0 spins
* 1.3
    * Added wheel spin commands (-add, -rm, -spins)
    * Added arguments to inputs
    * Fixed program crashing when logic fails
* 1.2
    * Added MSSQL database connection
    * Changed config file to contain properties with hierarchy
    * Changed prefix command to '-'
* 1.1
    * Added !randomboss command which randomises a random Genshin world boss
    * Checks whether message sender is the broadcaster or a moderator
* 1.0
    * Various bug fixes and optimizations
    * See [commit change]() or See [release history]()

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
