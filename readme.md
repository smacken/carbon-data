# NZU Carbon

Data feed for carbon NZU

![NZU plot](./notebooks/nzu-plot.png)

## Getting Started

Clone or download the carbon-data importer.

Configure where to import your data

```
config.json
```

Download & Run to import nzu data.

```
node index.js
```

View NZU notebook

```
cmd /k "conda activate base && jupyter lab"
```

### Installing

Download/clone carbon-data. Add to path.

```
git clone https://github.com/smacken/carbon-data.git
```

Configure the location/destination to import data to

```
.env > 'DB_Path', 'STORAGE'
```

### Prerequisites

Node.js/npm
* [NodeJs](https://nodejs.org/en/download/)

## Data Mining

Schedule daily data feed for bid, offer and spot price. Data is stored in nzu.db.

Schedule to retrieve daily nzu data
```
node schedule.js
```

Retrieve current daily nzu data
```
node index.js
```

## Import

Migrate sqlite db

```
node migrate.js
```

## API Server

Run a web server to serve price data with json

```
node server.js
```
