const toolBox = require('./toolBox.js');
const config = require('./config.js');

function sendPacketToCenterNode(
  packetCommand,
  packetData=[],
  responseCallbackHandler,
  failedCallbackHandler,
) {
  let requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  const TXPacket = [packetCommand, ...packetData];

  let CRC = 0x00;
  TXPacket.forEach(byte => {
    CRC ^= byte;
  });
  TXPacket.push(CRC);

  let TXPacketString = toolBox.toHexString(TXPacket);

  switch(packetCommand) {
    // case 0:
    // case 1:
    // case 2:
    // case 3:
    // case 4:
    // case 5:
    // case 6:
    // case 7:
    // case 8:
    // case 9:
    // case 10:
    // case 11:
    // case 12:
    // case 13:
    // case 14:
    case 0xFF:
      console.log("Packet Data:", packetData);
      console.log("Transmitting Packet:", TXPacketString);
      break;
    
    default:
      break;
  }

  fetchWithTimeout(
    `http://${config.wifi.SERVER_IP}:80/packet?plain=${TXPacketString}`,
    config.app.MAX_PENDING_FOR_RESPONSE_TIME * 0.5,
    {
      ...requestOptions,
      cache: "no-store",
    }
  )
    .then(response => response.text())
    .then(result => {
      if(responseCallbackHandler) {
        responseCallbackHandler(result)
      }
    })
    .catch(error => {
      if(failedCallbackHandler) {
        failedCallbackHandler(error)
      }
    });
}

async function fetchWithTimeout(resource, timeoutMs, options = {}) {
  const { timeout = timeoutMs } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}

function requestDeviceStatus(windowIndex, requestResultHandler) {
  let requestResultHandlerFunction = requestResultHandler;
  setTimeout(() => {
    requestResultHandlerFunction = (Result) => {
      console.log('This request is expired');
      console.log('Result: ', Result);
    };
  }, config.app.MAX_PENDING_FOR_RESPONSE_TIME * 0.8);

  sendPacketToCenterNode(
    wifiCommandValue('WiFi_Command_Request_Network_Feedback'),
    [windowIndex],
    (result) => {
      result = toolBox.fromHexString(result);
      let CRCPassed = packetCRCCheck(result);

      let packetCommand = result[0];
      // let packetCRC = result[result.length - 1];
      let packetData = result.slice(1, result.length - 1);

      let deviceResponse = {};

      // let timeDiff = toolBox.getTick();
      if(!CRCPassed) {
        deviceResponse.status = 'failed';
        deviceResponse.packet = 'RX CRC Errored';
        deviceResponse.pending = true;
      } else {
        switch(config.wifi.WIFI_COMMAND[packetCommand]) {
          case 'WiFi_Command_Request_Network_Feedback':
            deviceResponse.status = 'succeeded';
            deviceResponse.packet = {
              type: 'device status',
              deviceStatus: extractDeviceStatusPacket(packetData),
            };
            // console.log('packetData:', packetData);
            deviceResponse.pending = true;
            break;
            
          case 'WiFi_Command_Error':
              switch(config.wifi.WIFI_PACKET_ERROR[packetData[0]]) {
                case 'WiFi_Packet_Error_CRC':
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_CRC';
                  break;
                case 'WiFi_Packet_Error_Data_Length':
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_Data_Length';
                  break;
                case 'WiFi_Packet_Error_Data':
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_Data';
                  break;
                case 'WiFi_Packet_Error_Empty_Slot':
                  deviceResponse.status = 'succeeded';
                  deviceResponse.packet = {
                    type: 'device status',
                    deviceStatus: {
                      status: {
                        emptySlot: true,
                      }
                    },
                  };
                  break;
                case 'WiFi_Packet_Error_Out_Of_Range_Slot':
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_Out_Of_Range_Slot';
                  break;

                case 'WiFi_Packet_Error_Command':
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_Command';
                  break;

                default:
                  deviceResponse.status = 'failed';
                  deviceResponse.packet = 'TX: WiFi_Packet_Error_Unknown';
                  break;
              }
              
              deviceResponse.pending = true;
              break;

          default:
            console.log('packetCommand', packetCommand);
            throw new Error(`Why did i end up here while checking, "toolBox.wifi.WIFI_COMMAND[packetCommand]" ?!?!`);
            break;
        }
      }
      // console.log('packet extraction time = ', timeDiff - toolBox.getTick())
      
      requestResultHandlerFunction(deviceResponse);

      // console.log(deviceResponse);
    },
    (error) => {
      let deviceResponse = {};

      deviceResponse.pending = true;
      deviceResponse.status = 'failed';
      deviceResponse.errorDescription = 'N/A';
      deviceResponse.packet = error;

      requestResultHandlerFunction(deviceResponse);

      // console.log('error', error);
      // console.log(deviceResponse);
    },
  );
}

function packetCRCCheck(packet) {
  let calcedChecksum = calcChechsum(packet.slice(0, packet.length - 1));
  let packetChecksum = packet[packet.length - 1];

  return calcedChecksum === packetChecksum;
}

function calcChechsum(arr) {
  return arr.reduce((CRC, currentVal) => {
    return CRC ^ currentVal;
  }, 0x00);
}

function extractDeviceStatusPacket(data) {
  let dataCopy = [...data];
  let deviceStatus = {};

  const extractDataBytes = (size) => {
    return dataCopy.splice(0, size);
  }

  const extractValueFromData = (size, format) => {
    if(format === 'array') {
      return extractDataBytes(size);
    } else {
      return toolBox.byteArrayToNum(
        extractDataBytes(size),
        format
      );
    }
  }

  const extractSensorInputConfigs = () => {
    let result = [];
    for(let i = 0; i < 6; i++) {
      result.push({
        Normal_Value: config.app.BSP_GPIO_PIN_STATE[
          extractValueFromData(4, 'uint8')
        ],
        Open_Close_Time_Gap: extractValueFromData(4, 'uint32'),
        Trigger_Event: config.app.SENSOR_INPUT_EVENT[
          extractValueFromData(4, 'uint8')
        ],
      });
    }
    return result;
  };

  const windowIndex = extractValueFromData(1, 'uint8');

  deviceStatus.settings = {
    Relay_Latch_Time: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Jack_And_Window_Movement_Time_Gap: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Speed_Monitoring_Process_Time_Interval: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_1_Speed_1_Min_Expected_Speed: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_1_Speed_2_Min_Expected_Speed: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_1_Speed_Rise_Time: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Window_Lock_Time: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Window_Unlock_Time: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Window_Length: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Window_Closed_Proximity_Percentage: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Driver_1_Strength_Percentage: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Driver_2_Strength_Percentage: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Motor_1_Reversed: {
      value: extractValueFromData(1, 'uint8') === 0 ? 'No' : 'Yes',
      editable: true,
    },
    Motor_2_Reversed: {
      value: extractValueFromData(1, 'uint8') === 0 ? 'No' : 'Yes',
      editable: true,
    },
    Window_Speed_Level_1: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Window_Speed_Level_2: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Window_Slow_Speed_Area_Percentage: {
      value: extractValueFromData(1, 'uint8'),
      editable: true,
    },
    Remote_Debounce_Time: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_Driver_1_PWM_Frequency: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_Driver_2_PWM_Frequency: {
      value: extractValueFromData(4, 'uint32'),
      editable: true,
    },
    Motor_Driver_1_PWM_Inverted: {
      value: extractValueFromData(4, 'uint32') === 0 ? 'No' : 'Yes',
      editable: true,
    },
    Motor_Driver_2_PWM_Inverted: {
      value: extractValueFromData(4, 'uint32') === 0 ? 'No' : 'Yes',
      editable: true,
    },
    Encoder_Inverted: {
      value: extractValueFromData(4, 'uint32') === 0 ? 'No' : 'Yes',
      editable: true,
    },
    Sensor_Input_Configs: {
      value: extractSensorInputConfigs(),
      editable: true,
    },
    Network_Mode: {
      value: extractValueFromData(1, 'uint8') === 0 ? 'Network_Mode_Master' : 'Network_Mode_Slave',
      editable: true,
    },
    Wifi_Mode_Server_SSID: {
      value: toolBox.asciiArrayToString(extractValueFromData(25, 'array')),
      editable: true,
    },
    Wifi_Mode_Server_PASS: {
      value: toolBox.asciiArrayToString(extractValueFromData(25, 'array')),
      editable: true,
    },
    Wifi_Mode_Client_SSID: {
      value: toolBox.asciiArrayToString(extractValueFromData(25, 'array')),
      editable: true,
    },
    Wifi_Mode_Client_PASS: {
      value: toolBox.asciiArrayToString(extractValueFromData(25, 'array')),
      editable: true,
    },
    Node_Mac_Address: {
      value: toolBox.toHexString(extractValueFromData(6, 'array')),
      editable: false,
    },
    Device_Name: {
      value: toolBox.asciiArrayToString(extractValueFromData(25, 'array')),
      editable: true,
    },
  }

  deviceStatus.status = {
    Window_Index: windowIndex,
    Encoder_Value: extractValueFromData(4, 'int32'),
    Motor_1_Current_Speed: extractValueFromData(4, 'int32'),
    Blockage_Detected: extractValueFromData(1, 'uint8') ? 'Yes' : 'No',
    Window_Locked: extractValueFromData(1, 'uint8') ? 'Yes' : 'No',
    Window_State: config.app.WINDOW_STATE[
      extractValueFromData(1, 'uint8')
    ],
    Window_Control_State: config.app.WINDOW_CONTROL_STATE[
      extractValueFromData(1, 'uint8')
    ],
    Lock_Control_State: config.app.LOCK_CONTROL_STATE[
      extractValueFromData(1, 'uint8')
    ],
    Window_Position_Unknown: extractValueFromData(1, 'uint8') ? 'Yes' : 'No',
    Sensor_Input_State: extractValueFromData(6, 'array')
      .map((num) => config.app.BSP_GPIO_PIN_STATE[num]),
    Vin_Filtered: toolBox.round(extractValueFromData(4, 'float'), 4),
    VBAT_Filtered: toolBox.round(extractValueFromData(4, 'float'), 4),
    Responding: extractValueFromData(1, 'uint8') === 1 ? true : false,
    Battery_Percentage: extractValueFromData(1, 'uint8'),
  }

  deviceStatus.settings.Device_ID = {
    value: "" + deviceStatus.settings.Node_Mac_Address.value,
    editable: false,
  }

  return deviceStatus;
}

function wifiCommandValue(wifiCommandStr) {
  return config.wifi.WIFI_COMMAND.findIndex((value) => {
    return value === wifiCommandStr;
  });
}

function setSettingIndex(settingStr) {
  settingStr = 'Setting_Set_' + settingStr;
  return config.wifi.SET_SETTING.findIndex((value) => {
    return value === settingStr;
  });
}

function sendCommandPacket(commandName, options) {
  commandName = commandName.toLowerCase();

  switch(commandName) {
    case 'open':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Window_Open'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;

    case 'close':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Window_Close'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;

    case 'openall':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_All_Windows_Open')
      );
      break;

    case 'closeall':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_All_Windows_Close')
      );
      break;

    case 'setsetting':
      console.log('setsetting options', options);
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Set_Setting'),
        [
          ...toolBox.fromHexString(options.windowId),
          setSettingIndex(options.setting.name.split(' ').join('_')),
          ...options.setting.value,
        ]
      );
      break;

    case 'removewindow':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Remove_Window'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;

    case 'addwindow':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Add_Window'),
        [...options.setting.value]
      );
      break;

    case 'moveforward':
      console.log('sending move forward');
      console.log('options', options);
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Move_Forward'),
        [
          ...toolBox.fromHexString(options.windowId),
          ...toolBox.numToByteArray(options.movementTime)
        ],
      );
      break;
        
    case 'stopmoving':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Stop_Moving'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;
        
    case 'movebackward':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Move_Backward'),
        [
          ...toolBox.fromHexString(options.windowId),
          ...toolBox.numToByteArray(options.movementTime)
        ],
      );
      break;
        
    case 'windowlock':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Window_Lock'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;
        
    case 'windowunlock':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Window_Unlock'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;
        
    case 'setzeroposition':
      sendPacketToCenterNode(
        wifiCommandValue('WiFi_Command_Set_Zero_Position'),
        [...toolBox.fromHexString(options.windowId)]
      );
      break;

    default:
      console.log(`sendCommandPacket: Unkown Command ${commandName}`);
      break;
  }
}

module.exports = {
  sendPacketToCenterNode,
  requestDeviceStatus,
  extractDeviceStatusPacket,
  sendCommandPacket,
  wifiCommandValue,
  setSettingIndex,
}

