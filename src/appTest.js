const menuControl = require('./menuControl.js');
const toolBox = require('./toolBox.js');

let testIDCounter = 0;

function init() {
  if(1) {
    menuControl.addNewWindowCard(
      `Central Window`,
      `Central Window`,
      true
    );
    menuControl.setWindowCardBatteryPercentage(
      `Central Window`,
      toolBox.randomRange(0, 100)
    );
    menuControl.setWindowCardDoorClosePercentage(
      `Central Window`,
      toolBox.randomRange(0, 100)
    );
  }

  if(1) {
    const TEST_NUM_OF_SLAVE_WINDOW_CARDS = 4;

    for(let i = 0; i < (TEST_NUM_OF_SLAVE_WINDOW_CARDS); i++) {
      if(i > (TEST_NUM_OF_SLAVE_WINDOW_CARDS / 2)) {
        menuControl.addNewWindowCard(
          `Window number ${i}`,
          `Window number ${i}`
        );
        menuControl.windowGoOffline(`Window number ${i}`);
      } else {
        menuControl.addNewWindowCard(
          `Window number ${i}`,
          `Window number ${i}`
        );
        menuControl.windowGoOnline(`Window number ${i}`);
      }
      
      menuControl.setWindowCardBatteryPercentage(
        `Window number ${i}`,
        ((i + 1) / TEST_NUM_OF_SLAVE_WINDOW_CARDS) * 100);
      menuControl.setWindowCardDoorClosePercentage(
        `Window number ${i}`,
        ((i + 1) / TEST_NUM_OF_SLAVE_WINDOW_CARDS) * 100);
    }
  }

  if(1) {
    const TEST_NUM_OF_SETTING_CARDS = 5;
    
    for(let i = 0; i < (TEST_NUM_OF_SETTING_CARDS); i++) {
      menuControl.addNewSettingCard(
        `Setting ${i}`,
        `Random: ${toolBox.randomRange(0, 100)}`
      );
    }
  }
}

function generateNewDeviceStatus(deviceId) {
  return {
    settings: {
      Relay_Latch_Time: 15,
      Jack_And_Window_Movement_Time_Gap: 1000,
      Speed_Monitoring_Process_Time_Interval: 10,
      Motor_1_Speed_1_Min_Expected_Speed: 500,
      Motor_1_Speed_2_Min_Expected_Speed: 1000,
      Motor_1_Speed_Rise_Time: 500,
      Window_Lock_Time: 500,
      Window_Unlock_Time: 500,
      Window_Length: 8500,
      Window_Closed_Proximity_Percentage: 5,
      Driver_1_Strength_Percentage: 100,
      Driver_2_Strength_Percentage: 100,
      Motor_1_Reversed: 0,
      Motor_2_Reversed: 0,
      Window_Speed_Level_1: 40,
      Window_Speed_Level_2: 80,
      Window_Slow_Speed_Area_Percentage: 20,
      Remote_Debounce_Time: 500,
      Motor_Driver_1_PWM_Frequency: 100,
      Motor_Driver_2_PWM_Frequency: 100,
      Motor_Driver_1_PWM_Inverted: 1,
      Motor_Driver_2_PWM_Inverted: 1,
      Sensor_Input_Configs: [0, 0, 0, 0, 0, 0],
      Network_Mode: 'Master',
      Wifi_Server_SSID: 'Smart Window',
      Wifi_Server_PASS: 'Smart Window 123',
      Wifi_Client_SSID: 'Smart Window',
      Wifi_Client_PASS: 'Smart Window 123',
      Device_ID: `${deviceId}`,
      // Device_ID: testIDCounter++,
      Device_Name: `Window # ${toolBox.randomRange(0, 100)}`,
    },

    status: {
      Encoder_Value: toolBox.randomRange(0, 8500),
      Blockage_Detected: 0,
      Window_Locked: 0,
      Window_State: 0,
      Window_Control_State: 0,
      Lock_Control_State: 0,
      Window_Position_Unknown: 0,
      Sensor_Input_State: [0, 0, 0, 0, 0, 0],
      Vin_Filtered: 24,
      VBAT_Filtered: 20,
      Responding: toolBox.randomRange(0, 100) < 95 ? true : false,
      Battery_Percentage: toolBox.randomRange(0, 100),
    }
  }
}

module.exports = {
  init,
  generateNewDeviceStatus,
}

