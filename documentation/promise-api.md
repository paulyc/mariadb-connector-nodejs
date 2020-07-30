
# Documentation

There are two different connection implementation: one, the default, uses Promise and the other uses Callback, allowing for compatibility with the mysql and mysql2 API's.  

The documentation provided on this page is the promise API (default).  
If you want information on the Callback API, see the  [CALLBACK API](./callback-api.md). 


## Quick Start

Install the mariadb Connector using npm

```
$ npm install mariadb
```

You can then uses the Connector in your application code with the Promise API.  For instance,

```js
  const mariadb = require('mariadb');

  mariadb.createConnection({host: 'mydb.com', user: 'myUser', password: 'myPwd'})
    .then(conn => {
      conn.query("select 1", [2])
        .then(rows => {
          console.log(rows); // [{ "1": 1 }]
          conn.end();
        })
        .catch(err => { 
          //handle query error
        });
    })
    .catch(err => {
      //handle connection error
    });
```

# Installation

In order to use the Connector you first need to install it on your system.  The installation process for Promise and Callback API's is managed with the same package through npm. 

```
$ npm install mariadb
```

To use the Connector, you need to import the package into your application code. 

```js
const mariadb = require('mariadb');
```

## Timezone consideration

It's not recommended, but in some cases, Node.js and database are configured with different timezone. 

By default, `timezone` option is set to 'local' value, indicating to use client timezone, so no conversion will be done.

If client and server timezone differ, `timezone` option has to be set to server timezone.
- 'auto' value means client will request server timezone when creating a connection, and use server timezone afterwhile. 
- To avoid this additional command on connection, `timezone` can be set to [IANA time zone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). 

Connector will then convert date to server timezone, rather than the current Node.js timezone. 


## Security consideration

Connection details such as URL, username, and password are better hidden into environment variables.
using code like : 
```js
  const mariadb = require('mariadb');

  mariadb.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PWD})
    .then(conn => {
       ...
     });
```
Then for example, run node.js setting those environment variable :
```
$ DB_HOST=localhost DB_USER=test DB_PASSWORD=secretPasswrd node my-app.js
```

Another solution is using `dotenv` package. Dotenv loads environment variables from .env files into the process.env variable in Node.js :
```
$ npm install dotenv
```

then configure dotenv to load all .env files
 
```js
  const mariadb = require('mariadb');
  require('dotenv').config()
  mariadb.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PWD})
    .then(conn => {
       ...
     });
```

with a .env file containing
```
DB_HOST=localhost
DB_USER=test
DB_PWD=secretPasswrd
```
.env files must NOT be pushed into repository,  using .gitignore


# Promise API

**Base:**

* [`createConnection(options) → Promise`](#createconnectionoptions--promise) : Creates a new connection.
* [`createPool(options) → Pool`](#createpooloptions--pool) : Creates a new Pool.
* [`createPoolCluster(options) → PoolCluster`](#createpoolclusteroptions--poolcluster) : Creates a new pool cluster.
* [`version → String`](#version--string) : Return library version.


**Connection:** 

* [`connection.query(sql[, values]) → Promise`](#connectionquerysql-values---promise): Executes a query.
* [`connection.queryStream(sql[, values]) → Emitter`](#connectionquerystreamsql-values--emitter): Executes a query, returning an emitter object to stream rows.
* [`connection.batch(sql, values) → Promise`](#connectionbatchsql-values--promise): fast batch processing.
* [`connection.beginTransaction() → Promise`](#connectionbegintransaction--promise): Begins a transaction.
* [`connection.commit() → Promise`](#connectioncommit--promise): Commits the current transaction, if any.
* [`connection.rollback() → Promise`](#connectionrollback--promise): Rolls back the current transaction, if any.
* [`connection.changeUser(options) → Promise`](#connectionchangeuseroptions--promise): Changes the current connection user.
* [`connection.ping() → Promise`](#connectionping--promise): Sends a 1 byte packet to the database to validate the connection.
* [`connection.reset() → Promise`](#connectionreset--promise): reset current connection state.
* [`connection.isValid() → boolean`](#connectionisvalid--boolean): Checks that the connection is active without checking socket state.
* [`connection.end() → Promise`](#connectionend--promise): Gracefully close the connection.
* [`connection.destroy()`](#connectiondestroy): Forces the connection to close. 
* [`connection.escape(value) → String`](#connectionescapevalue--string): escape parameter 
* [`connection.escapeId(value) → String`](#connectionescapeidvalue--string): escape identifier 
* [`connection.pause()`](#connectionpause): Pauses the socket output.
* [`connection.resume()`](#connectionresume): Resumes the socket output.
* [`connection.serverVersion()`](#connectionserverversion): Retrieves the current server version.
* [`events`](#events): Subscribes to connection error events.

**Pool:**

* [`pool.getConnection() → Promise`](#poolgetconnection--promise) : Creates a new connection.
* [`pool.query(sql[, values]) → Promise`](#poolquerysql-values---promise): Executes a query.
* [`pool.batch(sql, values) → Promise`](#poolbatchsql-values---promise): Executes a batch
* [`pool.end() → Promise`](#poolend--promise): Gracefully closes the connection.
* [`pool.escape(value) → String`](#poolescapevalue--string): escape parameter 
* [`pool.escapeId(value) → String`](#poolescapeidvalue--string): escape identifier 
* `pool.activeConnections() → Number`: Gets current active connection number.
* `pool.totalConnections() → Number`: Gets current total connection number.
* `pool.idleConnections() → Number`: Gets current idle connection number.
* `pool.taskQueueSize() → Number`: Gets current stacked request.
* [`pool events`](#pool-events): Subscribes to pool events.

**PoolCluster**

* [`poolCluster.add(id, config)`](#poolclusteraddid-config) : add a pool to cluster.
* [`poolCluster.remove(pattern)`](#poolclusterremovepattern) : remove and end pool according to pattern.
* [`poolCluster.end() → Promise`](#poolclusterend--promise) : end cluster.
* [`poolCluster.getConnection(pattern, selector) → Promise`](#poolclustergetconnectionpattern-selector--promise) : return a connection from cluster.
* [`poolCluster.of(pattern, selector) → FilteredPoolCluster`](#poolclusterofpattern-selector--filteredpoolcluster) : return a subset of cluster.
* [`poolCluster events`](#poolcluster-events): Subscribes to pool cluster events.


# Base API

## `createConnection(options) → Promise`

> * `options`: *JSON/String* [connection option documentation](#connection-options)
>
> Returns a promise that :
> * resolves with a [Connection](#connection-api) object,
> * raises an [Error](#error).

Creates a new [Connection](#connection-api) object.

**Example:**

```javascript
const mariadb = require('mariadb');
mariadb.createConnection({
      host: 'mydb.com', 
      user:'myUser',
      password: 'myPwd'
    })
    .then(conn => {
      console.log("connected ! connection id is " + conn.threadId);
    })
    .catch(err => {
      console.log("not connected due to error: " + err);
    });
```

### Connection options

Essential options list:

|option|description|type|default| 
|---:|---|:---:|:---:| 
| **`user`** | User to access database. |*string* | 
| **`password`** | User password. |*string* | 
| **`host`** | IP address or DNS of the database server. *Not used when using option `socketPath`*. |*string*| "localhost"|
| **`port`** | Database server port number. *Not used when using option `socketPath`*|*integer*| 3306|
| **`ssl`** | Enables TLS support. For more information, see the [`ssl` option](/documentation/connection-options.md#ssl) documentation. |*mixed*|
| **`database`** | Default database to use when establishing the connection. | *string* | 
| **`socketPath`** | Permits connections to the database through the Unix domain socket or named pipe. |  *string* | 
| **`compress`** | Compresses the exchange with the database through gzip.  This permits better performance when the database is not in the same location.  |*boolean*| false|
| **`connectTimeout`** | Sets the connection timeout in milliseconds. |*integer* | 10 000|
| **`socketTimeout`** | Sets the socket timeout in milliseconds after connection succeeds. A value of `0` disables the timeout. |*integer* | 0|
| **`queryTimeout`** | Set maximum query time in ms (an error will be thrown if limit is reached). 0 or undefined meaning no timeout. This can be superseded for a query using [`timeout`](https://github.com/mariadb-corporation/mariadb-connector-nodejs/blob/master/documentation/promise-api.md#timeout) option|*int* |0| 
| **`rowsAsArray`** | Returns result-sets as arrays, rather than JSON. This is a faster way to get results. For more information, see Query. |*boolean* | false|

For more information, see the [Connection Options](/documentation/connection-options.md) documentation. 

### Connecting to Local Databases 

When working with a local database (that is, cases where MariaDB and your Node.js application run on the same host), you can connect to MariaDB through the Unix socket or Windows named pipe for better performance, rather than using the TCP/IP layer.

In order to set this up, you need to assign the connection a `socketPath` value.  When this is done, the Connector ignores the `host` and `port` options.

The specific socket path you need to set is defined by the 
[`socket`](https://mariadb.com/kb/en/library/server-system-variables/#socket) server system variable.  If you don't know it off hand, you can retrieve it from the server.

```sql
SHOW VARIABLES LIKE 'socket';
```

It defaults to `/tmp/mysql.sock` on Unix-like operating systems and `MySQL` on Windows.  Additionally, on Windows, this feature only works when the server is started with the `--enable-named-pipe` option.

For instance, on Unix a connection might look like this:

```javascript
const mariadb = require('mariadb');
mariadb.createConnection({ socketPath: '/tmp/mysql.sock', user: 'root' })
    .then(conn => { ... })
    .catch(err => { ... });
```

It has a similar syntax on Windows: 

```javascript
const mariadb = require('mariadb');
mariadb.createConnection({ socketPath: '\\\\.\\pipe\\MySQL', user: 'root' })
    .then(conn => { ... })
    .catch(err => { ... });
```

## `createPool(options) → Pool`

> * `options`: *JSON/String* [pool options](#pool-options)
>
> Returns a [Pool](#pool-api) object,

Creates a new pool.

**Example:**

```javascript
const mariadb = require('mariadb');
const pool = mariadb.createPool({ host: 'mydb.com', user: 'myUser', connectionLimit: 5 });
pool.getConnection()
    .then(conn => {
      console.log("connected ! connection id is " + conn.threadId);
      conn.release(); //release to pool
    })
    .catch(err => {
      console.log("not connected due to error: " + err);
    });
```

### Pool options

Pool options includes [connection option documentation](#connection-options) that will be used when creating new connections. 

Specific options for pools are :

|option|description|type|default| 
|---:|---|:---:|:---:| 
| **`acquireTimeout`** | Timeout to get a new connection from pool in ms. |*integer* | 10000 |
| **`connectionLimit`** | Maximum number of connection in pool. |*integer* | 10 |
| **`idleTimeout`** | Indicate idle time after which a pool connection is released. Value must be lower than [@@wait_timeout](https://mariadb.com/kb/en/library/server-system-variables/#wait_timeout). In seconds (0 means never release) |*integer* | 1800 |
| **`minimumIdle`** | Permit to set a minimum number of connection in pool. **Recommendation is to use fixed pool, so not setting this value**.|*integer* | *set to connectionLimit value* |
| **`minDelayValidation`** | When asking a connection to pool, the pool will validate the connection state. "minDelayValidation" permits disabling this validation if the connection has been borrowed recently avoiding useless verifications in case of frequent reuse of connections. 0 means validation is done each time the connection is asked. (in ms) |*integer*| 500|
| **`noControlAfterUse`** | After giving back connection to pool (connection.end) connector will reset or rollback connection to ensure a valid state. This option permit to disable those controls|*boolean*| false|
| **`resetAfterUse`** | When a connection is given back to pool, reset the connection if the server allows it (only for MariaDB version >= 10.2.22 /10.3.13). If disabled or server version doesn't allows reset, pool will only rollback open transaction if any|*boolean*| true|
| **`leakDetectionTimeout`** |Permit to indicate a timeout to log connection borrowed from pool. When a connection is borrowed from pool and this timeout is reached, a message will be logged to console indicating a possible connection leak. Another message will tell if the possible logged leak has been released. A value of 0 (default) meaning Leak detection is disable |*integer*| 0|


## `createPoolCluster(options) → PoolCluster`

> * `options`: *JSON* [poolCluster options](#poolCluster-options)
>
> Returns a [PoolCluster](#poolCluster-api) object,

Creates a new pool cluster. Cluster handle multiple pools, giving high availability / distributing load (using round robin / random / ordered ).

**Example:**

```javascript
const mariadb = require('mariadb');

const cluster = mariadb.createPoolCluster();
cluster.add("master", { host: 'mydb1.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1", { host: 'mydb2.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave2", { host: 'mydb3.com', user: 'myUser', connectionLimit: 5 });

//getting a connection from slave1 or slave2 using round-robin
cluster.getConnection(/^slave*$, "RR")
  .then(conn => {
    return conn.query("SELECT 1")
       .then(row => {
           conn.end();
           return row[0]["@node"];
       })
       .finally(() => {
           conn.end();
       });
  });
```

 
### PoolCluster options

Pool cluster options includes [pool option documentation](#pool-options) that will be used when creating new pools. 

Specific options for pool cluster are :

|option|description|type|default| 
|---:|---|:---:|:---:| 
| **`canRetry`** | When getting a connection from pool fails, can cluster retry with other pools |*boolean* | true |
| **`removeNodeErrorCount`** | Maximum number of consecutive connection fail from a pool before pool is removed from cluster configuration. null means node won't be removed|*integer* | 5 |
| **`restoreNodeTimeout`** | delay before a pool can be reused after a connection fails. 0 = can be reused immediately (in ms) |*integer*| 1000|
| **`defaultSelector`** | default pools selector. Can be 'RR' (round-robin), 'RANDOM' or 'ORDER' (use in sequence = always use first pools unless fails) |*string*| 'RR'|

## `version → String`

> Returns a String that is library version. example '2.1.2'.


# Connection API

## `connection.query(sql[, values]) -> Promise`

> * `sql`: *string | JSON* SQL string or JSON object to supersede default connection options.  When using JSON object, object must have a "sql" key. For instance, `{ dateStrings: true, sql: 'SELECT now()' }`
> * `values`: *array | object* Placeholder values. Usually an array, but in cases of only one placeholder, it can be given as is. 
>
> Returns a promise that :
> * resolves with a JSON object for update/insert/delete or a [result-set](#result-set-array) object for result-set.
> * rejects with an [Error](#error).


Sends a query to database and return result as a Promise.

For instance, when using an SQL string:

```js
connection
  .query("SELECT NOW()")
  .then(rows => {
	console.log(rows); //[ { 'NOW()': 2018-07-02T17:06:38.000Z }, meta: [ ... ] ]
  })
  .catch(err => {
	//handle error
  });
```

Alternatively, you could use the JSON object:

```js
connection
   .query({dateStrings:true, sql:'SELECT NOW()'})
   .then(rows => {
	  console.log(rows); //[ { 'NOW()': '2018-07-02 19:06:38' }, meta: [ ... ] ]
	})
	.catch(...)
```

### Placeholder

To prevent SQL Injection attacks, queries permit the use of question marks as placeholders.  The Connection escapes values according to their type.  Values can be of native JavaScript types, Buffers, Readables, objects with `toSQLString` methods, or objects that can be stringified (that is, `JSON.stringfy`).

When streaming, objects that implement Readable are streamed automatically.  But, there are two server system variables that may interfere:

- [`net_read_timeout`](https://mariadb.com/kb/en/library/server-system-variables/#net_read_timeout): The server must receive queries before reaching this timeout, which defaults to 30 seconds.
- [`max_allowed_packet`](https://mariadb.com/kb/en/library/server-system-variables/#max_allowed_packet): This system variable defines the maximum amount of data the Connector can send to the server.

For instance,

```js
connection
  .query(
	 "INSERT INTO someTable VALUES (?, ?, ?)", 
	 [1,Buffer.from("c327a97374", "hex"),"mariadb"]
  )
  .then(...)
  .catch(...);
  //will send INSERT INTO someTable VALUES (1, _BINARY '.\'.st', 'mariadb')
```


In the case of streaming, 

```js
const https = require("https");
//3Mb page
https.get("https://node.green/#ES2018-features-Promise-prototype-finally-basic-support",
  readableStream => {
    connection.query("INSERT INTO StreamingContent (b) VALUE (?)", [readableStream]);
      .then(res => {
        //inserted
      })
      .catch(console.log);
  }
)
```

### JSON Result-sets 

Queries return two different kinds of results, depending on the type of query you execute.  When you execute write statements, (such as `INSERT`, `DELETE` and `UPDATE`), the method returns a JSON object with the following properties:

* `affectedRows`: An integer listing the number of affected rows.
* `insertId`: An integer noting the auto-increment ID of the last row written to the table.
* `warningStatus`: An integer indicating whether the query ended with a warning.

```js
connection.query('CREATE TABLE animals (' +
                       'id MEDIUMINT NOT NULL AUTO_INCREMENT,' +
                       'name VARCHAR(30) NOT NULL,' +
                       'PRIMARY KEY (id))');
connection.query('INSERT INTO animals(name) value (?)', ['sea lions'])
    .then(res => {
      console.log(res); 
      //log : { affectedRows: 1, insertId: 1, warningStatus: 0 }
    })
    .catch(...);
```

### Array Result-sets 

When the query executes a `SELECT` statement, the method returns the result-set as an array.  Each value in the array is a returned row as a JSON object.  Additionally, the method returns a special `meta` array that contains the [column metadata](#column-metadata) information. 

The rows default to JSON objects, but two other formats are also possible with the `nestTables` and `rowsAsArray` options.

```javascript
connection.query('select * from animals')
    .then(res => {
      console.log(res); 
      // [ 
      //    { id: 1, name: 'sea lions' }, 
      //    { id: 2, name: 'bird' }, 
      //    meta: [ ... ]
      // ]
    });
```

### Query options

* [`timeout`](#timeout)
* [`namedPlaceholders`](#namedPlaceholders)
* [`typeCast`](#typeCast)
* [`rowsAsArray`](#rowsAsArray)
* [`nestTables`](#nestTables)
* [`dateStrings`](#dateStrings)
* [`supportBigNumbers`](#supportBigNumbers)
* [`bigNumberStrings`](#bigNumberStrings)

Those options can be set on the query level, but are usually set at the connection level, and will then apply to all queries. 


#### `timeout`

*number, timeout in ms*

This option is only permitted for MariaDB server >= 10.1.2. 

This set a timeout to query operation. 
Driver internally use `SET STATEMENT max_statement_time=<timeout> FOR <command>` permitting to cancel operation when timeout is reached, 

limitation: when use for multiple-queries (option `multipleStatements` set), only the first query will be timeout !!! 

Implementation of max_statement_time is engine dependent, so there might be some differences: For example, with Galera engine, a commits will ensure replication to other nodes to be done, possibly then exceeded timeout, to ensure proper server state. 


```javascript
//query that takes more than 20s
connection
  .query({sql: 'information_schema.tables, information_schema.tables as t2', timeout: 100 })
  .then(...)
  .catch(err => {
          // SqlError: (conn=2987, no: 1969, SQLState: 70100) Query execution was interrupted (max_statement_time exceeded)
          // sql: select * from information_schema.columns as c1, information_schema.tables, information_schema.tables as t2 - parameters:[]
          // at Object.module.exports.createError (C:\projets\mariadb-connector-nodejs.git\lib\misc\errors.js:55:10)
          // at PacketNodeEncoded.readError (C:\projets\mariadb-connector-nodejs.git\lib\io\packet.js:510:19)
          // at Query.readResponsePacket (C:\projets\mariadb-connector-nodejs.git\lib\cmd\resultset.js:46:28)
          // at PacketInputStream.receivePacketBasic (C:\projets\mariadb-connector-nodejs.git\lib\io\packet-input-stream.js:104:9)
          // at PacketInputStream.onData (C:\projets\mariadb-connector-nodejs.git\lib\io\packet-input-stream.js:160:20)
          // at Socket.emit (events.js:210:5)
          // at addChunk (_stream_readable.js:309:12)
          // at readableAddChunk (_stream_readable.js:290:11)
          // at Socket.Readable.push (_stream_readable.js:224:10)
          // at TCP.onStreamRead (internal/stream_base_commons.js:182:23) {
          //     fatal: true,
          //         errno: 1969,
          //         sqlState: '70100',
          //         code: 'ER_STATEMENT_TIMEOUT'
          // }
  });
```

#### `namedPlaceholders`

*boolean, default false*

While the recommended method is to use the question mark [placeholder](#placeholder), you can alternatively allow named placeholders by setting this query option.  Values given in the query must contain keys corresponding  to the placeholder names. 

```javascript
connection
  .query(
	{ namedPlaceholders: true, sql: "INSERT INTO someTable VALUES (:id, :img, :db)" },
	{ id: 1, img: Buffer.from("c327a97374", "hex"), db: "mariadb" }
  )
  .then(...)
  .catch(...);
```

#### `rowsAsArray`

*boolean, default false*

Using this option causes the Connector to format rows in the result-set  as arrays, rather than JSON objects.  Doing so allows you to save memory and avoid having the Connector parse [column metadata](#column-metadata) completely.  It is the fastest row format, (by 5-10%), with a local database.

Default format : `{ id: 1, name: 'sea lions' }`
with option `rowsAsArray` : `[ 1, 'sea lions' ]`

```javascript
connection.query({ rowsAsArray: true, sql: 'select * from animals' })
    .then(res => {
      console.log(res); 
      // [ 
      //    [ 1, 'sea lions' ], 
      //    [ 2, 'bird' ],
      //    meta: [...]
      // ]
    });
```

#### `nestTables`

*boolean / string, default false*

Occasionally, you may have issue with queries that return columns with the **same** name.  The standard JSON format does not permit key duplication.  To get around this, you can set the `nestTables` option to `true`.  This causes the Connector to group data by table.  When using string parameters, it prefixes the JSON field name with the table name and the `nestTables` value.

For instance, when using a boolean value:

```javascript
connection.query({nestTables:true, 
                sql:'select a.name, a.id, b.name from animals a, animals b where b.id=1'})
    .then(res => {
      console.log(res); 
      //[ 
      //  { 
      //     a: { name: 'sea lions', id: 1 }, 
      //     b: { name: 'sea lions' } 
      //  },
      //  { 
      //     a: { name: 'bird', id: 2 }, 
      //     b: { name: 'sea lions' } 
      //  },
      //  meta: [...]
      //]
    });
```

Alternatively, using a string value:

```javascript
connection.query({nestTables: '_', 
                sql:'select a.name, a.id, b.name from animals a, animals b where b.id=1'})
    .then(res => {
      console.log(res); 
      //[ 
      //  { a_name: 'sea lions', a_id: 1, b_name: 'sea lions' }, 
      //  { a_name: 'bird', a_id: 2, b_name: 'sea lions' },
      //  meta: [...]
      //]
    });
```

#### `dateStrings`

*boolean, default: false*

Whether you want the Connector to retrieve date values as strings, rather than `Date` objects.


#### `supportBigNumbers`

*boolean, default: false*

Whether the query should return integers as [`Long`](https://www.npmjs.com/package/long) objects when they are not in the [safe](documentation/connection-options.md#support-for-big-integer) range.


#### `bigNumberStrings`

*boolean, default: false*

Whether the query should return integers as strings when they are not in the [safe](documentation/connection-options.md#support-for-big-integer) range.


#### `typeCast`

*Experimental*

*function(column, next)*

In the event that you need certain values returned as a different type, you can use this function to cast the value into that type yourself.

For instance, casting all `TINYINT(1)` values as boolean values:

```javascript
const tinyToBoolean = (column, next) => {
  if (column.type == "TINY" && column.length === 1) {
    const val = column.int();
    return val === null ? null : val === 1;
  }
  return next();
};
connection.query({typeCast: tinyToBoolean, sql:"..."});
```

### Column Metadata

* `collation`: Object indicates the column collation.  It has the properties: `index`, `name`, `encoding`, and `maxlen`.  For instance, `33, "UTF8_GENERAL_CI", "utf8", 3`
* `columnLength`: Shows the column's maximum length if there's a limit and `0` if there is no limit, (such as with a `BLOB` column).
* `type`: 
Shows the column type as an integer value.  For more information on the relevant values, see	[`field-type.js`](/lib/const/field-type.js)
* `columnType`: Shows the column type as a string value.  For more information on the relevant values, see	[`field-type.js`](/lib/const/field-type.js)
* `scale`: Provides the decimal part length.
* `flags`: Shows the byte-encoded flags.  For more information, see [`field-detail.js`](/lib/const/field-detail.js).
* `db()`: Name of the database schema.    You can also retrieve this using `schema()`.
* `table()`: Table alias.
* `orgTable()`: Real table name.
* `name()`: Column alias. 
* `orgName()`: Real column name.

```js
connection
  .query("SELECT 1, 'a'")
  .then(rows => {
	console.log(rows);
	// [ 
	//   { '1': 1, a: 'a' },
	//   meta: [ 
	//     { 
	//       collation: [Object],
	//       columnLength: 1,
	//       columnType: 8,
	//       scale: 0,
	//       type: 'LONGLONG',
	//       flags: 129,
	//       db: [Function],
	//       schema: [Function],
	//       table: [Function],
	//       orgTable: [Function],
	//       name: [Function],
	//       orgName: [Function] 
	//     },
	//     { 
	//       collation: [Object],
	//       columnLength: 4,
	//       columnType: 253,
	//       scale: 39,
	//       type: 'VAR_STRING',
	//       flags: 1,
	//       db: [Function],
	//       schema: [Function],
	//       table: [Function],
	//       orgTable: [Function],
	//       name: [Function],
	//       orgName: [Function] 
	//     } 
	//   ] 
	// ]
	assert.equal(rows.length, 1);
  })
```


## `connection.queryStream(sql[, values]) → Emitter`

> * `sql`: *string | JSON* SQL string value or JSON object to supersede default connections options.  JSON objects must have an `"sql"` property.  For instance, `{ dateStrings: true, sql: 'SELECT now()' }`
> * `values`: *array | object* Defines placeholder values. This is usually an array, but in cases of only one placeholder, it can be given as a string. 
>
> Returns an Emitter object that emits different types of events:
> * error : Emits an [`Error`](#error) object when the query fails. (No `"end"` event will then be emitted).
> * columns : Emits when column metadata from the result-set are received (the parameter is an array of [Metadata](#metadata-field) fields).
> * data : Emits each time a row is received (parameter is a row). 
> * end : Emits when the query ends (no parameter). 

When using the `query()` method, documented above, the Connector returns the entire result-set with all its data in a single call.  While this is fine for queries that return small result-sets, it can grow unmanageable in cases of huge result-sets.  Instead of retrieving all of the data into memory, you can use the `queryStream()` method, which uses the event drive architecture to process rows one by one, which allows you to avoid putting too much strain on memory.

Query times and result handlers take the same amount of time, but you may want to consider updating the [`net_read_timeout`](https://mariadb.com/kb/en/library/server-system-variables/#net_read_timeout) server system variable.  The query must be totally received before this timeout, which defaults to 30 seconds.


There is 2 differents methods to implement streaming:

* Events

```javascript
connection.queryStream("SELECT * FROM mysql.user")
      .on("error", err => {
        console.log(err); //if error
      })
      .on("fields", meta => {
        console.log(meta); // [ ...]
      })
      .on("data", row => {
        console.log(row);
      })
      .on("end", () => {
        //ended
      });
```

* streams

Note that queryStream produced Object data, so Transform/Writable implementation must be created with [`objectMode`](https://nodejs.org/api/stream.html#stream_object_mode) set to true.<br/>  
(example use [`stream.pipeline`](https://nodejs.org/api/stream.html#stream_stream_pipeline_streams_callback) only available since Node.js 10)

```javascript
const stream = require("stream");
const fs = require("fs");

//...create connection...

const someWriterStream = fs.createWriteStream("./someFile.txt");

const transformStream = new stream.Transform({
  objectMode: true,
  transform: function transformer(chunk, encoding, callback) {
    callback(null, JSON.stringify(chunk));
  }
});

const queryStream = connection.queryStream("SELECT * FROM mysql.user");

stream.pipeline(queryStream, transformStream, someWriterStream);

```


## `connection.batch(sql, values) → Promise`

> * `sql`: *string | JSON* SQL string value or JSON object to supersede default connections options.  JSON objects must have an `"sql"` property.  For instance, `{ dateStrings: true, sql: 'SELECT now()' }`
> * `values`: *array* Array of parameter (array of array or array of object if using named placeholders). 
>
> Returns a promise that :
> * resolves with a JSON object.
> * rejects with an [Error](#error).

Implementation depend of server type and version. 
for MariaDB server version 10.2.7+, implementation use dedicated bulk protocol. 

For other, insert queries will be rewritten for optimization.
example:
insert into ab (i) values (?) with first batch values = 1, second = 2 will be rewritten
insert into ab (i) values (1), (2). 

If query cannot be re-writen will execute a query for each values.

result difference compared to execute multiple single query insert is that only first generated insert id will be returned. 

For instance,

```javascript
  connection.query(
    "CREATE TEMPORARY TABLE batchExample(id int, id2 int, id3 int, t varchar(128), id4 int)"
  );
  connection
    .batch("INSERT INTO `batchExample` values (1, ?, 2, ?, 3)", [[1, "john"], [2, "jack"]])
    .then(res => {
      console.log(res.affectedRows); // 2
    });

```

## `connection.beginTransaction() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Begins a new transaction.

## `connection.commit() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Commits the current transaction, if there is one active.  The Connector tracks the current transaction state on the server.  In the event that you issue the `commit()` method when there's no active transaction, it ignores the method and sends no commands to MariaDB. 


## `connection.rollback() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Rolls back the current transaction, if there is one active.  The Connector tracks the current transaction state on the server.  In the event that you issue the `rollback()` method when there's no active transaction, it ignores the method and sends no commands to MariaDB. 

```javascript
conn.beginTransaction()
  .then(() => {
    conn.query("INSERT INTO testTransaction values ('test')");
    return conn.query("INSERT INTO testTransaction values ('test2')");
  })
  .then(() => {
    conn.commit();
  })
  .catch((err) => {
    conn.rollback();
  })
```
 
## `connection.changeUser(options) → Promise`

> * `options`: *JSON*, subset of [connection option documentation](#connection-options) = database / charset / password / user
>
> Returns a promise that :
>   * resolves without result
>   * rejects with an [Error](#error).

Resets the connection and re-authorizes it using the given credentials.  It is the equivalent of creating a new connection with a new user, reusing the open socket.

```javascript
conn.changeUser({user: 'changeUser', password: 'mypassword'})
   .then(() => {
      //connection user is now changed. 
   })
   .catch(err => {
      //error
   });
```

## `connection.ping() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Sends a packet to the database containing one byte to check that the connection is still active.

```javascript
conn.ping()
  .then(() => {
    //connection is valid
  })
  .catch(err => {
    //connection is closed
  })
```

## `connection.reset() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

reset the connection. Reset will:

   * rollback any open transaction
   * reset transaction isolation level
   * reset session variables
   * delete user variables
   * remove temporary tables
   * remove all PREPARE statement
   
This command is only available for MariaDB >=10.2.4 or MySQL >= 5.7.3.
function will be rejected with error "Reset command not permitted for server XXX" if version doesn't permit reset.

For previous MariaDB version, reset connection can be done using [`connection.changeUser(options) → Promise`](#connectionchangeuseroptions--promise) that do the same + redo authentication phase.   

## `connection.isValid() → boolean`

> Returns a boolean

Indicates the connection state as the Connector knows it.  If it returns false, there is an issue with the connection, such as the socket disconnected without the Connector knowing about it.

## `connection.end() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Closes the connection gracefully, after waiting for any currently executing queries to finish.

```javascript
conn.end()
  .then(() => {
    //connection has ended properly
  })
  .catch(err => {
    //connection was closed but not due of current end command
  })
```


## `connection.destroy()`

Closes the connection without waiting for any currently executing queries.  These queries are interrupted.  MariaDB logs the event as an unexpected socket close.

```javascript
conn.query(
  "select * from information_schema.columns as c1, " +
   "information_schema.tables, information_schema.tables as t2"
)
.then(rows => {
  //won't occur
})
.catch(err => {
  console.log(err);
  //Error: Connection destroyed, command was killed
  //    ...
  //  fatal: true,
  //  errno: 45004,
  //  sqlState: '08S01',
  //  code: 'ER_CMD_NOT_EXECUTED_DESTROYED' 
  done();
});
conn.destroy(); //will immediately close the connection, even if query above would have take a minute
```

## `connection.escape(value) → String`

This function permit to escape a parameter properly according to parameter type to avoid injection. 
See [mariadb String literals](https://mariadb.com/kb/en/library/string-literals/) for escaping. 

Escaping has some limitation :
- doesn't permit [Stream](https://nodejs.org/api/stream.html#stream_readable_streams) parameters
- this is less efficient compare to using standard conn.query(), that will stream data to socket, avoiding string concatenation and using memory unnecessary     

escape per type:
* boolean: explicit `true` or `false`
* number: string representation. ex: 123 => '123'
* Date: String representation using `YYYY-MM-DD HH:mm:ss.SSS` format
* Buffer: _binary'<escaped buffer>'
* object with toSqlString function: String escaped result of toSqlString
* Array: list of escaped value. ex: `[true, "o'o"]` => `('true', 'o\'o')` 
* geoJson: MariaDB transformation to corresponding geotype. ex: `{ type: 'Point', coordinates: [20, 10] }` => `"ST_PointFromText('POINT(20 10)')"`
* JSON: Stringification of JSON, or if `permitSetMultiParamEntries` is enable, key escaped as identifier + value
* String: escaped value, (\u0000, ', ", \b, \n, \r, \t, \u001A, and \ characters are escaped with '\')   

Escape is done for [sql_mode](https://mariadb.com/kb/en/library/sql-mode/) value without NO_BACKSLASH_ESCAPES that disable \ escaping (default);  
Escaping API are meant to prevent [SQL injection](https://en.wikipedia.org/wiki/SQL_injection). However, privilege the use of [`connection.query(sql[, values]) → Promise`](#connectionquerysql-values---promise) and avoid building the command manually.   

```javascript
const myColVar = "let'go";
const myTable = "table:a"
const cmd = 'SELECT * FROM ' + conn.escapeId(myTable) + ' where myCol = ' + conn.escape(myColVar);
// cmd value will be:
// "SELECT * FROM `table:a` where myCol = 'let\\'s go'"
```

## `connection.escapeId(value) → String`

This function permit to escape a Identifier properly . See [Identifier Names](https://mariadb.com/kb/en/library/identifier-names/) for escaping. 
Value will be enclosed by '`' character if content doesn't satisfy: 
* ASCII: [0-9,a-z,A-Z$_] (numerals 0-9, basic Latin letters, both lowercase and uppercase, dollar sign, underscore)
* Extended: U+0080 .. U+FFFF
and escaping '`' character if needed. 


```javascript
const myColVar = "let'go";
const myTable = "table:a"
const cmd = 'SELECT * FROM ' + conn.escapeId(myTable) + ' where myCol = ' + conn.escape(myColVar);
// cmd value will be:
// "SELECT * FROM `table:a` where myCol = 'let\\'s go'"
// using template literals:
con.query(`SELECT * FROM ${con.escapeId(myTable)} where myCol = ?`, [myColVar])
  .then(res => { ... })
  .catch(err=> { ... }); 
```


## `connection.pause()`

Pauses data reads.

## `connection.resume()`

Resumes data reads from a pause. 


## `connection.serverVersion()` 

> Returns a string 

Retrieves the version of the currently connected server.  Throws an error when not connected to a server.

```javascript
  console.log(connection.serverVersion()); //10.2.14-MariaDB
```

## `Error`

When the Connector encounters an error, Promise returns an [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error) object.  In addition to the standard properties, this object has the following properties:
* `fatal`: A boolean value indicating whether the connection remains valid.
* `errno`: The error number. 
* `sqlState`: The SQL state code.
* `code`: The error code.

Example on `console.log(error)`: 
```
{ Error: (conn=116, no: 1146, SQLState: 42S02) Table 'testn.falsetable' doesn't exist
  sql: INSERT INTO falseTable(t1, t2, t3, t4, t5) values (?, ?, ?, ?, ?)  - parameters:[1,0x01ff,'hh','01/01/2001 00:00:00.000',null]
      ...
      at Socket.Readable.push (_stream_readable.js:134:10)
      at TCP.onread (net.js:559:20)
    From event:
      at C:\mariadb-connector-nodejs\lib\connection.js:185:29
      at Connection.query (C:\mariadb-connector-nodejs\lib\connection.js:183:12)
      at Context.<anonymous> (C:\mariadb-connector-nodejs\test\integration\test-error.js:250:8)
    fatal: false,
    errno: 1146,
    sqlState: '42S02',
    code: 'ER_NO_SUCH_TABLE' } }
```

Errors contain an error stack, query and parameter values (the length of which is limited to 1,024 characters, by default).  To retrieve the initial stack trace (shown as `From event...` in the example above), you must have the Connection option `trace` enabled.

For more information on error numbers and SQL state signification, see the [MariaDB Error Code](https://mariadb.com/kb/en/library/mariadb-error-codes/) documentation.


## `events`

Connection object that inherits from the Node.js [`EventEmitter`](https://nodejs.org/api/events.html).  Emits an error event when the connection closes unexpectedly.

```javascript
const mariadb = require('mariadb');
mariadb.createConnection({user: 'root', password: 'myPwd', host: 'localhost', socketTimeout: 100})
.then(conn => {
conn.on('error', err => {
  //will be executed after 100ms due to inactivity, socket has closed. 
  console.log(err);
  //log : 
  //{ Error: (conn=6283, no: 45026, SQLState: 08S01) socket timeout
  //    ...
  //    at Socket.emit (events.js:208:7)
  //    at Socket._onTimeout (net.js:410:8)
  //    at ontimeout (timers.js:498:11)
  //    at tryOnTimeout (timers.js:323:5)
  //    at Timer.listOnTimeout (timers.js:290:5)
  //  fatal: true,
  //  errno: 45026,
  //  sqlState: '08S01',
  //  code: 'ER_SOCKET_TIMEOUT' }
});
})
.catch(done);
```


# Pool API

Each time a connection is asked, if the pool contains a connection that is not used, the pool will validate the connection, 
exchanging an empty MySQL packet with the server to ensure the connection state, then give the connection. 
The pool reuses connection intensively, so this validation is done only if a connection has not been used for a period 
(specified by the "minDelayValidation" option with the default value of 500ms).

If no connection is available, the request for a connection will be put in a queue until connection timeout. 
When a connection is available (new creation or released to the pool), it will be used to satisfy queued requests in FIFO order.

When a connection is given back to the pool, any remaining transactions will be rolled back.

## `pool.getConnection() → Promise`

>
> Returns a promise that :
> * resolves with a [Connection](#connection-api) object,
> * raises an [Error](#error).

Creates a new [Connection](#connection-api) object with an additional release method. 
Calling connection.release() will give back connection to pool.  

Connection must be given back to pool using this connection.release() method.

**Example:**

```javascript
const mariadb = require('mariadb');
const pool = mariadb.createPool({ host: 'mydb.com', user:'myUser' });
pool.getConnection()
    .then(conn => {
      console.log("connected ! connection id is " + conn.threadId);
      conn.release(); //release to pool
    })
    .catch(err => {
      console.log("not connected due to error: " + err);
    });
```

## `pool.query(sql[, values])` -> `Promise`

> * `sql`: *string | JSON* SQL string or JSON object to supersede default connection options.  When using JSON object, object must have an "sql" key. For instance, `{ dateStrings: true, sql: 'SELECT now()' }`
> * `values`: *array | object* Placeholder values. Usually an array, but in cases of only one placeholder, it can be given as is. 
>
> Returns a promise that :
> * resolves with a JSON object for update/insert/delete or a [result-set](#result-set-array) object for result-set.
> * rejects with an [Error](#error).

This is a shortcut to get a connection from pool, execute a query and release connection.

```javascript
const mariadb = require('mariadb');
const pool = mariadb.createPool({ host: 'mydb.com', user:'myUser' });
pool
   .query("SELECT NOW()")
   .then(rows => {
    console.log(rows); //[ { 'NOW()': 2018-07-02T17:06:38.000Z }, meta: [ ... ] ]
   })
   .catch(err => {
    //handle error
   });
```

## `pool.batch(sql, values) -> Promise`

> * `sql`: *string | JSON* SQL string or JSON object to supersede default connection options.  When using JSON object, object must have an "sql" key. For instance, `{ dateStrings: true, sql: 'SELECT now()' }`
> * `values`: *array* array of Placeholder values. Usually an array of array, but in cases of only one placeholder per value, it can be given as a single array. 
>
> Returns a promise that :
> * resolves with a JSON object.
> * rejects with an [Error](#error).

This is a shortcut to get a connection from pool, execute a batch and release connection.

```javascript
const mariadb = require('mariadb');
const pool = mariadb.createPool({ host: 'mydb.com', user:'myUser' });
pool.query(
  "CREATE TABLE parse(autoId int not null primary key auto_increment, c1 int, c2 int, c3 int, c4 varchar(128), c5 int)"
);
pool
  .batch("INSERT INTO `parse`(c1,c2,c3,c4,c5) values (1, ?, 2, ?, 3)", 
    [[1, "john"], [2, "jack"]])
  .then(res => {
    //res = { affectedRows: 2, insertId: 1, warningStatus: 0 }

    assert.equal(res.affectedRows, 2);
    pool
      .query("select * from `parse`")
      .then(res => {
        /*
        res = [ 
            { autoId: 1, c1: 1, c2: 1, c3: 2, c4: 'john', c5: 3 },
            { autoId: 2, c1: 1, c2: 2, c3: 2, c4: 'jack', c5: 3 },
            meta: ...
          }
        */ 
      })
      .catch(done);
  });
```

## `pool.end() → Promise`

>Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Closes the pool and underlying connections gracefully.

```javascript
pool.end()
  .then(() => {
    //connections have been ended properly
  })
  .catch(err => {});
```

## `pool.escape(value) → String`
This is an alias for [`connection.escape(value) → String`](#connectionescapevalue--string) to escape parameters

## `pool.escapeId(value) → String` 
This is an alias for [`connection.escapeId(value) → String`](#connectionescapeidvalue--string) to escape Identifier

## Pool events

|event|description|
|---:|---|
| **`acquire`** | This event emits a connection is acquired from pool.  |
| **`connection`** | This event is emitted when a new connection is added to the pool. Has a connection object parameter |
| **`enqueue`** | This event is emitted when a command cannot be satisfied immediately by the pool and is queued. |
| **`release`** | This event is emitted when a connection is released back into the pool. Has a connection object parameter|

**Example:**

```javascript
pool.on('connection', (conn) => console.log(`connection ${conn.threadId} has been created in pool`);
```

# Pool cluster API

Cluster handle multiple pools according to patterns and handle failover / distributed load (round robin / random / ordered ).

## `poolCluster.add(id, config)`

> * `id`: *string* node identifier. example : 'master'
> * `config`: *JSON* [pool options](#pool-options) to create pool. 
>

Add a new Pool to cluster.

**Example:**

```javascript
const mariadb = require('mariadb');
const cluster = mariadb.createPoolCluster();
cluster.add("master", { host: 'mydb1.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1", { host: 'mydb2.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave2", { host: 'mydb3.com', user: 'myUser', connectionLimit: 5 });
```

## `poolCluster.remove(pattern)`

> * `pattern`: *string* regex pattern to select pools. Example, `"slave*"`
>
remove and end pool(s) configured in cluster.


## `poolCluster.end() → Promise`

> Returns a promise that :
>  * resolves (no argument)
>  * rejects with an [Error](#error).

Closes the pool cluster and underlying pools.

```javascript
poolCluster.end()
  .then(() => {
    //pools have been ended properly
  })
  .catch(err => {});
```



## `poolCluster.getConnection(pattern, selector) → Promise`

> * `pattern`:  *string* regex pattern to select pools. Example, `"slave*"`. default `'*'`
> * `selector`: *string* pools selector. Can be 'RR' (round-robin), 'RANDOM' or 'ORDER' (use in sequence = always use first pools unless fails). default to the  
> 
> Returns a promise that :
> * resolves with a [Connection](#connection-api) object,
> * raises an [Error](#error).

Creates a new [Connection](#connection-api) object.
Connection must be given back to pool with the connection.end() method.

**Example:**

```javascript
const mariadb = require('mariadb');
const cluster = mariadb.createPoolCluster();
cluster.add("master", { host: 'mydb1.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1", { host: 'mydb2.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave2", { host: 'mydb3.com', user: 'myUser', connectionLimit: 5 });
cluster.getConnection("slave*")
```

## `poolCluster events`

PoolCluster object inherits from the Node.js [`EventEmitter`](https://nodejs.org/api/events.html). 
Emits 'remove' event when a node is removed from configuration if the option `removeNodeErrorCount` is defined 
(default to 5) and connector fails to connect more than `removeNodeErrorCount` times. 
(if other nodes are present, each attemps will wait for value of the option `restoreNodeTimeout`)

```javascript
const mariadb = require('mariadb');
const cluster = mariadb.createPoolCluster({ removeNodeErrorCount: 20, restoreNodeTimeout: 5000 });
cluster.add("master", { host: 'mydb1.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1", { host: 'mydb2.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave2", { host: 'mydb3.com', user: 'myUser', connectionLimit: 5 });
cluster.on('remove', node => {
  console.log(`node ${node} was removed`);
})
```

## `poolCluster.of(pattern, selector) → FilteredPoolCluster`

> * `pattern`:  *string* regex pattern to select pools. Example, `"slave*"`. default `'*'`
> * `selector`: *string* pools selector. Can be 'RR' (round-robin), 'RANDOM' or 'ORDER' (use in sequence = always use first pools unless fails). default to the  
>
> Returns :
> * resolves with a [filtered pool cluster](#filteredpoolcluster) object,
> * raises an [Error](#error).

Creates a new [filtered pool cluster](#filteredpoolcluster) object that is a subset of cluster.


**Example:**

```javascript
const mariadb = require('mariadb');

const cluster = mariadb.createPoolCluster();
cluster.add("master-north", { host: 'mydb1.com', user: 'myUser', connectionLimit: 5 });
cluster.add("master-south", { host: 'mydb2.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1-north", { host: 'mydb3.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave2-north", { host: 'mydb4.com', user: 'myUser', connectionLimit: 5 });
cluster.add("slave1-south", { host: 'mydb5.com', user: 'myUser', connectionLimit: 5 });

const masterCluster = cluster.of('master*');
const northSlaves = cluster.of(/^slave?-north/, 'RANDOM');
northSlaves.getConnection()
  .then(conn => {
    //use that connection
  })
```

### `filtered pool cluster`

* `filteredPoolCluster.getConnection() → Promise` : Creates a new connection from pools that corresponds to pattern .
* `filteredPoolCluster.query(sql[, values]) → Promise` : this is a shortcut to get a connection from pools that corresponds to pattern, execute a query and release connection.

