function randomRange(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mapValue(inValue, inMin, inMax, outMin, outMax) {
  return (inValue - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

function constrainValue(inValue, min, max) {
  if(inValue < min) {
    return min;
  }
  
  if(inValue > max) {
    return max;
  }
  
  return inValue;
}

function toHexString(byteArray, separator='') {
  return Array.from(byteArray, (byte) => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2).toUpperCase();
  }).join(separator)
}

function fromHexString(hexString, separator='') {
  hexString = hexString.split(separator).join('');
  
  return ([...Uint8Array.from(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  )]);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function array4ToFloat32(array4, littleEndian=true) {
  if(!littleEndian) {
    array4.reverse();
  }

  let uint8Array = new Uint8Array(array4);
  let result = (new Float32Array(uint8Array.buffer))[0];

  return result;
}

function float32ToArray4(float32, littleEndian=true) {
  let float32Buffer = new Float32Array([float32]);
  let resultArray = (new Uint8Array(float32Buffer.buffer));

  if(!littleEndian) {
    resultArray.reverse();
  }

  return [...resultArray];
}

function arrayToInt(arr, signed=false, littleEndian=true) {
  size = arr.length;
  let uint8Array = new Uint8Array(arr);
  let result;

  if(!littleEndian) {
    uint8Array.reverse();
  }
  
  if(signed) {
    if(size <= 1) {
      result = (new Int8Array(uint8Array.buffer))[0];
    } else if(size <= 2) {
      result = (new Int16Array(uint8Array.buffer))[0];
    } else if(size <= 4) {
      result = (new Int32Array(uint8Array.buffer))[0];
    } else if(size <= 8) {
      throw new Error(`"intToArray: size = ${size}", is not supported`);
    }
  } else {
    if(size <= 1) {
      result = (new Uint8Array(uint8Array.buffer))[0];
    } else if(size <= 2) {
      result = (new Uint16Array(uint8Array.buffer))[0];
    } else if(size <= 4) {
      result = (new Uint32Array(uint8Array.buffer))[0];
    } else if(size <= 8) {
      throw new Error(`"intToArray: size = ${size}", is not supported`);
    }
  }

  return result;
}

function intToArray(num, size, signed=false, littleEndian=true) {
  let refArray;
  let result;
  
  if(signed) {
    if(size <= 1) {
      refArray = new Int8Array([num]);
    } else if(size <= 2) {
      refArray = new Int16Array([num]);
    } else if(size <= 4) {
      refArray = new Int32Array([num]);
    } else if(size <= 8) {
      throw new Error(`"intToArray: size = ${size}", is not supported`);
    }
  } else {
    if(size <= 1) {
      refArray = new Uint8Array([num]);
    } else if(size <= 2) {
      refArray = new Uint16Array([num]);
    } else if(size <= 4) {
      refArray = new Uint32Array([num]);
    } else if(size <= 8) {
      throw new Error(`"intToArray: size = ${size}", is not supported`);
    }
  }

  result = new Uint8Array(refArray.buffer);

  if(!littleEndian) {
    result.reverse();
  }

  return [...result];
}

function byteArrayToNum(byteArray, type='uint32', littleEndian=true) {
  type = type.toLowerCase();
  let result = null;

  switch(type) {
    case 'uint64':
      result = arrayToInt(byteArray, false, littleEndian);
      break;

    case 'int64':
      result = arrayToInt(byteArray, true, littleEndian);
      break;
    
    case 'uint32':
      result = arrayToInt(byteArray, false, littleEndian);
      break;

    case 'int32':
      result = arrayToInt(byteArray, true, littleEndian);
      break;
      
    case 'uint16':
      result = arrayToInt(byteArray, false, littleEndian);
      break;

    case 'int16':
      result = arrayToInt(byteArray, true, littleEndian);
      break;
    
    case 'uint8':
      result = arrayToInt(byteArray, false, littleEndian);
      break;

    case 'int8':
      result = arrayToInt(byteArray, true, littleEndian);
      break;

    case 'float32':
    case 'float':
      result = array4ToFloat32(byteArray, littleEndian);
      break;

    default: throw new Error(`type "${type}" is unknown.`);
  }

  return result;
}

function numToByteArray(num, type='uint32', littleEndian=true) {
  type = type.toLowerCase();
  let result = null;

  switch(type) {
    case 'uint64':
      result = intToArray(num, 8, false, littleEndian);
      break;

    case 'int64':
      result = intToArray(num, 8, true, littleEndian);
      break;
      
    case 'uint32':
      result = intToArray(num, 4, false, littleEndian);
      break;

    case 'int32':
      result = intToArray(num, 4, true, littleEndian);
      break;
      
    case 'uint16':
      result = intToArray(num, 2, false, littleEndian);
      break;

    case 'int16':
      result = intToArray(num, 2, true, littleEndian);
      break;
      
    case 'uint8':
      result = intToArray(num, 1, false, littleEndian);
      break;

    case 'int8':
      result = intToArray(num, 1, true, littleEndian);
      break;

    case 'float32':
    case 'float':
      result = float32ToArray4(num, littleEndian);
      break;

    default: throw new Error(`type "${type}" is unknown.`);
  }

  return result;
}

function asciiArrayToString(array) {
  array.splice(array.indexOf(0));
  return String.fromCharCode(...array);
}

function stringToAsciiArray(str) {
  return str
    .split('')
    .map(char => char.charCodeAt(0));
}

function round(num, decimals=null) {
  if(decimals === null) {
    return Math.round(num);
  }

  return parseFloat(num.toFixed(decimals));
}

function getTick() {
  return (new Date().getTime());
}

function threadTimerFactoryFunc() {
  let newThread = {
    interval: 0,
    
    timePassed() {
      return (this.interval <= getTick())
    },
    
    setNextInterval(nextInterval) {
      this.interval = getTick() + nextInterval;
    },
  }

  return newThread;
}

module.exports = {
  randomRange,
  mapValue,
  constrainValue,
  toHexString,
  fromHexString,
  deepClone,
  array4ToFloat32,
  float32ToArray4,
  arrayToInt,
  intToArray,
  byteArrayToNum,
  numToByteArray,
  asciiArrayToString,
  stringToAsciiArray,
  round,
  getTick,
  threadTimerFactoryFunc,
};

