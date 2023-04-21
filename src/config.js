module.exports = {
  menuControl: {
    CLICK_1_VOLUME: 0.2,
  },

  wifi: {
    WIFI_COMMAND: [
      'WiFi_Command_Request_Network_Feedback',
      'WiFi_Command_Window_Open',
      'WiFi_Command_Window_Close',
      'WiFi_Command_All_Windows_Open',
      'WiFi_Command_All_Windows_Close',
      'WiFi_Command_Set_Setting',
      'WiFi_Command_Remove_Window',
      'WiFi_Command_Add_Window',
      'WiFi_Command_Error',
    ],
    WIFI_PACKET_ERROR: [
      'WiFi_Packet_Error_CRC',
      'WiFi_Packet_Error_Data_Length',
      'WiFi_Packet_Error_Data',
      'WiFi_Packet_Error_Empty_Slot',
      'WiFi_Packet_Error_Out_Of_Range_Slot',
      'WiFi_Packet_Error_Command'
    ],
    SET_SETTING: [
      'Setting_Set_Relay_Latch_Time',
      'Setting_Set_Jack_And_Window_Movement_Time_Gap',
      'Setting_Set_Speed_Monitoring_Process_Time_Interval',
      'Setting_Set_Motor_1_Speed_1_Min_Expected_Speed',
      'Setting_Set_Motor_1_Speed_2_Min_Expected_Speed',
      'Setting_Set_Motor_1_Speed_Rise_Time',
      'Setting_Set_Window_Lock_Time',
      'Setting_Set_Window_Unlock_Time',
      'Setting_Set_Window_Length',
      'Setting_Set_Window_Closed_Proximity_Percentage',
      'Setting_Set_Driver_1_Strength_Percentage',
      'Setting_Set_Driver_2_Strength_Percentage',
      'Setting_Set_Motor_1_Reversed',
      'Setting_Set_Motor_2_Reversed',
      'Setting_Set_Window_Speed_Level_1',
      'Setting_Set_Window_Speed_Level_2',
      'Setting_Set_Window_Slow_Speed_Area_Percentage',
      'Setting_Set_Remote_Debounce_Time',
      'Setting_Set_Motor_Driver_1_PWM_Frequency',
      'Setting_Set_Motor_Driver_2_PWM_Frequency',
      'Setting_Set_Motor_Driver_1_PWM_Inverted',
      'Setting_Set_Motor_Driver_2_PWM_Inverted',
      'Setting_Set_Sensor_Input_Configs',
      'Setting_Set_Network_Mode',
      'Setting_Set_Wifi_Mode_Server_SSID',
      'Setting_Set_Wifi_Mode_Server_PASS',
      'Setting_Set_Wifi_Mode_Client_SSID',
      'Setting_Set_Wifi_Mode_Client_PASS',
      'Setting_Set_Device_Name'
    ],

    // SERVER_IP: "192.168.4.1",
    // SERVER_IP: "192.168.1.119",
    SERVER_IP: "192.168.137.230",
  },

  app: {
    WIFI_MAX_REQUEST_FAILS: 3,
    NETWORK_UPDATES_PER_SECOND: 1,
    MAX_NETWORK_SIZE: 10,
    MAX_PENDING_FOR_RESPONSE_TIME: 400,
    BSP_GPIO_PIN_STATE: [
      'IO Low',
      'IO High'
    ],
    NETWORK_MODE: [
      'Network Mode Master',
      'Network Mode Slave'
    ],
    SENSOR_INPUT_EVENT: [
      'Request Window Open',
      'Request Window Close',
      'Request Window Open Then Close',
      'Request Window Close Then Open',
      'Request Window Toggle State'
    ],
    WINDOW_CONTROL_STATE: [
      'State Idle',
      'State Executing PC Command',
      'State Emergency Stop',
      'State Openning The Window',
      'State Closing The Window'
    ],
    LOCK_CONTROL_STATE: [
      'State Neutral',
      'State Locking',
      'State Unlocking'
    ],
    WINDOW_STATE: [
      'State Open',
      'State Closed',
      'State Stopped',
      'State Moving'
    ],
    SPEED_MODE: [
      'Speed Mode Dual',
      'Speed Mode Slow',
      'Speed Mode Fast'
    ],
    // WINDOW_DEVICE_SYSTEM_PARAMETERS: {
    //   Relay_Latch_Time:                       {size: 4, editable: true, type: 'uint32'},
    //   Jack_And_Window_Movement_Time_Gap:      {size: 4, editable: true, type: 'uint32'},
    //   Speed_Monitoring_Process_Time_Interval: {size: 4, editable: true, type: 'uint32'},
    //   Motor_1_Speed_1_Min_Expected_Speed:     {size: 4, editable: true, type: 'uint32'},
    //   Motor_1_Speed_2_Min_Expected_Speed:     {size: 4, editable: true, type: 'uint32'},
    //   Motor_1_Speed_Rise_Time:                {size: 4, editable: true, type: 'uint32'},
    //   Window_Lock_Time:                       {size: 4, editable: true, type: 'uint32'},
    //   Window_Closed_Proximity_Percentage:     {size: 1, editable: true, type: 'uint8'},
    //   Driver_1_Strength_Percentage:           {size: 1, editable: true, type: 'uint8'},
    //   Driver_2_Strength_Percentage:           {size: 1, editable: true, type: 'uint8'},
    //   Motor_1_Reversed:                       {size: 1, editable: true, type: 'uint8'},
    //   Motor_2_Reversed:                       {size: 1, editable: true, type: 'uint8'},
    //   Window_Speed_Level_1:                   {size: 1, editable: true, type: 'uint8'},
    //   Window_Speed_Level_2:                   {size: 1, editable: true, type: 'uint8'},
    //   Window_Slow_Speed_Area_Percentage:      {size: 1, editable: true, type: 'uint8'},
    //   Motor_Driver_1_PWM_Frequency:           {size: , editable: true, type: },
    //   Motor_Driver_2_PWM_Frequency:           {size: , editable: true, type: },
    //   Motor_Driver_1_PWM_Inverted:            {size: , editable: true, type: },
    //   Motor_Driver_2_PWM_Inverted:            {size: , editable: true, type: },
    //   Sensor_Input_Configs:                   {size: , editable: true, type: },
    //   Network_Mode:                           {size: , editable: true, type: },
    //   Wifi_Mode_Server_SSID:                  {size: , editable: true, type: },
    //   Wifi_Mode_Server_PASS:                  {size: , editable: true, type: },
    //   Wifi_Mode_Client_SSID:                  {size: , editable: true, type: },
    //   Wifi_Mode_Client_PASS:                  {size: , editable: true, type: },
    //   Node_Mac_Address:                       {size: , editable: false, type: },
    //   Device_Name:                            {size: , editable: true, type: },
    // },
  },
}