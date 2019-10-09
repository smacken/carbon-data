import * as fs from 'fs';
const parse = require('csv-parse');
let argv = require('minimist')(process.argv.slice(2));
import { promisify } from 'util';
import * as sqlite3 from 'sqlite3';
sqlite3.verbose();

const readFile = promisify(fs.readFile);
const parseCsv = promisify(parse);

let inputPath = argv['input'];
inputPath = inputPath.replace(/['"]+/g, '');
const hasHeader = argv['header'] || false;
const dbPath = argv['db'] || 'data/nzu.db';

let db: sqlite3.Database = new sqlite3.Database(dbPath);

export function fileExists(filepath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.constants.F_OK, error => {
            resolve(!error);
        });
    });
}

(async () => {
    try {
        if (!await fileExists(inputPath)) throw Error('The file given does not exist for import.');
        let fileData = await readFile(inputPath);
        const csvOptions = {
            columns: true,
            trim: true,
            from: hasHeader ? 1 : 0
        };
        let rows = await parseCsv(fileData, csvOptions);
        rows.forEach((row: any) => {
            try {
                const sql = `INSERT INTO Prices (date, spot) VALUES(?,?)`;
                db.run(sql, [row['date'], Number(row['price'])], (err: Error) => {
                    if (err) return console.log(err.message);
                });
            } catch (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.error(error);
    }

    db.close();
})();