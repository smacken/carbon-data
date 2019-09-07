import dotenv, { DotenvConfigOptions } from 'dotenv'
import * as sqlite3 from 'sqlite3';
import { Storage } from "./storage";

const tableName = "nzu";
sqlite3.verbose();

const result = dotenv.config({ debug: process.env.DEBUG } as DotenvConfigOptions)

if (result.error) {
  throw result.error
}

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
    constructor(public storeage: Storage) {
        this.db = new sqlite3.Database(process.env.DB_PATH!);
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
        let rows = await this.allAsync(`SELECT date, spot, bid, offer FROM Prices`);
        return rows.map<ISpotPrice>((row: any) => 
            new Spot((row as any).date, (row as any).spot, (row as any).bid, (row as any).offer));
    }
}

(async () => {
    try {
        console.log('Migrating prices to azure');
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
        console.log('Migrating completed');
    } catch (error) {
        console.error(error);
    }
})();
