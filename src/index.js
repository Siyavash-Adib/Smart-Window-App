console.clear();

const toolBox = require('./toolBox.js');
const menuControl = require('./menuControl.js');
const appTest = require('./appTest.js');
const config = require('./config.js');
const wifiCom = require('./wifiCom.js');
__Debug_toolBox = toolBox;
__Debug_menuControl = menuControl;
__Debug_wifiCom = wifiCom;

// if('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('./serviceWorker.js')
//       .then(reg => {
//         console.log('Registered! 😎', reg);
//       })
//       .catch(err => {
//         console.log('😢 Registeration failed: ', err);
//       });
//   })
// }

let wifiRequestFailCounter = 0;

let appState = {
  current: 'idle',
  next: 'idle',
  step: 0,
}
__Debug_appState = appState;

let appUIRequest = {
  pending: false,
}

let deviceResponse = {
  pending: false,
  status: 'failed',
  packet: null,
}

let tempDevicesStatus = [];
let tempDevicesStatusCounter=  0;
let latestDevicesStatus = null;
let appSelectedWindowCard = null;
let pendingForResponseThreadTimer = threadTimerFactoryFunc();

function threadTimerFactoryFunc() {
  let newThread = {
    interval: 0,
    
    timePassed() {
      return (this.interval <= toolBox.getTick())
    },
    
    setNextInterval(nextInterval) {
      this.interval = toolBox.getTick() + nextInterval;
    },
  }

  return newThread;
}

function uiEventsHandler(event) {
  console.log('uiEvent:', event);

  switch(event.sourceType) {
    case '.nav-bar--item':
      switch(event.eventName) {
        case 'Home':
          menuControl.goToPage('.home-page');
          break;
        
        case 'Status':
          menuControl.goToPage('.status-page');
          break;
        
        case 'Settings':
          menuControl.goToPage('.settings-page');
          break;
        
        case 'Remove':
          menuControl.opendialog('yesNo', {
            text: 'Do you want to remove this window ?'
          });
          console.log(event.eventName);
          break;
        
        case 'Advance':
          console.log(event.eventName);
          break;
        
        default:
          break;
      }
      break;

    case '.window-card':
      switch(event.eventName) {
        case 'goToSettingsButton':
          menuControl.emptyPage('.settings-page');
          menuControl.goToPage('.settings-page');
          appSelectedWindowCard = event.windowId;
          appRefreshSettingsPage();
          break;

        case 'closeButton':
          wifiCom.sendCommandPacket('Close', {
            windowId: event.windowId
          });
          break;

        case 'openButton':
          wifiCom.sendCommandPacket('Open', {
            windowId: event.windowId
          });
          break;

        default:
          break;
      }
      break;

    case '.dialog-2':
      switch(event.eventName) {
        case 'dialogButtonCancle':
          menuControl.closeDialog();
          break;

        case 'dialogButtonSubmit':
          switch(event.setting.name) {
            case 'Do you want to remove this window ?':
              wifiCom.sendCommandPacket('removeWindow', {
                windowId: appSelectedWindowCard
              });
              break;
            
            default: 
              throw new Error(`"${event.setting.name}" is unknown.`);
              break;
          }
          break;
        
        default:
          break;
      }
      break;

    case '.dialog-1':
    case '.dialog-3':
      let skipSendCommandPacketAtTheEnd = false;

      switch(event.eventName) {
        case 'dialogButtonCancle':
          menuControl.closeDialog();
          break;
        
        case 'dialogButtonSubmit':
          const convertValueToArray = (format, size) => {
            if(format === 'array') {
              // TBD
            } else {
              event.setting.value = toolBox.numToByteArray(
                event.setting.value,
                format
              );
            }
          }

          switch(event.setting.name) {
            case 'Enter the Device ID of the New Window':
              event.setting.value = toolBox.fromHexString(
                event.setting.value
              );
              if(event.setting.value.legnth > 6) {
                event.setting.value = event.setting.value.slice(0, 6);
              }
              wifiCom.sendCommandPacket('addWindow', {
                setting: event.setting,
              });
              skipSendCommandPacketAtTheEnd = true;
              break;

            case 'Relay Latch Time':
            case 'Jack And Window Movement Time Gap':
            case 'Speed Monitoring Process Time Interval':
            case 'Motor 1 Speed 1 Min Expected Speed':
            case 'Motor 1 Speed 2 Min Expected Speed':
            case 'Motor 1 Speed Rise Time':
            case 'Window Lock Time':
            case 'Window Unlock Time':
            case 'Window Length':
            case 'Remote Debounce Time':
            case 'Motor Driver 1 PWM Frequency':
            case 'Motor Driver 2 PWM Frequency':
              event.setting.value = parseInt(event.setting.value);
              convertValueToArray('uint32');
              break;

            case 'Window Closed Proximity Percentage':
            case 'Driver 1 Strength Percentage':
            case 'Driver 2 Strength Percentage':
            case 'Window Speed Level 1':
            case 'Window Speed Level 2':
            case 'Window Slow Speed Area Percentage':
              event.setting.value = parseInt(event.setting.value);
              convertValueToArray('uint8');
              break;

            case 'Motor 1 Reversed':
            case 'Motor 2 Reversed':
            case 'Motor Driver 1 PWM Inverted':
            case 'Motor Driver 2 PWM Inverted':
              event.setting.value = event.setting.value === 'No' ? 0 : 1;
              convertValueToArray('uint8');
              break;

            case 'Network Mode':
              event.setting.value =
                event.setting.value === 'Network_Mode_Master' ? 0 : 1;
              convertValueToArray('uint8');
              break;
              
            case 'Wifi Mode Server SSID':
            case 'Wifi Mode Server PASS':
            case 'Wifi Mode Client SSID':
            case 'Wifi Mode Client PASS':
            case 'Device Name':
              event.setting.value = toolBox.stringToAsciiArray(
                event.setting.value
              );
              while(event.setting.value.length !== 25) {
                event.setting.value.push(0);
              }
              break;

            default:
              const getSensorNumber = () => {
                return event.setting.name.match(/(?<=Sensor\()\d*(?=\))/);
              }
              if(/Sensor\(\d+\)/.test(event.setting.name)) {
                let sensorNum = parseInt(getSensorNumber());

                console.log('event.setting.value', event.setting.value);
                if(/Normal Value/.test(event.setting.name)) {
                  event.setting.value = [
                    sensorNum,
                    0, /* Sensor Parameter */
                    config.app.BSP_GPIO_PIN_STATE.indexOf(
                      event.setting.value
                    )
                  ];
                } else if(/Open Close Time Gap/.test(event.setting.name)) {
                  convertValueToArray('uint32');
                  event.setting.value = [
                    sensorNum,
                    1, /* Sensor Parameter */
                    ...event.setting.value
                  ];
                } else if(/Trigger Event/.test(event.setting.name)) {
                  event.setting.value = [
                    sensorNum,
                    2, /* Sensor Parameter */
                    config.app.SENSOR_INPUT_EVENT.indexOf(
                      event.setting.value
                    )
                  ];
                }

                event.setting.name = 'Sensor Input Configs';

                console.log('sensorNum', sensorNum);
                console.log(event.setting.value);
              } else {
                throw new Error(`"${event.setting.name}" is unknown.`);
              }
              break;
          }
        
          if(skipSendCommandPacketAtTheEnd) {

          } else {
            wifiCom.sendCommandPacket('setSetting', {
              windowId: appSelectedWindowCard,
              setting: event.setting,
            });
          }
          break;

        default:
          break;
      }
      break;

    case '.central-window--network-card':
      switch(event.eventName) {
        case 'openAllWindowsButton':
          wifiCom.sendCommandPacket('OpenAll');
          break;

        case 'closeAllWindowsButton':
          wifiCom.sendCommandPacket('CloseAll');
          break;

        case 'addNewWindowButton':
          menuControl.opendialog('text', {
            text: "Enter the Device ID of the New Window",
            placeHolder: "Example: " + "123456ABCDEF",
          });
          break;
  
        default:
          break;
      }
      break;

    case '.setting-card':
      switch(event.eventName) {
        case 'settingCardEdit':
          switch(event.settingName) {
            case 'Motor 1 Reversed':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'Yes',
                  'No',
                ],
              });
              break;

            case 'Motor 2 Reversed':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'Yes',
                  'No',
                ],
              });
              break;
              
            case 'Motor Driver 1 PWM Inverted':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'Yes',
                  'No',
                ],
              });
              break;

            case 'Motor Driver 2 PWM Inverted':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'Yes',
                  'No',
                ],
              });
              break;

            case 'Network Mode':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'Network_Mode_Master',
                  'Network_Mode_Slave',
                ],
              });
              break;

            case 'Sensor(0) Normal Value':
            case 'Sensor(1) Normal Value':
            case 'Sensor(2) Normal Value':
            case 'Sensor(3) Normal Value':
            case 'Sensor(4) Normal Value':
            case 'Sensor(5) Normal Value':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  'IO Low',
                  'IO High',
                ],
              });
              break;

            case 'Sensor(0) Trigger Event':
            case 'Sensor(1) Trigger Event':
            case 'Sensor(2) Trigger Event':
            case 'Sensor(3) Trigger Event':
            case 'Sensor(4) Trigger Event':
            case 'Sensor(5) Trigger Event':
              menuControl.opendialog('select', {
                text: event.settingName,
                selectOptions: [
                  ...config.app.SENSOR_INPUT_EVENT
                ],
              });
              break;

            default:
              menuControl.opendialog('text', {
                text: event.settingName,
                placeHolder: "Example: " + event.settingValue,
              });
              break;
          }
          break;

        default:
          break;
      }
      break;
      
    default:
      break;
  }
}

function queueAppStateMachineTick(nextInterval) {
  setTimeout(() => {
      appStateMachineTick(false);
    },
    nextInterval
  );
}

function appInit() {
  menuControl.init(uiEventsHandler);
  // appTest.init();

  queueAppStateMachineTick(1000 / config.app.NETWORK_UPDATES_PER_SECOND);
}

function appStateMachineGoToState(newState) {
  appState.current = newState;
  appState.step = 0;
}

function appStateMachineHandleFailure() {

}

function moveSensorInputConfigsToEndOfArray(settingsObjectEntries) {
  let indexOfSensorInputConfigs = null;
  for(let i = 0; i < settingsObjectEntries.length; i++) {
    if(settingsObjectEntries[i][0] === 'Sensor_Input_Configs') {
      indexOfSensorInputConfigs = i;
      break;
    }
  }
  const Sensor_Input_Configs = settingsObjectEntries
    .splice(indexOfSensorInputConfigs, 1);
    
  settingsObjectEntries.push(...Sensor_Input_Configs);
}

function appRefreshSettingsPage() {
  const addOrUpdateSettingCard = (name, value, editable) => {
    if(menuControl.hasSettingCard(name)) {
      menuControl.updateSettingCard(
        name,
        value,
        editable
      );
    } else {
      menuControl.addNewSettingCard(
        name,
        value,
        editable
      );
    }
  }
  
  const addOrUpdateStatusCard = (name, value) => {
    if(menuControl.hasStatusCard(name)) {
      menuControl.updateStatusCard(
        name,
        value
      );
    } else {
      menuControl.addNewStatusCard(
        name,
        value
      );
    }
  }

  let selectedWindow = latestDevicesStatus.find((device) => {
    return device.settings.Device_ID.value === appSelectedWindowCard;
  });

  const settingsObjectEntries = Object.entries(selectedWindow.settings);
  moveSensorInputConfigsToEndOfArray(settingsObjectEntries);

  settingsObjectEntries.forEach(([key, value]) => {
    let settingName = key.split('_').join(' ');
    let settingValue = value.value;
    let settingEditable = value.editable;
    
    switch(settingName) {
      case 'Sensor Input Configs':
        let count = 0;
        settingValue.forEach((sensorConfig) => {
          addOrUpdateSettingCard(
            `Sensor(${count}) Normal Value`,
            sensorConfig.Normal_Value,
            settingEditable
          );
          addOrUpdateSettingCard(
            `Sensor(${count}) Open Close Time Gap`,
            sensorConfig.Open_Close_Time_Gap,
            settingEditable
          );
          addOrUpdateSettingCard(
            `Sensor(${count}) Trigger Event`,
            sensorConfig.Trigger_Event,
            settingEditable
          );
          count++;
        });
        break;

      default:
        addOrUpdateSettingCard(
          settingName,
          settingValue,
          settingEditable
        );
        break;
    }
  });

  const statusObjectEntries = Object.entries(selectedWindow.status);

  statusObjectEntries.forEach(([key, value]) => {
    let statusName = key.split('_').join(' ');
    let statusValue = value;
    
    switch(statusName) {
      case 'Sensor Input State':
        let count = 0;
        statusValue.forEach((sensorInputState) => {
          addOrUpdateStatusCard(
            `Sensor(${count}) Input State`,
            sensorInputState
          );
          count++;
        });
        break;

      default:
        addOrUpdateStatusCard(
          statusName,
          statusValue
        );
        break;
    }
  });
}

function appRefreshHomePage() {
  if(latestDevicesStatus === null) {
    return;
  }

  let newWindowIDs = new Set();
  let removedWindowIDs = new Set();
  let currentWindowIDs = menuControl.getAllWindowIDs();
  // console.log('currentWindowIDs', currentWindowIDs);
  let feedbackWindowIDs = latestDevicesStatus
    .map((device) => {
      return device.settings.Device_ID.value;
    });
  // console.log('feedbackWindowIDs', feedbackWindowIDs);
  feedbackWindowIDs = new Set(feedbackWindowIDs);

  for(id of feedbackWindowIDs) {
    if(currentWindowIDs.has(id)) {
      // nothing
    } else {
      newWindowIDs.add(id);
    }
  }
  // console.log('newWindowIDs', newWindowIDs);

  for(id of currentWindowIDs) {
    if(feedbackWindowIDs.has(id)) {
      // nothing
    } else {
      removedWindowIDs.add(id);
    }
  }

  for(id of removedWindowIDs) {
    menuControl.removeWindowCard(id);
  }

  let firstDevice = true;
  latestDevicesStatus.forEach((device) => {
    if(newWindowIDs.has(device.settings.Device_ID.value)) {
      menuControl.addNewWindowCard(
        device.settings.Device_Name.value,
        device.settings.Device_ID.value,
        firstDevice
      );
    }
    menuControl.setWindowCardName(
      device.settings.Device_ID.value,
      device.settings.Device_Name.value
    );
    menuControl.setWindowCardBatteryPercentage(
      device.settings.Device_ID.value,
      device.status.Battery_Percentage
    );
    if(device.settings.Window_Length.value) {
      menuControl.setWindowCardDoorClosePercentage(
        device.settings.Device_ID.value,
        100 * device.status.Encoder_Value / device.settings.Window_Length.value
      );
    } else {
      menuControl.setWindowCardDoorClosePercentage(
        device.settings.Device_ID.value,
        0
      );
    }
    if(device.status.Responding) {
      menuControl.windowGoOnline(device.settings.Device_ID.value);
    } else {
      menuControl.windowGoOffline(device.settings.Device_ID.value);
    }
    
    menuControl.setWindowLockState(
      device.settings.Device_ID.value,
      device.status.Window_Locked === 'Yes'
    );

    firstDevice = false;
  });

  let numOfWindows = latestDevicesStatus.length;
  let numOfOnlineWindows = latestDevicesStatus
    .reduce((counter, device) => {
      if(device.status.Responding) {
        return counter + 1;
      } else {
        return counter;
      }
    }, 0);

    menuControl.setNetworkOnlineWindows(
      numOfOnlineWindows,
      numOfWindows
    );
}

function allWindowsGoOffline() {
  if(latestDevicesStatus) {
    latestDevicesStatus.forEach((device) => {
      menuControl.windowGoOffline(device.settings.Device_ID.value);
    })
  }
}

function appStateMachineTick(consoleDebugMessages=false) {
  if(consoleDebugMessages) {
    console.log('Start ----------------------------------');
    console.log(appState);
  }

  let instantReTick = false;

  switch(appState.current) {
    case 'idle':
      if(appUIRequest.pending) {
        appUIRequest.pending = false;
        // ????
      } else {
        appStateMachineGoToState('request device status');
        instantReTick = true;
      }
      break;

    case 'request device status':
      switch(appState.step) {
        case 0:
          tempDevicesStatus = [];
          for(let i = 0; i < config.app.MAX_NETWORK_SIZE; i++) {
            tempDevicesStatus.push(null);
          }
          tempDevicesStatusCounter = 0;

          instantReTick = true;
          appState.step++;
          break;
          
        case 1:
          /* dummy packet for debugging Begin ↓ *********************************/
            // deviceResponse.pending = true;
            // deviceResponse.status = 'succeeded';
            // deviceResponse.packet = {
            //   type: 'device status',
            //   deviceStatus: appTest.generateNewDeviceStatus(tempDevicesStatusCounter)
            // };
          /* dummy packet for debugging End   ↑ *********************************/

          pendingForResponseThreadTimer.setNextInterval(
            config.app.MAX_PENDING_FOR_RESPONSE_TIME
          );
          wifiCom.requestDeviceStatus(tempDevicesStatusCounter, (requestResult) => {
            deviceResponse = requestResult;
          });

          instantReTick = true;
          appState.step++;
          break;

        case 2:
          instantReTick = true;
          if(deviceResponse.pending) {
            switch(deviceResponse.status) {
              case 'failed':
                console.log('WiFi request failed, going back to idle state');
                wifiRequestFailCounter++;
                if(wifiRequestFailCounter >= config.app.WIFI_MAX_REQUEST_FAILS) {
                  allWindowsGoOffline();
                }
                appStateMachineGoToState('idle');
                break;

              case 'succeeded':
                wifiRequestFailCounter = 0;
                // console.log('request response received,', toolBox.getTick() / 1000);
                if(deviceResponse.packet.type !== 'device status') {
                  console.log('why are we getting a \'device status\' response ?!?!?!');
                } else {
                  if(deviceResponse.packet.deviceStatus.status.emptySlot === true) {
                    latestDevicesStatus = toolBox.deepClone(
                      tempDevicesStatus
                    );
                    latestDevicesStatus = latestDevicesStatus
                      .filter(device => (device !== null));
                    appState.step++;
                    // console.log(`slot ${tempDevicesStatusCounter} is empty`);
                    // console.log('latestDevicesStatus', latestDevicesStatus);
                    // console.log('step ahead');
                  } else {
                    if(deviceResponse.packet.deviceStatus.status
                        .Window_Index !== tempDevicesStatusCounter) {
                      
                        console.log('Wrong window index, going back to idle');
                        console.log(`Received ${deviceResponse.packet.deviceStatus.status.Window_Index}`);
                        console.log(`Expected ${tempDevicesStatusCounter}`);
                        // console.log('Going back to waiting for all requests expiration');
                        // appStateMachineGoToState('waiting for all requests expiration');
                    } else {
                      tempDevicesStatus[tempDevicesStatusCounter] = toolBox.deepClone(
                        deviceResponse.packet.deviceStatus
                      );
                      // console.log(`new device[${tempDevicesStatusCounter}] id:`, deviceResponse.packet.deviceStatus.settings.Device_ID)
  
                      tempDevicesStatusCounter++;
                      appState.step--;
                      // console.log('step back, new slot is', tempDevicesStatusCounter);
                    }
                  }
                }
                break;

              default:
                appStateMachineHandleFailure('wrong deviceResponse.status');
                break;
            }
            deviceResponse = {};
          } else if (pendingForResponseThreadTimer.timePassed()) {
            // console.log('step 2');
            // console.log('deviceResponse =', deviceResponse);
            // console.log('no response received', toolBox.getTick() / 1000);
            
            appState.step--;
            // console.log('step back,', tempDevicesStatusCounter);
          }
          break;

        case 3:
          switch(menuControl.getCurrentPage()) {
            case '.home-page':
              appRefreshHomePage();
              break;
            
            case '.settings-page':
              appRefreshSettingsPage();
              break;
            
            default:
              break;
          }
          appStateMachineGoToState('idle');
          break;

        default:
          appStateMachineHandleFailure('wrong appState.step');
      }
      break;

    case 'waiting for all requests expiration':
      switch(appState.step) {
        case 0:
          pendingForResponseThreadTimer.setNextInterval(
            config.app.MAX_PENDING_FOR_RESPONSE_TIME * 5
          );
          appState.step++;
          break;

        case 1:
          if(pendingForResponseThreadTimer.timePassed()) {
            console.log('Waiting for all requests expiration passed');
            console.log('Going back to idle');
            appStateMachineGoToState('idle');
          }
          break;

        default:
          appStateMachineHandleFailure('wrong appState.step');
          break;
      }
      break;

    default:
      appStateMachineHandleFailure('wrong appState.step');
      break;
  }
  
  if(consoleDebugMessages) {
    console.log(appState);
    console.log('End ----------------------------------');
  }

  if(instantReTick) {
    queueAppStateMachineTick(0)
    // appStateMachineTick(consoleDebugMessages);
  } else {
    queueAppStateMachineTick(1000 / config.app.NETWORK_UPDATES_PER_SECOND);
  }
}

__Debug_appStateMachineTick = appStateMachineTick;

appInit();

