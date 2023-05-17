const toolBox = require('./toolBox.js');
const config = require('./config.js');

const click1Audio = document.querySelector("#click-1"); 
const dialog1 = document.querySelector('.dialog-1');
const dialog2 = document.querySelector('.dialog-2');
const dialog3 = document.querySelector('.dialog-3');
let uiEventsHandler = null;
let currentPage = null;

function init(uiEventsHandlerCallback) {
  navBarInit();
  uiEventsHandler = uiEventsHandlerCallback;

  // goToPage('.home-page');
  goToPage('.settings-page');

  dialogsInit();

  document.querySelector('.control-panel--button-move-forward')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'move-forward'
      });
    });
  
  document.querySelector('.control-panel--button-stop-moving')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'stop-moving'
      });
    });
  
  document.querySelector('.control-panel--button-move-backward')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'move-backward'
      });
    });
  
  document.querySelector('.control-panel--button-window-lock')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'window-lock'
      });
    });
  
  document.querySelector('.control-panel--button-window-unlock')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'window-unlock'
      });
    });
  
  document.querySelector('.control-panel--button-set-zero-position')
    .addEventListener('click', (event) => {
      uiEventsHandler({
        sourceType: '.control-panel--button',
        eventName: 'set-zero-position'
      });
    });
}

function dialogsInit () {
  document.addEventListener('click', (event) => {
    if(event.target.classList.contains('dialog-1')) {
      closeDialog();
    }
  });
  
  document.addEventListener('click', (event) => {
    if(event.target.classList.contains('dialog-2')) {
      closeDialog();
    }
  });
  
  document.addEventListener('click', (event) => {
    if(event.target.classList.contains('dialog-3')) {
      closeDialog();
    }
  });

  addClickSoundToUIElements(dialog1);
  addClickEventToUIElements(dialog1, '.dialog-1');

  addClickSoundToUIElements(dialog2);
  addClickEventToUIElements(dialog2, '.dialog-2');

  addClickSoundToUIElements(dialog3);
  addClickEventToUIElements(dialog3, '.dialog-3');
}

function empySelectOptions(selectElement) {
  while(1) {
    let option = selectElement.querySelector('option');
    if(option) {
      selectElement.removeChild(option);
    } else {
      break;
    }
  }
}

function opendialog(type, options) {
  switch(type) {
    case 'select':
      document.querySelector('.dialog-3-card--name')
        .textContent = options.text;
      
      let selectElement = dialog3.querySelector('select');
      empySelectOptions(selectElement);

      options.selectOptions.forEach((optionValue) => {
        let option = document.createElement('option');
        option.value = optionValue;
        option.text = optionValue;   
        selectElement.add(option);
      })

      dialog3.showModal();
      break;

    case 'yesNo':
      document.querySelector('.dialog-2-card--name')
        .textContent = options.text;
      dialog2.showModal();
      break;

    case 'text':
      document.querySelector('.dialog-1-card--name')
        .textContent = options.text;
      document.querySelector('.dialog-1-card--input')
      .value = "";
      if(options.placeHolder !== null) {
        document.querySelector('.dialog-1-card--input')
        .placeholder = options.placeHolder;
      }
      dialog1.showModal();
      break;
  }
}

function closeDialog() {
  dialog1.close();
  dialog2.close();
  dialog3.close();
}

function addNewStatusCard(newStatusName, newSstatusValue) {
  const template = document.querySelector('#status-card-template');
  let clone = template.content.cloneNode(true);
  let statusCard = clone.querySelector(".status-card");
  statusCard.querySelector(".status-card--name")
    .textContent = newStatusName;
  statusCard.querySelector(".status-card--value")
    .textContent = newSstatusValue;
  statusCard.dataset.statusName = newStatusName;
  
  document.querySelector('.settings-page--content')
    .appendChild(clone);
}

function addNewSettingCard(newSettingName, newSettingValue, editable) {
  const template = document.querySelector('#setting-card-template');
  let clone = template.content.cloneNode(true);
  let settingCard = clone.querySelector(".setting-card");
  settingCard.querySelector(".setting-card--name")
    .textContent = newSettingName;
  settingCard.querySelector(".setting-card--value")
    .textContent = newSettingValue;
  settingCard.dataset.settingName = newSettingName;
  
  document.querySelector('.settings-page--content')
    .appendChild(clone);

  if(editable) {
    addClickSoundToUIElements(settingCard);
    addClickEventToUIElements(settingCard, '.setting-card');
  } else {
    removeSettingCardEditIcon(settingCard);
  }
}

function addNewWindowCard(
  windowName,
  windowId,
  windowIsCenttralWindow=false
) {
  let clone = null;
  let windowCard = null;
  let networkCard = null;

  if(windowIsCenttralWindow) {
    const template = document.querySelector('#central-window-template');
    clone = template.content.cloneNode(true);

    clone.querySelector('.central-window--window-card')
      .appendChild(
        document.querySelector('#window-card-template')
        .content.cloneNode(true)
      );
  } else {
    const template = document.querySelector('#window-card-template');
    clone = template.content.cloneNode(true);
    clone.querySelector('.window-card').classList.add('offline-window');
  }
  
  clone.querySelector(".window-card").classList.add('new-element-tmep-class');

  if(windowIsCenttralWindow) {
    windowCard = clone.querySelector('.window-card .window-card');
    networkCard = clone.querySelector('.central-window--network-card');
  } else {
    windowCard = clone.querySelector('.window-card');
  }

  clone.querySelector(`.window-card--room-name`)
  .textContent = windowName;

  windowCard.dataset.windowId = windowId;
  
  document.querySelector('.home-page--content')
    .appendChild(clone);

  addClickSoundToUIElements(windowCard);
  
  addClickEventToUIElements(windowCard, '.window-card');
  if(windowIsCenttralWindow) {
    addClickEventToUIElements(networkCard, '.central-window--network-card');
  }
}

function addClickEventToUIElements (parentElement, parentElementSelector) {
  // let parentType = parentElement.closest('.window-card');

  switch(parentElementSelector) {
    case '.window-card':
      addEventToNewElement(
        parentElement,
        '.window-card--buttons-open-button',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            windowId: parentElement.dataset.windowId,
            eventName: 'openButton'
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.window-card--buttons-close-button',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            windowId: parentElement.dataset.windowId,
            eventName: 'closeButton'
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.settings-icon',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            windowId: parentElement.dataset.windowId,
            eventName: 'goToSettingsButton'
          });
        }
      );
      break;

    case '.central-window--network-card':
      addEventToNewElement(
        parentElement,
        '.open-all-windows-button',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'openAllWindowsButton'
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.close-all-windows-button',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'closeAllWindowsButton'
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.add-new-window-button',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'addNewWindowButton'
          });
        }
      );
      break;

    case '.setting-card':
      addEventToNewElement(
        parentElement,
        '.setting-card--edit',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'settingCardEdit',
            settingName: parentElement.dataset.settingName,
            settingValue: parentElement
              .querySelector('.setting-card--value').textContent,
          });
        }
      );
      break;

    case '.dialog-1':
      addEventToNewElement(
        parentElement,
        '.dialog-1-card--button-cancle',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonCancle',
            dialogCard: parentElement,
            dialogNumber: 1,
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.dialog-1-card--button-submit',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonSubmit',
            dialogCard: parentElement,
            dialogNumber: 1,
            setting: {
              name: parentElement.querySelector('.dialog-1-card--name')
                .textContent,
              value: parentElement.querySelector('.dialog-1-card--input')
                .value,
            },
          });
        }
      );
      break;

    case '.dialog-2':
      addEventToNewElement(
        parentElement,
        '.dialog-2-card--button-cancle',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonCancle',
            dialogCard: parentElement,
            dialogNumber: 2,
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.dialog-2-card--button-submit',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonSubmit',
            dialogCard: parentElement,
            dialogNumber: 2,
            setting: {
              name: parentElement.querySelector('.dialog-2-card--name')
                .textContent,
            },
          });
        }
      );
      break;
      

    case '.dialog-3':
      addEventToNewElement(
        parentElement,
        '.dialog-3-card--button-cancle',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonCancle',
            dialogCard: parentElement,
            dialogNumber: 3,
          });
        }
      );
      
      addEventToNewElement(
        parentElement,
        '.dialog-3-card--button-submit',
        'click',
        () => {
          uiEventsHandler({
            sourceType: parentElementSelector,
            eventName: 'dialogButtonSubmit',
            dialogCard: parentElement,
            dialogNumber: 3,
            setting: {
              name: parentElement.querySelector('.dialog-3-card--name')
                .textContent,
              value: parentElement.querySelector('select').value,
            },
          });
        }
      );
      break;

    default:
      throw new Error(`"${parentElementSelector}" is unknown.`);
      break;
  }
}

function addClickSoundToUIElements (parentElement) {
  addEventToNewElement(
    parentElement,
    '[class*="interactive-ui-element"]',
    'click',
    () => {
      click1Audio.volume = config.menuControl.CLICK_1_VOLUME;
      click1Audio.play();
    }
  );
}

function addEventToNewElement (
  parentElement,
  selector,
  eventType,
  evenetCallback
) {
  addNewElementTempClass(parentElement);

  getNewElement().querySelectorAll(selector)
  .forEach((uiElement) => {
    uiElement.addEventListener(eventType, evenetCallback )
  });

  removeNewElementTempClass(parentElement);
}

function removeSettingCardEditIcon(parentElement) {
  addNewElementTempClass(parentElement);

  getNewElement().querySelectorAll('.setting-card--edit')
  .forEach((uiElement) => {
    uiElement.remove();
  });

  removeNewElementTempClass(parentElement);
}

function addNewElementTempClass (element) {
  element.classList.add('new-element-tmep-class');
}

function removeNewElementTempClass (element) {
  document.querySelectorAll('.new-element-tmep-class')
    .forEach(element => {
      element.classList.remove('new-element-tmep-class');
    })
}

function getNewElement () {
  return document.querySelector('.new-element-tmep-class');
}

function windowGoOnline(windowId) {
  getWindowDOMElement(windowId).classList.remove('offline-window');
  if(isCentralWindow(windowId)) {
    getCentralWindowParentDOMElement(windowId)
      .classList.remove('offline-window');
  }
}

function setWindowLockState(windowId, locked) {
  let windowDOMElement = getWindowDOMElement(windowId);
  if(locked) {
    windowDOMElement.dataset.lockState = 'locked'
  } else {
    windowDOMElement.dataset.lockState = 'unlocked'
  }
}

function setWindowBlockedState(windowId, blocked) {
  let windowDOMElement = getWindowDOMElement(windowId);
  if(isCentralWindow(windowId)) {
      windowDOMElement = getCentralWindowParentDOMElement(windowId);
  }
  if(blocked) {
    windowDOMElement.classList.add('window-blocked');
  } else {
    windowDOMElement.classList.remove('window-blocked');
  }
}

function windowGoOffline(windowId) {
  getWindowDOMElement(windowId).classList.add('offline-window');
  if(isCentralWindow(windowId)) {
    getCentralWindowParentDOMElement(windowId)
      .classList.add('offline-window');
  }
}

function getWindowDOMElement(windowId) {
  return document.querySelector(`[data-window-id='${windowId}']`);
}

function isCentralWindow(windowId) {
  if(getCentralWindowParentDOMElement(windowId)) {
    return true;
  } else {
    return false;
  }
}

function getCentralWindowParentDOMElement(windowId) {
  windowElement = getWindowDOMElement(windowId);
  return (
    getWindowDOMElement(windowId)
      .closest('.central-window')
  );
}

function goToPage(pageSelector) {
  hideAllOtherPages(pageSelector);

  switch(pageSelector) {
    case '.home-page':
      focusNavBarItem('.nav-bar--item-home');
      showPage('.home-page');
      break;
      
    case '.settings-page':
      focusNavBarItem('.nav-bar--item-settings');
      swtichSettingsPage('Setting');
      showPage('.settings-page');
      break;
      
    case '.status-page':
      focusNavBarItem('.nav-bar--item-status');
      swtichSettingsPage('Status');
      showPage('.settings-page');
      break;

    default:
      throw new Error(`There is no page named "${pageSelector}"`);
  }

  currentPage = pageSelector;
}

function showPage(pageSelector) {
  let pageElement;

  pageElement = document.querySelector(pageSelector);
  if(pageElement) {
    pageElement.classList.remove('hidden-page');
  }

  if(pageSelector !== '.home-page') {
    pageElement = document.querySelector('.nav-bar');
    if(pageElement) {
      pageElement.classList.remove('hidden-page');
    }
    
    pageElement = document.querySelector('.control-panel');
    if(pageElement) {
      pageElement.classList.remove('hidden-page');
    }
  }
}

function hideAllOtherPages(pageSelector) {
  let otherActivePages = document
    .querySelectorAll(`:not(${pageSelector}):not(.hidden-page).app-page`);

  if(otherActivePages !== null) {
    otherActivePages
      .forEach(activePage => {
        activePage.classList.add('hidden-page');
      });
  }

  if(pageSelector === '.home-page') {
    let navBar;
    
    navBar= document.querySelector('.nav-bar');
    if(navBar) {
      navBar.classList.add('hidden-page');
    }
    
    navBar = document.querySelector('.control-panel');
    if(navBar) {
      navBar.classList.add('hidden-page');
    }
  }
}

function setWindowCardBatteryPercentage(windowId, batteryPercentage) {
  getWindowDOMElement(windowId).style.setProperty(
    '--battery-percentage',
    batteryPercentage
  );
}

function setWindowCardName(windowId, windowName) {
  getWindowDOMElement(windowId)
    .querySelector(`.window-card--room-name`).textContent = windowName;
}

function setWindowCardDoorClosePercentage(windowId, doorClosePercentage) {
  const windowCardImage =  getWindowDOMElement(windowId)
    .querySelector('.window-img--side');
  let leftMostPosition = getComputedStyle(windowCardImage)
    .getPropertyValue('--windw-side-pos-left-most');
  let rightMostPosition = getComputedStyle(windowCardImage)
    .getPropertyValue('--windw-side-pos-right-most');

  leftMostPosition = parseInt(leftMostPosition);
  rightMostPosition = parseInt(rightMostPosition);

  doorClosePercentage = toolBox.constrainValue(doorClosePercentage, 0, 100);

  doorClosePercentage = toolBox.mapValue(
    doorClosePercentage,
    0,
    100,
    leftMostPosition,
    rightMostPosition
  );

  windowCardImage.style.setProperty(
    '--windw-side-pos',
    `${doorClosePercentage}%`
  );
}

function navBarInit () {
  document.querySelectorAll('.nav-bar--item')
  .forEach((navBarItem) => {
    navBarItem.addEventListener('click', () => {
      click1Audio.volume = config.menuControl.CLICK_1_VOLUME;
      click1Audio.play();
      navBarEvent(navBarItem);
    })
  });
}

function navBarEvent (navBarItem) {
  if(navBarItemHasClass(navBarItem, 'nav-bar--item-home')) {
    uiEventsHandler({
      sourceType: '.nav-bar--item',
      eventName: 'Home',
    });
  } else if(navBarItemHasClass(navBarItem, 'nav-bar--item-status')) {
    uiEventsHandler({
      sourceType: '.nav-bar--item',
      eventName: 'Status',
    });

  } else if(navBarItemHasClass(navBarItem, 'nav-bar--item-settings')) {
    uiEventsHandler({
      sourceType: '.nav-bar--item',
      eventName: 'Settings',
    });

  } else if(navBarItemHasClass(navBarItem, 'nav-bar--item-remove')) {
    uiEventsHandler({
      sourceType: '.nav-bar--item',
      eventName: 'Remove',
    });

  } else if(navBarItemHasClass(navBarItem, 'nav-bar--item-advance')) {
    uiEventsHandler({
      sourceType: '.nav-bar--item',
      eventName: 'Advance',
    });

  }
}

function navBarItemHasClass (navBarItem, className) {
  return [...navBarItem.classList].includes(className);
}

function focusNavBarItem (itemSelector) {
  const currentSelectedItem = document.querySelector(
    `.nav-bar--item-selected:not(${itemSelector})`
  );
  const newlySelectedItem = document.querySelector(`${itemSelector}`);

  if(currentSelectedItem !== null) {
    currentSelectedItem.classList.remove('nav-bar--item-selected');
  }
  
  if(newlySelectedItem !== null) {
    newlySelectedItem.classList.add('nav-bar--item-selected');
  }
}

function emptyPage (pageSelector) {
  switch(pageSelector) {
    case '.home-page':
      while(1) {
        let settingCard = document.querySelector('.window-card');
    
        if(settingCard === null) {
          break;
        } else {
          settingCard.remove();
        }
      }
      break;
      
    case '.settings-page':
      while(1) {
        let settingCard = document.querySelector('.setting-card');
    
        if(settingCard === null) {
          break;
        } else {
          settingCard.remove();
        }
      }
      break;

    default:
      throw new Error(`There is no page named "${pageSelector}"`);
  }

  currentPage = pageSelector;
}

function windwCardExists(windowId) {
  return (getWindowDOMElement(windowId) !== null);
}

function removeWindowCard(windowId) {
  if(isCentralWindow(windowId)) {
    getCentralWindowParentDOMElement(windowId).remove();
  } else {
    getWindowDOMElement(windowId).remove();
  }
}

function getAllWindowIDs() {
  let windowCardsList = document.querySelectorAll(
    '.window-card:not(.central-window)'
  );

  windowCardsList = [...windowCardsList];
  windowCardsList = windowCardsList.map((windowCard) => {
    return windowCard.getAttribute('data-window-id');
  });

  return (new Set(windowCardsList));
}

function setNetworkOnlineWindows(onlineWindows, networkWindowsCount) {
  const networkStatusElement = document
    .querySelector('.network-status--value')
  
  if(networkStatusElement !== null) {
    networkStatusElement.textContent = 
      `${onlineWindows} / ${networkWindowsCount}`;
  }
}

function getCurrentPage() {
  return currentPage;
}

function getSettingCardElement(settingName) {
  let settingCard = document.querySelector(
    `[data-setting-name="${settingName}"]`
  );

  return settingCard;
}

function hasSettingCard(settingName) {
  return (getSettingCardElement(settingName) !== null);
}

function updateSettingCard(settingName, settingValue) {
  let settingCard = getSettingCardElement(settingName);
  settingCard.querySelector(".setting-card--value")
    .textContent = settingValue;
}

function getStatusCardElement(statusName) {
  let statusCard = document.querySelector(
    `[data-status-name="${statusName}"]`
  );

  return statusCard;
}

function hasStatusCard(statusName) {
  return (getStatusCardElement(statusName) !== null);
}

function updateStatusCard(statusName, statusValue) {
  let statusCard = getStatusCardElement(statusName);
  statusCard.querySelector(".status-card--value")
    .textContent = statusValue;
}

function swtichSettingsPage(newPage) {
  let root = document.querySelector(':root');
  root.style.setProperty('--setting-card-display', 'none');
  root.style.setProperty('--status-card-display', 'none');

  switch(newPage) {
    case 'Status':
      root.style.setProperty('--status-card-display', 'grid');
      break;

    case 'Advance':

      break;

    case 'Setting':
      root.style.setProperty('--setting-card-display', 'grid');
      break;

    default:
      throw new Error(`There is no setting page named "${newPage}"`);
      break;
  }
}

function getMoveCommandTime () {
  let result = document.querySelector(
    '.control-panel--input-move-command-time input'
  ).value;

  result = parseInt(result);

  if(isNaN(result)) {
    result = 0;
  }

  return result;
}

module.exports = {
  init,
  addNewSettingCard,
  hasSettingCard,
  getSettingCardElement,
  updateSettingCard,
  addNewStatusCard,
  hasStatusCard,
  getStatusCardElement,
  updateStatusCard,
  addNewWindowCard,
  removeWindowCard,
  windowGoOnline,
  windowGoOffline,
  isCentralWindow,
  getCentralWindowParentDOMElement,
  goToPage,
  setWindowCardBatteryPercentage,
  setWindowCardDoorClosePercentage,
  setWindowCardName,
  closeDialog,
  opendialog,
  emptyPage,
  windwCardExists,
  getWindowDOMElement,
  getAllWindowIDs,
  setNetworkOnlineWindows,
  getCurrentPage,
  swtichSettingsPage,
  focusNavBarItem,
  setWindowLockState,
  setWindowBlockedState,
  getMoveCommandTime,
};

