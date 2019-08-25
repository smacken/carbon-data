import * as sqlite3 from 'sqlite3';
sqlite3.verbose();
let argv = require('minimist')(process.argv.slice(2));
const fastify = require('fastify')({
    logger: true
});

let db: sqlite3.Database = new sqlite3.Database('data/nzu.db');
let port = 3000;
if (!!argv['port']) port = argv['port'];
let address = '127.0.0.1';
if (!!argv['address']) port = argv['address'];

function parseDate(input: string) {
    let delimeter = input.includes('-') ? '-' : '/';
    let parts: string[] = input.split(delimeter);
    return parts[0].length == 4 ? new Date(+parts[0], +parts[1]-1, +parts[2]) : new Date( +parts[1]-1, +parts[2], +parts[0]);
};

function getDateTime(datetime?: Date) {
    var date = !!datetime ? datetime : new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day  = date.getDate();
    return `${year}/${month}/${day}`;
  }

const removeEmpty = (obj: any) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') removeEmpty(obj[key]);
      else if (obj[key] == null) delete obj[key];
    });
};

const schema = {
    querystring: {
      from: { type: 'string' },
      to: { type: 'string' }
    }
};
fastify.get('/', {schema}, (request: any, reply: any) => {
    let params = request.query;
    let from = !!params['from'] ? getDateTime(parseDate(params['from'])) : null;
    let to = !!params['to'] ? getDateTime(parseDate(params['to'])) : null;
    db.serialize(() =>{
        var sql = "SELECT date, spot, bid, offer FROM Prices";
        if (!!from && !!to) sql = sql + ` Where date BETWEEN '${from}' AND '${to}'`
        if (!!from && !to) sql = sql + ` WHERE date > '${from}'`
        sql = sql + ' ORDER BY date'
        console.log(sql);

        db.all(sql, (err: Error, rows: any) => {
            rows.forEach((x:any) => removeEmpty(x));
            reply.type('application/json').send({"data": rows});
        });
    });
    return;
});

fastify.listen(port, address)
  .then((address: any) => console.log(`NZU server listening on ${address}`))
  .catch((err: any) => {
    db.close();
        fastify.log.error(err);
        process.exit(1);
  });