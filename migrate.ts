import * as sqlite3 from 'sqlite3';
import { Storage } from "./storage";

const tableName = "nzu";
sqlite3.verbose();
// require('dotenv').config()

export interface ISpotPrice {
    date: string;
    bid?: number;
    offer?: number;
    spot: number;
}

export class Spot implements ISpotPrice{
    constructor(public date: string, public spot: number, public bid: number, public offer: number){
    }
}

export class Migrate {
    db: sqlite3.Database;
    storage: Storage
    constructor(store: Storage) {
        this.db = new sqlite3.Database('data/nzu.db');
        this.storage = store;
    }
    allAsync(sql: string) : Promise<any[]> {
        return new Promise((resolve, reject) => { 
            this.db.all(sql, (error: Error, rows: any[]) => {
                if (!!error) reject(error);
                resolve(rows);
            });
        });
    }

    async getPrices(): Promise<ISpotPrice[]> {
        let sql = `SELECT * FROM Prices`;
        let rows = await this.allAsync(sql);
        return rows.map<ISpotPrice>((row: any) => new Spot((row as any).date, (row as any).spot, (row as any).bid, (row as any).offer));
    }
}

(async () => {
    try {
        const storage = await Storage.Create(tableName);
        let migration = new Migrate(storage);
        let prices: ISpotPrice[] = await migration.getPrices();
        for (const price of prices) {
            await storage.AddOrMergeRecord({
                PartitionKey: "nzu",
                RowKey: price.date.replace('-', ''),
                date: price.date,
                bid: price.bid,
                offer: price.offer,
                spot: price.spot
            });
        }
    } catch (error) {
        console.error(error);
    }
})();
