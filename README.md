# SENS-DB


## USO

``` js

const setupDatabase = require('sens-db')

setupDatabase(config)
    .then(db => {
        const { Agent, Metric } = db
    })
    .catch( err => console.error( err )
)
```