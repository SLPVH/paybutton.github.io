// Global JS Helper Functions

/**
 * @function
 * @param {event} event Event listener object
 * This will show (css .show) the content of the tab clicked and hide (css .hide) all other content. It will also add .active class to tab selected.
 */
function tabSelect(event) {
  var contentElSelector = event.target.getAttribute('data-target');
  var contentEl = document.querySelector(contentElSelector);

  var otherTabEls = document.querySelectorAll('.tabs:not(' + contentElSelector + ')');
  var otherContentEls = document.querySelectorAll('.tab-content:not(' + contentElSelector + ')');

  // remove active class from not selected tabs
  otherTabEls.forEach(function(el) {
    el.classList.remove('active');
  });

  /* Get the documentElement (<html>) to display the page in fullscreen */
  var elem = document.documentElement;

  /* View in fullscreen */
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  /* goToHomePage() fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }

  // hide all not selected tab content elements
  otherContentEls.forEach(function(el) {
    el.classList.remove('show');
    el.classList.add('hide');
  });

  // add active class to selected tab
  event.target.classList.add('active');

  // show selected tab content
  contentEl.classList.remove('hide');
  contentEl.classList.add('show');
}

/**
 * @function
 * @param {event} event
 * This is called on an event from an element (radio) that detemines whether to show or hide a optional form element.
 * TODO: only called when radio is selected. Doesn't call on deselected.
 */
function optionalInput(event) {
  var isOn = event.target.checked;

  var contentElSelector = event.target.getAttribute('data-target');
  var contentEl = document.querySelector(contentElSelector);

  contentEl.classList.remove('hide');
  contentEl.classList.add('show');
}

//Point of sale Code

var slpAddress = "";
var currencyUnit = "Spice";
var isSpice = "";
var currencySymbol = "";
var decimalPlaces = 0;
var runningTotal = 0;
var runningTotalStr = "0";

function launchPos() {

  let address = document.getElementById('slp-address-input').value;
  let currency = document.getElementById('fiat-price-input').value;
  if (address) {
    if (currency) {
      currencyUnit = currency;
    }
    slpAddress = address;
    window.open(location.href + "?address=" + address + "&currency=" + currencyUnit);
  } else {
    alert("Please enter a valid SLP address");
  }
}

//document.onload='spiceStartFunction()';

function spiceStartFunction() {
  console.log("Start Function");
  getUrlData(location.href);
}

function getUrlData(str) {
  //var str=location.href;
  str = str.split("?");
  if (str[1]) {
    str = str[1].split("&");
    var obj = {};
    for (var i = 0; i < str.length; i++) {
      var p = str[i].split("=");
      var q = p[0];
      var r = p[1];
      obj[q] = r;
    }
    //console.log(obj);
    if (obj.address) {
      slpAddress = obj.address;
      document.getElementById("spice-button").setAttribute("address", slpAddress);

      if (obj.currency) {
        currencyUnit = obj.currency;
        document.getElementById('spice-button').setAttribute("amount-type", currencyUnit);

        switch (currencyUnit) {
          case "USD":
            currencySymbol = "$";
            break;
          case "AUD":
            currencySymbol = "$";
            break;
          case "CNY":
            currencySymbol = "¥";
            break;
          case "JPY":
            currencySymbol = "¥";
            break;
          case "GBP":
            currencySymbol = "£";
            break;
          case "EUR":
            currencySymbol = "€";
            break;
          case "CAD":
            currencySymbol = "$";
            break;
            // case "":
            //   currencySymbol = "";
            //   break;
          default:
            currencySymbol = "";

        }
        if (currencyUnit == "Spice") {
          isSpice = " Spice";
        }
        // if (!(currencyUnit == "USD" || currencyUnit == "BCH")) {
        //   var opt = document.createElement('option');
        //   opt.value = currencyUnit;
        //   opt.innerHTML = currencyUnit;
        //   document.getElementById('currency').appendChild(opt);
        // }
        // document.getElementById('currency').value = currencyUnit;
      }
      //if true, then
      // if (obj.decimal) {
      //   decimalPlaces = obj.decimal;
      //}
      openKeypad();
      openFullscreen();
    }
    //return obj;
  } else {
    console.log("No opening URL parameters found");
  }

}

// function changeCountryCode() {
//   //console.log("changeCountryCode()");
//   var cCode = prompt("Please Enter Country Code:", "+");
//   document.getElementById('customCode').innerHTML = cCode;
//   document.getElementById('customCode').value = cCode;
//
// }
//
// function submitTel() {
//   var num = document.getElementById("countryCode").value + document.getElementById("phoneInput").value;
//   num = num.split('');
//   var num2 = [];
//   for (var i = 0; i < num.length; i++) {
//     num[i] = parseInt(num[i]);
//     if (!(isNaN(num[i]))) {
//       num2.push(num[i]);
//     }
//   }
//   var num3 = 0;
//   for (var i = 0; i < num2.length; i++) {
//     num3 *= 10;
//     num3 += num2[i];
//   }
//   //console.log(num3);
//   //phoneInput=num3;
//   window.open(location.href + "?phone=" + num3, "_self");
// }

function openKeypad() {
  document.getElementById("keypadWindow").style.display = "block";
  updateKeypad();
}

function keyPress(keyInput) {
  switch (keyInput) {
    // case -2: {
    //   decimalPlaces++;
    //   //updateKeypad();
    // }
    //break;
    case -1: {
      // runningTotal /= 10;
      // runningTotal = (Math.trunc(runningTotal * Math.pow(10, decimalPlaces))) / Math.pow(10, decimalPlaces);
      // // runningTotal-=(keyInput*=0.01);
      if (runningTotalStr.length == 1) {
        runningTotalStr = "0";
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
      if (runningTotalStr === "0") {
        runningTotalStr = "0.";
      } else {
        runningTotalStr = runningTotalStr.concat(keyInput);
      }
      updateKeypad();
    }
    break;
  default: {
    //use the concat() method
    if (runningTotalStr === "0") {
      runningTotalStr = keyInput;
    } else {
      runningTotalStr = runningTotalStr.concat(keyInput);
    }
    // runningTotal *= 10;
    // runningTotal += (keyInput *= Math.pow(10, -decimalPlaces));
    updateKeypad();
  }

  }
}

function updateKeypad() {
  document.getElementById("numberAreaParagraph").innerHTML = currencySymbol + runningTotalStr + isSpice; //.toFixed(decimalPlaces);
  //runningTotal=runningTotal.replace(currencySymbol,"");
  runningTotal = parseFloat(runningTotalStr);
  document.getElementById("spice-button").setAttribute("amount", runningTotal); //.toFixed(decimalPlaces));
}

// function changeCurrency() {
//   var currency = document.getElementById("currency").value;
//   if (currency == "custom") {
//     currency = prompt("Enter a custom currency ticker:");
//     currency = currency.toUpperCase();
//   }
//   var url = location.href;
//   if (url.indexOf("&currency=") >= 0) {
//     var myURL = url.replace("&currency=" + currencyUnit,"");
//     url=myURL;
//   }
//   window.open(url + "&currency=" + currency);
// }

function goToHomePage() {
  closeFullscreen();
}
