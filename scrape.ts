import $ from 'cheerio';
import puppeteer = require('puppeteer');
import * as sqlite3 from 'sqlite3';
sqlite3.verbose();

import { Storage } from './storage';

const tableName = 'nzu';

export class NZUScraper {
    db: sqlite3.Database | null = null;
    useSqlite: boolean = true;
    storage: Storage | null = null;
    constructor() {
        this.useSqlite = process.env.STORAGE === 'sqlite';
        this.db = this.useSqlite ? new sqlite3.Database('data/nzu.db') : null;
    }

    public static CreateAsync = async () => {
        const me = new NZUScraper();
        if (!me.useSqlite) {
            me.storage = await await Storage.Create(tableName);
        }
        return me;
     }

    getDateTime(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day  = date.getDate();
        return `${year}-${month}-${day}`;
    }

    async store(vals: any[]){
        if (this.useSqlite){
            const sql = `INSERT INTO Prices (date, bid, offer, spot) VALUES(?,?,?,?)`;
              const params = [this.getDateTime(), Number(vals[0]), Number(vals[1]), Number(vals[2])];
              this.db!.run(sql, params, (err: Error) => {
                if (err) return console.log(err.message);
                console.log('insert completed');
              });
        } else {
            await this.storage!.AddOrMergeRecord({
                PartitionKey: "nzu",
                RowKey: this.getDateTime().replace('-', ''),
                date: this.getDateTime(),
                bid: Number(vals[0]),
                offer: Number(vals[1]),
                spot: Number(vals[2])
              });
        }
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
                await this.store([bid, offer, spot])
            }
            await browser.close();
        } catch (error) {
            console.error(error);
        }
    
        if (this.useSqlite)
            this.db!.close();
    }
}