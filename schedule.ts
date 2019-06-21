import * as cron from 'cron';
const CronJob = cron.CronJob;
import {NZUScraper} from './scrape'
import winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'nzu.log' })
    ]
  });

const getDaily = new CronJob('0 18 * * 1-5', () => {
    (async ()=> {
        try {
            logger.info('init scraper', {'date': new Date()});
            let nzu = new NZUScraper();
            await nzu.scrape()
        } catch (error) {
            logger.error(error);
        }
    })();
});

logger.info('starting carbon scheduler', {'date': new Date()});
getDaily.start();
