const CHUNK_SIZE = 1024 * 512;
const AES_PADDING = 16;
const INITIALIZATION_VECTOR = 12;
const MESSAGES_PAGINATION_NUMBER = 12;

const MAXIMUM_CHUNK_SIZE = CHUNK_SIZE + AES_PADDING + INITIALIZATION_VECTOR;

const EXPIRE_TIMES = ['1m', '5m', '10m', '30m', '1h', '3h', '6h', '12h', '24h'];

const time = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
};

function convertToMs(expireTime) {
  let milliseconds = 0;

  if (expireTime.endsWith('m')) {
    const [minutes] = expireTime.split('m');

    milliseconds = minutes * time.minute;
  } else if (expireTime.endsWith('h')) {
    const [hours] = expireTime.split('h');

    milliseconds = hours * time.hour;
  }

  return milliseconds;
}

function msToReadeableTime(ms) {
  let minutes = Math.floor((ms / (1000 * 60)) % 60);
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  let time = '';

  if (hours > 0) {
    time += hours + ' hrs';
    ms -= hours * (1000 * 60 * 60);
  } else if (hours == 0 && minutes == 0) {
    time = 24 + ' hrs';
  } else if (minutes > 0) {
    time += minutes + ' min';
    ms -= minutes * (1000 * 60);
  }

  return time;
}

module.exports = {
  CHUNK_SIZE,
  AES_PADDING,
  INITIALIZATION_VECTOR,
  MAXIMUM_CHUNK_SIZE,
  MESSAGES_PAGINATION_NUMBER,
  EXPIRE_TIMES,
  convertToMs,
  msToReadeableTime,
};
