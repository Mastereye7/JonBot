# Jon Bot

Bot created to listen to and integrate with Twitch chat.

## Description

An in-depth paragraph about your project and overview of use.

## Features

- Commands called in chat with '-'
- Checks whether the caller is a broadcaster or a moderator
- MSSQL Database for writing and reading data

## Available commands

* -dice - Picks a random number from 1-6
* -randomboss - Picks a random Genshin world boss from a list. 

### -randomboss

List of potential bosses is gotten from a local database. Jon maintains this database

## Getting Started

### Dependencies

* Describe any prerequisites, libraries, OS version, etc., needed before installing program.
* ex. Windows 10

### Installing

* How/where to download your program
* Any modifications needed to be made to files/folders

- Make sure to create a /config folder with a default.json file to run the software.

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
