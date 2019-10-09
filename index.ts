import $ from 'cheerio';
import puppeteer = require('puppeteer');
import * as sqlite3 from 'sqlite3';
sqlite3.verbose();

let db = new sqlite3.Database('data/nzu.db');

function getDateTime(): string {
  let date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day  = date.getDate();
  return `${year}-${month}-${day}`;
}

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.commtrade.co.nz/', {waitUntil: 'domcontentloaded'});
        await page.waitFor('#page_market');
        let content = await page.content();

        let bid = $('#page_market table tr:first-child td.col2', content).text().trim();
        let offer = $('#page_market table tr:first-child td.col3', content).text().trim();
        let spot = $('#page_market table tr:first-child td.col4', content).text().trim();
        if (!bid) bid = '0';
        if (!offer) offer = '0';
        console.log(getDateTime() + ' b: ' + bid + ' o: ' + offer + ' s: ' + spot);

        if (!!spot) {
          const sql = `INSERT INTO Prices (date, bid, offer, spot) VALUES(?,?,?,?)`;
          const params = [getDateTime(), Number(bid), Number(offer), Number(spot)];
          db.run(sql, params, (err: Error) => {
            if (err) return console.log(err.message);
            console.log('insert completed');
          });
        } else {
          console.log('could not retrieve spot price');
        }
        await browser.close();
    } catch (error) {
        console.error(error);
    }

    db.close();
})();