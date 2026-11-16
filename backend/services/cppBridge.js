const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';
const defaultWinEngine = path.resolve(__dirname, '../../cpp-data-structures/build/ConnectHubEngine.exe');
const defaultLinuxEngine = path.resolve(__dirname, '../../cpp-data-structures/build/ConnectHubEngine');

const ENGINE_PATH = process.env.CPP_ENGINE_PATH || (isWin ? defaultWinEngine : defaultLinuxEngine);

/**
 * Execute a command against the C++ ConnectHubEngine executable.
 * @param {string} action - action name (e.g. 'tree_get', 'graph_bfs', etc.)
 * @param {Array<string|number>} args - arguments
 * @returns {Promise<any>} parsed JSON response from C++ engine
 */
function executeCppAction(action, args = []) {
  return new Promise((resolve, reject) => {
    const stringArgs = [action, ...args.map(a => String(a))];

    execFile(ENGINE_PATH, stringArgs, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[C++ Bridge Error] action: ${action}:`, stderr || error.message);
        return reject(new Error(stderr || error.message));
      }

      try {
        const result = JSON.parse(stdout.trim());
        if (!result.success) {
          return reject(new Error(result.error || 'C++ Engine operation failed'));
        }
        resolve(result.data);
      } catch (parseErr) {
        console.error(`[C++ Bridge JSON Parse Error]:`, stdout);
        reject(new Error(`Failed to parse C++ engine output: ${parseErr.message}`));
      }
    });
  });
}

module.exports = {
  executeCppAction,
  ENGINE_PATH
};
