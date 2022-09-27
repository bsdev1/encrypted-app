import cryptoJS from 'crypto-js';
import axios from 'axios';

const request = axios.create({
  baseURL: `${process.env.VUE_APP_BACKEND}/api`,
  withCredentials: true
});

function encrypt(data, encryptKey) {
  return cryptoJS.AES.encrypt(JSON.stringify(data), encryptKey).toString();
}

function decrypt(data, decryptKey) {
  try {
    const dataBytes = cryptoJS.AES.decrypt(data.toString(), decryptKey);
    const decryptedData = dataBytes.toString(cryptoJS.enc.Utf8);
    if(decryptedData) return JSON.parse(decryptedData);
  } catch {
    return null;
  }
}

function concatArrayBuffers(bufs) {
  let offset = 0, bytes = 0;
  bufs.map(buf => {
    bytes += buf.byteLength;
    return buf;
  });

  var buffer = new ArrayBuffer(bytes);
  var store = new Uint8Array(buffer);

  bufs.forEach(buf => {
    store.set(new Uint8Array(buf.buffer || buf, buf.byteOffset), offset);
    offset += buf.byteLength;
  });

  return buffer;
}

function appendBuffer(appendBuffer, buffer) {
  const array = new Uint8Array(appendBuffer.byteLength + buffer.byteLength);
  array.set(new Uint8Array(appendBuffer), 0);
  array.set(new Uint8Array(buffer), appendBuffer.byteLength);
  return array;
}

export { request, encrypt, decrypt, concatArrayBuffers, appendBuffer };