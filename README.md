# Jon Bot

Bot created to listen to and integrate with Twitch chat.<br>
Version: 1.10.0

## Description

The bot will connect to a Twitch chat set in the config and listen for commands and events.

## Features

- Commands called in chat with prefix set in config
- Automatically listens to certain chat events
- Restrict commands to everyone or broadcaster/moderator only
- MSSQL Database for writing and reading data
- Remotely send commands through other channel chats

## Available commands

### Common commands
* **-commands**<br>
Shows all the available commands for the user
* **-marco**<br>
Pings the bot to see if they are alive (hellooo?)
* **-randomboss**<br>
Picks a random Genshin world boss from a list.
* **-dice**<br>
Picks a random number from 1-100
* **-spins**<br>
Shows wheel spins the calling user has.
* **-usespins**<br>
Lets the calling user spend their spins
* **-timer (name) (minutes)**<br>
Sets a named timer in minutes.
* **-goal**<br>
Shows the current goal amount in dollars

### Restricted commands (Only moderators and broadcasters can use)
* **-commands**<br>
Shows all the available restricted commands for the user
* **-marco**<br>
Pings the bot to see if they are alive (hellooo?)
* **-randomboss**<br>
Picks a random Genshin world boss from a list.
* **-spins @user**<br>
Shows wheel spins a user has.
* **-usespins**<br>
Lets the calling user spend their spins
* **-add @user**<br>
Adds 1 spin to the wheel spins of a user.
* **-add @user (amount)**<br>
Adds amount of spins to the wheel spins of a user.
* **-spend @user**<br>
Spends 1 spin of the wheel for a user.
* **-spend @user (amount)**<br>
Spends an amount of spins of the wheel for a user.
* **-timer (name) (minutes)**<br>
Sets a named timer in minutes.
* **-goal**<br>
Shows the current goal amount in dollars
* **-goaladd (amount)**<br>
Adds amount of dollars towards the goal
* **-goalremove (amount)**<br>
Removed amount of dollars towards the goal

### `-commands`
Example: <br>
`-commands` <br>
Output: <br>
`commands,dice,randomboss,spins,add`<br>
Description:<br>
Shows the available commands for the user. <br>
If the user has restricted access, shows more commands.

### `-marco`
Example: <br>
`-marco` <br>
Output: <br>
`polo` <br>
Description:<br>
Lets the user know if the bot is still alive and kicking. <br>
Bot will try to say 'polo' back.

### `-randomboss`
Example: <br>
`-randomboss`<br>
Output: <br>
`1: Anemo Hypostasis`<br> 
Description:<br> 
Picks a random world boss in Genshin Impact and prints it out to the chat.<br>
List of potential bosses is gotten from a local database.<br>
Jon maintains this database

### Wheel spin commands
#### `-spins opt: {@userName}`
Example: <br>
`-spins`<br>
`-spins @TwitchJonBot`<br>
Output: <br>
`TwitchJonBot spins: [4]`<br> 
Description:<br> 
Shows the spins available for @user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | No | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |

#### `-usespins {amountToRemove}`
Example: <br>
`-usespins 4`<br>
Output: <br>
`TwitchJonBot spends spins [-4]`<br> 
Description:<br> 
Spends the spins of the calling user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| amountToRemove | Yes | Positive integer number of spins to spend of the calling user (ex. 3) |

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

#### `-spend {@userName} opt: {amountToRemove = 1}`
Example: <br>
`-spend @TwitchJonBot 6`<br>
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

### `-goal`
Example: <br>
`-goal`<br>
Output: <br>
`Goal amount $10` <br>
Description:<br> 
Shows the amount of dollars gained towards a goal. Right now goes to only one goal called "Goal" but could be further developed in the future.

### `-goaladd {amount}`
Example: <br>
`-goaladd 4`<br>
Output: <br>
`Goal increased $4` <br>
Description:<br> 
Adds an amount of dollars towards the goal. Amount has to be a whole number in dollars.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| amount | Yes | Integer amount of dollars to add to a goal. (ex. 5, 10, 2) |

### `-goalRemove {amount}`
Example: <br>
`-goalremove 12`<br>
Output: <br>
`Goal decreased $12` <br>
Description:<br> 
Removes an amount of dollars towards the goal. Amount has to be a whole number in dollars.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| amount | Yes | Integer amount of dollars to remove from a goal. (ex. 5, 10, 2) |

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
    "remoteToChannel": "#{channel}",
    "enableLoggingStartAndShutdown": false,
    "bitsPerSpin": 200,
    "bitsPerDollar": 100,
    "timeToWaitbetweenMessagesMillis": 800
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
* 1.10.0
    * 
* 1.9.1
    * Moved Powershell scripts to seperate folder for cleaner structure
* 1.9.0
    * Added powershell scripts for starting the bot
    * Added -marco command to ping the bot
    * Added -goal -goaladd and -goalremove commands for tracking goals [#43](https://github.com/Mastereye7/JonBot/issues/43)
    * Added new configs for bitsPerDollar and timeToWaitbetweenMessagesMillis
    * Bit cheers automatically increase amount towards a goal using addGoalAmount
* 1.8.0
    * Added automatic spins on resub [#37](https://github.com/Mastereye7/JonBot/issues/37)
    * Added automatic spins on bits cheers [#34](https://github.com/Mastereye7/JonBot/issues/34)
* 1.7.1
    * Fix subscription not giving automatic spins
* 1.7.0
    * Change dice roll to roll from 1-100
    * Added subscirption and giftsub handler adding spins to the user [#18](https://github.com/Mastereye7/JonBot/issues/18)
    * Bot says to all channels when it starts and gets shut down (Dies quietly if it crashes for now...)
    * Added documentation to methods and type hints
    * Renamed "target" to "channel" for more clarity
    * Added twitch token PowerShell script
* 1.6.0
    * Added -spins default command, shows spins of calling user [#20](https://github.com/Mastereye7/JonBot/issues/20)
    * Added restricted access to commands, some are now open for everyone to use
    * Change -rm command to -spend [#23](https://github.com/Mastereye7/JonBot/issues/23)
    * Added -commands command, shows available commands of the user [#26](https://github.com/Mastereye7/JonBot/issues/26)
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
