import 'source-map-support/register';
import streams from 'web-stream-tools';


import {
  config,
  initWorker,
  key,
  message as _message,
  encrypt,
  decrypt,
} from 'openpgp';

// initialise openpgpjs
function initOpenPgp() {
  config.show_version = false;
  config.show_comment = false;
  config.allow_unauthenticated_stream = true;
  initWorker({});
}

export async function encryptStream(inStream) {
  initOpenPgp();

  const openpgpPrivateKey = await key.read(Buffer.from(process.env.BASE64ENCODEDPRIVATEKEY, 'base64'));

  const options = {
    message: _message.fromBinary(inStream),
    publicKeys: openpgpPrivateKey.keys,
    armor: false,
    streaming: 'node',
  };

  const { message } = await encrypt(options);

  const encrypted = message.packets.write();

  return streams.webToNode(encrypted);
}

export async function decryptStream(inStream) {
  initOpenPgp();

  const openpgpPrivateKey = await key.read(Buffer.from(process.env.BASE64ENCODEDPRIVATEKEY, 'base64'));

  const options = {
    message: await _message.read(inStream),
    privateKeys: openpgpPrivateKey.keys,
    armor: false,
    streaming: 'node',
    format: 'binary',
  };

  const { data } = await decrypt(options);
  return data;
}
