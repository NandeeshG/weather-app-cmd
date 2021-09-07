const chalk = require('chalk')
const request = require('request')
const yargs = require('yargs')
const weather = require('./weather.js').module
const utils = require('./utils.js').module

yargs.version('1.1.0')

yargs.command({
    command: ['Weather', 'weather', 'W', 'w'],
    describe: 'Get weather for the given city',
    builder: {
        city: {
            alias: 'c',
            describe: 'The name of city',
            demandOption: true,
            type: 'string',
        },
    },
    handler: (argv) => {
        weather.geocoding(argv.city, (err, res) => {
            if (err) {
                console.log(chalk.red.bold(err))
            } else {
                utils.printData(argv.city, res)
            }
        })
    },
})

yargs.command({
    command: ['Forecast', 'forecast', 'f', 'F'],
    describe: 'Get weather forecast for a city by hours or days',
    builder: {
        city: {
            alias: 'c',
            describe: 'The name of city',
            demandOption: true,
            type: 'string',
        },
        type: {
            alias: 't',
            describe: `Forecast type: \n
                 (M) Minute precipitation,\n
                 (H) Hourly Weather,\n
                 (D) Daily Weather\n`,
            demandOption: false,
            default: 'D',
            type: 'string',
        },
    },
    handler: (argv) => {
        //console.log(chalk.magentaBright('Coming in version 1.1.0!'))
        if (!(argv.type in weather.maptypes)) {
            return console.log("Wrong argument 'type'")
        }
        weather.geocoding(argv.city, (err, res) => {
            if (err) console.log(err)
            else {
                weather.forecast(
                    res.coord.lat,
                    res.coord.lon,
                    (err, res) => {
                        if (err) console.log(err)
                        else {
                            utils.printCity(argv.city)
                            for (const d of res[
                                `${weather.maptypes[argv.type]}`
                            ]) {
                                console.log(
                                    chalk.blueBright.inverse(
                                        `Forecast for ${utils.convertToDate(
                                            d.dt
                                        )}`
                                    )
                                )
                                for (const i in d) {
                                    if (i !== 'dt') {
                                        utils.printPair(i, d)
                                    }
                                }
                                console.log('\n')
                            }
                        }
                    },
                    weather.maptypes[argv.type]
                )
            }
        })
    },
})

yargs.parse()
