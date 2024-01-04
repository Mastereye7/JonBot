# Jon Bot

Bot created to listen to and integrate with Twitch chat.\
Version: 1.4

## Description

An in-depth paragraph about your project and overview of use.

## Features

- Commands called in chat with '-'
- Checks whether the caller is a broadcaster or a moderator
- MSSQL Database for writing and reading data
- Remotely send commands through other channel chats

## Available commands

* -dice - Picks a random number from 1-6
* -randomboss - Picks a random Genshin world boss from a list.
* -spins - Shows wheel spins a user has.
* -add - Adds spins to the wheel spins of a user.
* -rm - Spends spins of the wheel of a user.

### `-randomboss`
Example: `-randomboss`\
Picks a random world boss in Genshin Impact and prints it out to the chat.\
List of potential bosses is gotten from a local database.\
Jon maintains this database

### Wheel spin commands
#### `-spins {@userName}`
Example: `-spins @TwitchJonBot`\
Shows the spins available for @user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Required | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |

#### `-add {@userName} opt: {amountToAdd = 1}`
Example: `-add @TwitchJobBot 5`\
Adds an amount of spins to a @user.\
If user does not exist in database, creates the user.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Required | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |
| amountToAdd | Optional | Positive integer number of spins to add to @userName (ex. 4) |

#### `-rm {@userName} opt: {amountToRemove = 1}`
Example: `-rm @TwitchJonBot 6`\
Spends an amount of spins of a @user.\
If user does not exist in database, creates user with 0 spins.
| Parameter | Required? | Description |
| --------- | --------- | ----------- |
| @userName | Required  | Could be plain text userName or tag (@) (ex. @TwitchJonBot) |
| amountToRemove | Optional | Positive integer number of spins to spend of @userName (ex. 3) |

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
        "password": "string", //ex.: "oauth:{token}"
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
    "enableRemoteCommands": boolean
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

This project is licensed under the [NAME HERE] License - see the LICENSE.md file for details
