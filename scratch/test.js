const { Connection, Request } = require('tedious');

const config = {
  server: '103.217.85.79',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'topface'
    }
  },
  options: {
    database: 'SARP',
    encrypt: false,
    port: 1433,
    connectTimeout: 8000,
    requestTimeout: 8000
  }
};

const connection = new Connection(config);

connection.on('connect', (err) => {
  if (err) {
    console.log('Connection to 103.217.85.79 failed, trying 136.232.118.110...', err.message);
    config.server = '136.232.118.110';
    const conn2 = new Connection(config);
    conn2.on('connect', (err2) => {
      if (err2) {
        console.error('Connection to both servers failed:', err2.message);
        process.exit(1);
      }
      runQuery(conn2);
    });
    conn2.connect();
    return;
  }
  runQuery(connection);
});

connection.connect();

function runQuery(conn) {
  console.log('Connected to server:', conn.config.server);
  const query = 'SELECT TOP 1 * FROM Dis_vw_BarCodeData';
  const request = new Request(query, (err, rowCount, rows) => {
    if (err) {
      console.error('Query failed:', err);
    }
    conn.close();
    process.exit(0);
  });

  request.on('row', (columns) => {
    columns.forEach((column) => {
      console.log(`${column.metadata.colName}: ${column.value} (${typeof column.value})`);
    });
  });

  conn.execSql(request);
}
