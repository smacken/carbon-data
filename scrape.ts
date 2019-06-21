import $ from 'cheerio';
import puppeteer = require('puppeteer');
import * as sqlite3 from 'sqlite3';
sqlite3.verbose();

export class NZUScraper {
    db: sqlite3.Database;
    constructor() {
        this.db = new sqlite3.Database('data/nzu.db');
    }

    getDateTime() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day  = date.getDate();
        return `${year}-${month}-${day}`;
    }

    async scrape() {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://www.commtrade.co.nz/', {waitUntil: 'networkidle2'});
            await page.waitFor('#page_market');
            let content = await page.content();
            
            let bid = $('#page_market table tr:first-child td.col2', content).text().trim();
            let offer = $('#page_market table tr:first-child td.col3', content).text().trim();
            let spot = $('#page_market table tr:first-child td.col4', content).text().trim()
            console.log(this.getDateTime() + ' b: ' + bid + ' o: ' + offer + ' s: ' + spot);
            
            if(!!bid && !!offer && !!spot) {
              const sql = `INSERT INTO Prices (date, bid, offer, spot) VALUES(?,?,?,?)`;
              const params = [this.getDateTime(), Number(bid), Number(offer), Number(spot)];
              this.db.run(sql, params, (err: Error) => {
                if (err) return console.log(err.message);
                console.log('insert completed');
              });
            }
            await browser.close();
        } catch (error) {
            console.error(error);
        }
    
        this.db.close();
    }
}