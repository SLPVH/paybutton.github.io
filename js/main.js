/* Main spicebutton.com JavaScript file */

const CURRENCY_SYMBOLS = {
  ARS: '$ ',
  AUD: '$ ',
  CAD: '$ ',
  USD: '$ ',
  BMD: '$ ',
  CLP: '$ ',
  HKD: '$ ',
  MXN: '$ ',
  NZD: '$ ',
  SGD: '$ ',
  TWD: '$ ',
  CNY: '¥ ',
  JPY: '¥ ',
  BCH: '₿ ',
  BTC: '₿ ',
  AED: 'د.إ ',
  BDT: '৳ ',
  BHD: 'د.ب ',
  BRL: 'R$ ',
  CZK: 'Kč ',
  DKK: 'Kr. ',
  ETH: 'Ξ ',
  EUR: '€ ',
  GBP: '£ ',
  HUF: 'Ft ',
  IDR: 'Rp ',
  ILS: '₪ ',
  INR: '₹ ',
  KRW: '₩ ',
  KWD: 'د.ك ',
  LKR: 'රු ',
  LTC: 'Ł ',
  MMK: 'K ',
  MYR: 'RM ',
  NOK: 'kr ',
  SEK: 'kr ',
  PHP: '₱ ',
  PKR: 'Rs ',
  PLN: 'zł ',
  RUB: '₽ ',
  SAR: '﷼‎ ',
  THB: '฿ ',
  TRY: '₺ ',
  UAH: '₴ ',
  VEF: 'Bs ',
  VND: '₫ ',
}

localStorage.setItem('reloadFlag', false);

window.onload = function() {
  // Load data from localStorage
  var slpAddress = localStorage.getItem('address');
  var currencyUnit = localStorage.getItem('currency');
  var reloadFlag = localStorage.getItem('reloadFlag');

  // Verify localStorage was not empty
  if (slpAddress && currencyUnit && !reloadFlag) {
    launchPos();
  }
  
  // Get elements that require event listeners
  let launchButton = document.getElementById('launch-button');
  let posTab = document.getElementById('pos-tab');
  let widgetTab = document.getElementById('widget-tab');
  let slpText = document.getElementById('slp-address-input');
  let backButton = document.getElementById('back-button');

  // Add event listeners to elements
  launchButton.addEventListener('click', launchPos);
  posTab.addEventListener('click', tabSelect);
  widgetTab.addEventListener('click', tabSelect);
  slpText.addEventListener('input', getCurrencies);
  backButton.addEventListener('click', reload);

  // Repopulate SLP Address
  if (slpAddress) {
    slpText.value = slpAddress;
    getCurrencies();
  }
}

/**
 * @function
 * This will show (css .show) the content of the targetTab and hide (css .hide) all other content. It will also add .active class to targetTab. targetTab is determined using 'this' call on HTMLElement object.
 */
function tabSelect() {
  var targetTab = this.getAttribute('data-target');
  var targetTabContent = document.querySelector(targetTab);
  var otherTabs = document.querySelectorAll('.tabs:not(' + targetTab + ')');
  var tabContents = document.querySelectorAll('.tab-content:not(' + targetTab + ')');
  
  //Remove active class from not selected tabs
  otherTabs.forEach(function(el) {
    el.classList.remove('active');
  });

  //Hide all not selected tab content elements
  tabContents.forEach(function(el) {
    el.classList.remove('show');
    el.classList.add('hide');
  });

  //Add active class to selected tab
  this.classList.add('active');

  //Show selected tab content
  targetTabContent.classList.remove('hide');
  targetTabContent.classList.add('show');
}

/**** POINT OF SALE CODE ****/
var isSpice = '';
var currencySymbol = ''; 
var decimalPlaces = 0;
var runningTotal = 0;
var runningTotalStr = '0';

function launchPos() {
  var slpAddress = localStorage.getItem('address');
  var currencyUnit = localStorage.getItem('currency');

  let address = document.getElementById('slp-address-input').value;
  let currency = document.getElementById('currency-dropdown').value;
  
  if (checkSLPAddress(address) || checkSLPAddress(slpAddress))  {
    currencyUnit = (currency ? currency.toUpperCase() : currencyUnit);
    slpAddress = (address ? address.toLowerCase() : slpAddress);

    //Save slpAddress and currencyUnit to localStorage for continuous client-side access
    localStorage.setItem('address', slpAddress);
    localStorage.setItem('currency', currencyUnit);

    document.getElementById('spice-button').setAttribute('address', slpAddress);
    document.getElementById('spice-button').setAttribute('amount-type', currencyUnit);

    //Assign appropriate currency unit
    currencySymbol = getCurrencySymbol(currencyUnit.toUpperCase());

    openKeypad();
    createServiceWorker();
  } else alert('Please enter a valid SLP address.');
}

/**
 * @param {string} unit The currency unit that is being used
 * @function
 * Returns the currency symbol for the specified unit
 */
function getCurrencySymbol(unit) {
  return CURRENCY_SYMBOLS.hasOwnProperty(unit) ? CURRENCY_SYMBOLS[unit] : '';
}

function openKeypad() {
  document.getElementById('keypadWindow').style.display = 'block';
  updateKeypad();
}

function keyPress(keyInput) {
  switch (keyInput) {
    case -1: {
      if (runningTotalStr.length == 1) {
        runningTotalStr = '0';
      } else {
        runningTotalStr = runningTotalStr.slice(0, -1);
      }

      updateKeypad();
    }
    break;
  case '.':
    function containsDecimal() {
      var search = runningTotalStr.split('');
      for (var i = 0; i < search.length; i++) {
        if (search[i] == '.') {
          return true;
        }
      }
      return false;
    }
    if (!containsDecimal()) {
      if (runningTotalStr === '0') {
        runningTotalStr = '0.';
      } else {
        runningTotalStr = runningTotalStr.concat(keyInput);
      }
      updateKeypad();
    }
    break;
  default: {
    //use the concat() method
    if (runningTotalStr === '0') {
      runningTotalStr = keyInput;
    } else {
      runningTotalStr = runningTotalStr.concat(keyInput);
    }
    updateKeypad();
  }

  }
}

function updateKeypad() {
  document.getElementById('numberAreaParagraph').innerHTML = currencySymbol + runningTotalStr + isSpice; //.toFixed(decimalPlaces);
  //runningTotal=runningTotal.replace(currencySymbol,"");
  runningTotal = parseFloat(runningTotalStr);
  document.getElementById('spice-button').setAttribute('amount', runningTotal); //.toFixed(decimalPlaces));
}

function goToHomePage() {
  closeFullscreen();
}

/**
 * @function
 * Calls XHR to get currencies from coingecko API if the SLP Address matches the correct RegExp
 */
function getCurrencies() {
  if (checkSLPAddress(document.getElementById('slp-address-input').value)) {
    let xmlhttp = new XMLHttpRequest();
    let currencies = ['spice'];
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var data = JSON.parse(xmlhttp.responseText).sort();
        data.forEach(function(c) {
          currencies.push(c);
        });
        let currencyDropdown = document.getElementById('currency-dropdown');
        currencies.forEach(function(c) {
          currencyDropdown.innerHTML += '<option value=\"' + c.toUpperCase() + '\">' + c.toUpperCase() + '</option>';
        });
        showCurrencyDropdown();
      }
    };
    xmlhttp.open('GET', urls.CURRENCIES_URL, true);
    xmlhttp.send();
  }
  else {
    hideCurrencyDropdown();
  }
}

function showCurrencyDropdown() {
  let dropdownContainer = document.querySelector('.currency-select-container')
  dropdownContainer.classList.add('show');
  dropdownContainer.classList.remove('hide');
}

function hideCurrencyDropdown() {
  let dropdownContainer = document.querySelector('.currency-select-container')
  dropdownContainer.classList.remove('show');
  dropdownContainer.classList.add('hide');
}

function checkSLPAddress(address) {
  return address ? address.match(/^simpleledger:(q|p)[a-z0-9]{41}/) : false;
}

function reload() {
  localStorage.setItem('reloadFlag', true);
  location.reload();
}

function createServiceWorker() {
  // Register the service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js')
    .then(function(registration) {
      console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function(error) {
      console.error('Service worker registration failed, error:', error);
    });
  }
}