/* Main spicebutton.com JavaScript file */

window.onload = function() {
  //Load data from localStorage
  var slpAddress = localStorage.getItem('address');
  var currencyUnit = localStorage.getItem('currency');

  //Verify localStorage was not empty
  if (slpAddress && currencyUnit) {
    launchPos();
  }
  
  //Get elements that require event listeners
  let launchButton = document.getElementById('launch-button');
  let posTab = document.getElementById('pos-tab');
  let widgetTab = document.getElementById('widget-tab');
  let backButton = document.getElementById('back-button');

  //Add event listeners to elements
  launchButton.addEventListener('click', launchPos);
  posTab.addEventListener('click', tabSelect);
  widgetTab.addEventListener('click', tabSelect);
  backButton.addEventListener('click', deleteLocalStorage);
  
  getCurrencies();
}

function fullscreen() {
  var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

  var docElm = document.documentElement;
  if (!isInFullScreen) {
    document.getElementById("toggleFullscreen").innerHTML = "X";
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }
  } else {
    document.getElementById("toggleFullscreen").innerHTML = "View Fullscreen";
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
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
  let currency = document.getElementById('currency-selector').value;
  
  if (address || slpAddress) {
    currencyUnit = (currency ? currency.toUpperCase() : currencyUnit);
    slpAddress = (address ? address.toLowerCase() : slpAddress);

    //Save slpAddress and currencyUnit to localStorage for continuous client-side access
    localStorage.setItem('address', slpAddress);
    localStorage.setItem('currency', currencyUnit);

    document.getElementById('spice-button').setAttribute('address', slpAddress);
    document.getElementById('spice-button').setAttribute('amount-type', currencyUnit);

    //Assign appropriate currency unit
    currencySymbol = getCurrencySymbol(currencyUnit);

    openKeypad();
  } else alert('Please enter a valid SLP address');
}

function getCurrencySymbol(unit) {
  switch (unit) {
    case 'ARS':
    case 'AUD':
    case 'CAD':
    case 'USD':
    case 'BMD':
    case 'CLP':
    case 'HKD':
      return '$ ';
      break;
    case 'CNY':
    case 'JPY':
      return '¥ ';
      break;
    case 'BCH':
    case 'BTC':
      return '₿ ';
      break;
    case 'AED':
      return 'د.إ ';
      break;
    case 'BDT':
      return '৳ ';
      break;
    case 'BHD':
      return '.د.ب ';
      break;
    case 'BRL':
      return 'R$ ';
      break;
    case 'CZK':
      return 'Kč ';
      break;
    case 'DKK':
      return 'Kr. ';
      break;
    case 'ETH':
      return 'Ξ ';
      break;
    case 'EUR':
      return '€ ';
      break;
    case 'GBP':
      return '£ ';
      break;
    case 'HUF':
      return 'Ft ';
      break;
    case 'IDR':
      return 'Rp ';
      break;
    case 'ILS':
      return '₪ ';
      break;
    case 'INR':
      return '₹ ';
      break;
    default:
      return '';
  }
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
 * Calls XHR to get currencies from coingecko API 
 */
function getCurrencies() {
  let xmlhttp = new XMLHttpRequest();
  let currencies = ['spice'];
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      var data = JSON.parse(xmlhttp.responseText).sort();
      data.forEach(function(c) {
        currencies.push(c);
      });
      displayCurrencies(currencies);
    }
  };
  xmlhttp.open('GET', urls.CURRENCIES_URL, true);
  xmlhttp.send();
}
/**
 * @function
 * Formats currencies received from coingecko API and populates currency dropdown for user selection
 */
function displayCurrencies(currencies) {
  let fiatDropdown = document.getElementById('currency-selector');
  currencies.forEach(function(c) {
    fiatDropdown.innerHTML += '<option value=\"' + c.toUpperCase() + '\">' + c.toUpperCase() + '</option>';
  });
}

function deleteLocalStorage() {
  localStorage.removeItem('address');
  localStorage.removeItem('currency');
  location.reload();
}