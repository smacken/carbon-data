# NZU Carbon

Data feed for carbon NZU

![alt text](https://raw.githubusercontent.com/smacken/carbon-data/master/notebooks/nzu-plot.png)

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
config.json > 'sourcePath', 'destinationPath'
```

### Prerequisites

Node.js/npm
* [NodeJs](https://nodejs.org/en/download/)

## Data Mining

Schedule daily data feed for bid, offer and spot price. Data is stored in nzu.db.

## Import csv data

## API Server

