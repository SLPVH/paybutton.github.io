const spiceID = "4de69e374a8ed21cbddd47f2338cc0f479dc58daa2bbe11cd604ca488eca0ddf";

var cssButtonId = 'pbButtonCSS';
if (!document.getElementById(cssButtonId)) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://slpvh.github.io/spicebutton/css/buttons.css';
  link.id = cssButtonId;
  link.media = 'all';
  head.appendChild(link);
}

var cssModalId = 'pbModalCSS';
if (!document.getElementById(cssModalId)) {
  var head = document.getElementsByTagName('head')[0];
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'https://slpvh.github.io/spicebutton/css/modal.css';
  link.id = cssModalId;
  link.media = 'all';
  head.appendChild(link);
}

var qrId = 'pbQR';
if (!document.getElementById(qrId)) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.src = 'https://slpvh.github.io/spicebuttonjs/qrjs2.js';
  script.id = qrId;
  head.appendChild(script);
}

// * start of create modal
(function() {

  // Define our constructor
  this.Modal = function() {
    // Create global element references
    this.closeButton = null;
    this.modal = null;
    this.overlay = null;

    // Determine proper prefix
    this.transitionEnd = transitionSelect();

    // Define option defaults
    var defaults = {
      autoOpen: false,
      className: 'fade-and-drop',
      content: '',
      maxWidth: 270,
      minWidth: 264,
      overlay: true
    };

    // Create options by extending defaults with the passed in arugments
    if (arguments[0] && typeof arguments[0] === 'object') {
      this.options = extendDefaults(defaults, arguments[0]);
    }

    if (this.options.autoOpen === true) this.open();
  };

  // Public Methods

  Modal.prototype.close = function() {
    if (window.payButtonModalOpen) {
      //stopListenForTX();
      var _ = this;
      this.modal.className = this.modal.className.replace(' spicebutton-open', '');
      this.overlay.className = this.overlay.className.replace(
        ' spicebutton-open',
        ''
      );
      this.modal.addEventListener(this.transitionEnd, function() {
        _.modal.parentNode.removeChild(_.modal);
      });
      this.overlay.addEventListener(this.transitionEnd, function() {
        if (_.overlay.parentNode) _.overlay.parentNode.removeChild(_.overlay);
      });
      window.payButtonModalOpen = false;
      delete window.payButtonParent;
    }
  };

  Modal.prototype.open = function() {
    if (!window.payButtonModalOpen) {
      buildOut.call(this);
      initializeEvents.call(this);
      window.getComputedStyle(this.modal).height;
      this.modal.className =
        this.modal.className +
        (this.modal.offsetHeight > window.innerHeight ?
          ' spicebutton-open spicebutton-anchored' :
          ' spicebutton-open');
      this.overlay.className = this.overlay.className + ' spicebutton-open';
      window.payButtonModalOpen = true;
    }
  };

  // Private Methods

  function buildOut() {
    var content, contentHolder, docFrag;

    /*
     * If content is an HTML string, append the HTML string.
     * If content is a domNode, append its content.
     */

    if (typeof this.options.content === 'string') {
      content = this.options.content;
    } else {
      content = this.options.content.innerHTML;
    }

    // Create a DocumentFragment to build with
    docFrag = document.createDocumentFragment();

    // Create modal element
    this.modal = document.createElement('div');
    this.modal.className = 'spicebutton-modal ' + this.options.className;
    //this.modal.style.minWidth = this.options.minWidth + "px";
    //this.modal.style.maxWidth = this.options.maxWidth + "px";

    // If overlay is true, add one
    if (this.options.overlay === true) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'spicebutton-overlay ' + this.options.className;
      docFrag.appendChild(this.overlay);
    }

    // Create content area and append to modal
    contentHolder = document.createElement('div');
    contentHolder.className = 'spicebutton-content';
    contentHolder.id = 'modal-content';
    contentHolder.innerHTML = content;
    this.modal.appendChild(contentHolder);

    // Append modal to DocumentFragment
    docFrag.appendChild(this.modal);

    // Append DocumentFragment to body
    document.body.appendChild(docFrag);
  }

  function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  // initialize modal events
  function initializeEvents() {
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    if (this.overlay) {
      this.overlay.addEventListener('click', this.close.bind(this));
    }
    document.getElementById('bch-open').addEventListener('click', function() {
      this.innerHTML = '<span>Opening SLP Wallet</span>';
    });
  }

  function transitionSelect() {
    var el = document.createElement('div');
    if (el.style.WebkitTransition) return 'webkitTransitionEnd';
    if (el.style.OTransition) return 'oTransitionEnd';
    return 'transitionend';
  }
})();
// * end of create modal

// * start of copy BCH URI to clipboard
function copyBCHURI(address) {
  var inp = document.createElement('input');
  inp.value = address;
  window.payButtonParent.appendChild(inp);
  inp.select();
  document.execCommand('copy', false, null);
  inp.remove();
  //alert("Bitcoin Cash address copied!");
  document.getElementById('copyDiv').innerHTML = '<span>Address Copied!</span>';
}
// * end of copy BCH URI to clipboard

// * start of transaction audio
function playAudio() {
  var successAudio = new Audio(
    '/audio/pbding.mp3'
  );
  successAudio.volume = 0.02; // 50%
  successAudio.play();
}
// * end of transaction audio

// * start random sat gen
function getRandomSat() {
  return (Math.random() * (0.00000123 - 0.0000001) + 0.0000001).toFixed(8);
}
// * end random sat gen

// * start of start/stop transaction listen
var txListen;

function startListenForTX(pbAttr) {
  pbAttr.timeStamp = Math.floor(Date.now() / 1000);
  /* txListen = setInterval(function() {
    listenForTX(pbAttr);
  }, 60000); */ //1400);  Testing to see if interval looping is necessary
  txListen = listenForTX(pbAttr);
}

/*function stopListenForTX() {
  clearInterval(txListen);
}*/
// * end of start/stop transaction listen

// * start of show transaction message
function txDialogue(pbAttr) {
  playAudio();

  if (!pbAttr.successMsg) {
    pbAttr.successMsg = 'Transaction Successful!';
  }

  var successDisplay = document.getElementById('modal-content');
  successDisplay.innerHTML =
    '<div>' +
    '<div>' +
    '<div class="txdialoguediv">' +
    '<div><span>' +
    pbAttr.successMsg +
    '</span></div>' +
    '</div>' +
    '<div class="txdialoguediv">' +
    '<div><span>View: </span><a href="https://explorer.bitcoin.com/bch/tx/' +
    pbAttr.txid +
    '" target="_blank" style="color: orangeRed; text-decoration: none;">Transaction</a></div>' +
    '</div>' +
    '</div>' +
    '</div>';

  console.log('Confirmed. Transaction ID:', pbAttr.txid);

  var paywallFieldExists = document.getElementsByClassName(pbAttr.paywallField);
  if (paywallFieldExists) {
    for (var i = 0; i < paywallFieldExists.length; i++) {
      var paywallFields = paywallFieldExists[i];
      paywallFields.style.display = 'block';
    }
  }

  if (pbAttr.successCallback && window[pbAttr.successCallback]) {
    window[pbAttr.successCallback](pbAttr.txid);
  }
}
// * end of show transaction message

// * start of transaction listener
function listenForTX(pbAttr) {
  var address = pbAttr.toAddress; //.replace("simpleledger:", "");
  var query = {
    "v": 3,
    "q": {
      "find": {
        "slp.detail.tokenIdHex": spiceID,
        "out.e.a": address
      }
    }
  }

  var txRequest = new EventSource('https://slpsocket.fountainhead.cash/s/' + btoa(JSON.stringify(query)))

  txRequest.onmessage = function(event) {
    console.log('listening for transaction..');

    var txData = JSON.parse(event.data);

    //var tx = JSON.parse(event.data);
    if (txData.type == 'mempool') {
      for (var i = 0; i < txData.data[0].slp.detail.outputs.length; i++) {
        if (txData.data[0].slp.detail.outputs[i].address == address) {
          var spiceReceived = txData.data[0].slp.detail.outputs[i].amount;
          //var sender = txData.data[0].in[0].e.a;
          var txid = txData.data[0].tx.h;
          if (pbAttr.anyAmount) {
            if (spiceReceived > 0) {
              successMsg = "Recieved " + spiceReceived;
              txRequest.close();

              //stopListenForTX();
              //
              pbAttr.txid = txid;
              //
              txDialogue(pbAttr);

              return;
            }
          }

          if (spiceReceived == pbAttr.bchAmount) {
            txRequest.close();

            //stopListenForTX();
            //
            pbAttr.txid = txid;
            //
            txDialogue(pbAttr);

            return;
          }
        }
      }
    }
  }
}
// * end of transaction listener

// * start of begin function detect and send data to badger wallet
function sendToBadger(
  toAddress,
  bchAmount,
  successMsg,
  paywallField,
  successCallback
) {


  if (typeof web4bch !== 'undefined') {
    web4bch = new Web4Bch(web4bch.currentProvider);

    // detect if wallet is locked
    if (!web4bch.bch.defaultAccount) {
      document.getElementById('badger-open').innerHTML =
        '<span>Please Unlock Badger Wallet</span>';
      alert('Please unlock Badger Wallet before continuing.');
    } else {
      document.getElementById('badger-open').innerHTML =
        '<span>Opening Badger Wallet</span>';

      var txParams = {
        to: toAddress,
        from: web4bch.bch.defaultAccount,
        value: bchAmount,
        sendTokenData: {
          tokenId: spiceID,
          tokenProtocol: 'slp'
        }
      };

      // check for errors else proceed with success messages
      web4bch.bch.sendTransaction(txParams, (err, res) => {
        if (err) {
          document.getElementById('badger-open').innerHTML =
            '<span>Send With Badger Wallet</span>';
          //console.log("Error", err);
        } else {

          //stopListenForTX();

          var pbAttr = {
            txid: res,
            successMsg: successMsg,
            paywallField: paywallField,
            successCallback: successCallback
          };

          txDialogue(pbAttr);
        }
      });
    }
  } else {
    document.getElementById('badger-open').innerHTML =
      '<span>Badger Wallet Not Found</span>';
    window.open('https://badger.bitcoin.com');
    alert(
      'To use Badger Wallet for this transaction, Please visit:\n\nhttps://badger.bitcoin.com for installation instructions.'
    );
  }
}
// * end of begin function detect and send data to badger wallet

// * start of open model
function openModal(pbAttr) {
  // qr code generation
  if (pbAttr.anyAmount) {
    pbAttr.amountMessage = 'Send any amount of Spice';
    pbAttr.URI = pbAttr.toAddress;

  } else {
    pbAttr.URI = pbAttr.toAddress + '?amount=' + pbAttr.bchAmount;
    //var bchaddress =

    //startListenForTX(bchaddress);
    //setTimeout(startListenForTX(bchaddress), 1000);
  }
  startListenForTX(pbAttr);
  var qrParams = {
    ecclevel: 'Q',
    fillcolor: '#FFFFFF',
    textcolor: '#000000',
    margin: '0.5',
    modulesize: 12
  };

  if (document.implementation.hasFeature('http://www.w3.org/2000/svg', '1.1')) {
    genQR = QRCode.generateSVG(pbAttr.URI, qrParams);
    var XMLS = new XMLSerializer();
    genQR = XMLS.serializeToString(genQR);
    genQR =
      'data:image/svg+xml;base64,' +
      window.btoa(unescape(encodeURIComponent(genQR)));
    qrImage = genQR;
  } else {
    genQR = QRCode.generatePNG(pbAttr.URI, qrParams);
    qrImage = genQR;
  }

  var pbContent =
    '<div>' +
    '<div>' +
    '<div>' +
    '<div class="qrparent" onclick=copyBCHURI(\'' +
    pbAttr.URI +
    "')>" +
    '<img class="qrcode" src="' +
    qrImage +
    '" />' +
    '<img class="qricon" src="./images/bitcoincash_bare_logo.png" />' +
    '<div id="copyDiv" class="qrctc">Click to Copy</div>' +
    '</div>' +
    '</div>' +
    '<div class="dialoguediv">' +
    '<div><span>' +
    pbAttr.amountMessage +
    '</span></div> ' +
    '</div>' +
    '<div>' +
    '<div><button id="bch-open" class="spice-button pb-modal-button" onclick="location.href=\'' +
    pbAttr.URI + '-' + spiceID +
    '\'" type="button"><span>Send with SLP Wallet</span></button></div>' +
    '</div>' +
    '<div>' +
    '<div><button id="badger-open" class = "spice-button pb-modal-button" onclick="sendToBadger(\'' +
    pbAttr.toAddress +
    "', '" +
    pbAttr.bchAmount +
    "', '" +
    pbAttr.successMsg +
    "', '" +
    pbAttr.paywallField +
    "', '" +
    pbAttr.successCallback +
    '\')" type="button"><span>Send with Badger Wallet</span></button></div> ' +
    '</div>' +
    '<div class="poweredbydiv">' +
    '<div><span><a href="https://spicebutton.com" target="_blank" style="color: orangeRed; text-decoration: none;">Powered by spicebutton.com</a></span></div>' +
    '</div>' +
    '</div>' +
    '</div>';

  if (pbAttr.anyAmount) {
    pbContent =
      '<div>' +
      '<div>' +
      '<div>' +
      '<div class="qrparent" onclick=copyBCHURI(\'' +
      pbAttr.URI +
      "')>" +
      '<img class="qrcode" src="' +
      qrImage +
      '" />' +
      '<img class="qricon" src="./images/bitcoincash_bare_logo.png" />' +
      '<div id="copyDiv" class="qrctc">Click to Copy</div>' +
      '</div>' +
      '</div>' +
      '<div class="dialoguediv">' +
      '<div><span>' +
      pbAttr.amountMessage +
      '</span></div> ' +
      '</div>' +
      '<div>' +
      '<div><button id="bch-open" class="spice-button pb-modal-button" onclick="location.href=\'' +
      pbAttr.URI + '-' + spiceID +
      '\'" type="button"><span>Send with SLP Wallet</span></button></div>' +
      '</div>' +
      '<div class="poweredbydiv">' +
      '<div><span><a href="https://spicebutton.com" target="_blank" style="color: orangeRed; text-decoration: none;">Powered by spicebutton.com</a></span></div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  var pbModal = new Modal({
    content: pbContent
  });

  pbModal.open();
}
// * end of open model

function getBCHPrice(pbAttr) {
  var fiatRequest = new XMLHttpRequest();
  fiatRequest.open(
    'GET',
    'https://api.coingecko.com/api/v3/simple/price?ids=spice&vs_currencies=' + pbAttr.amountType,
    true
  );

  fiatRequest.onload = function() {
    if (fiatRequest.readyState == 4 && fiatRequest.status == 200) {
      var fiatData = JSON.parse(fiatRequest.responseText);
      // let sprice=fiatData["spice"]["USD"];
      // console.log(sprice);

      if (fiatData != '') {
        // determine amount of satoshi based on button value
        //var addDecimal = fiatData.pbAttr.amountType / 100;
        var satAmount = (1 / fiatData["spice"][pbAttr.amountType.toLowerCase()]) * pbAttr.buttonAmount;
        pbAttr.satAmount = satAmount.toFixed(8);

        // add small amount of random sats for slightly more acurate success dialogue
        pbAttr.randSat = 0;
        var bchAmount = Number(pbAttr.satAmount);
        pbAttr.bchAmount = bchAmount.toFixed(8);


        pbAttr.amountMessage =
          pbAttr.buttonAmount +
          ' ' +
          pbAttr.amountType +
          ' = ' +
          pbAttr.bchAmount +
          ' SPICE';

        openModal(pbAttr);
      } else {
        console.log('Error Price Not Found');
      }
    } else {
      console.log('Found Server But There Is An Error');
    }
  };

  fiatRequest.onerror = function() {
    console.log('Could Not Connect To Server');
  };

  fiatRequest.send();

  fiatRequest.onerror = function() {
    console.log('Could Not Connect To Server');
  };

  fiatRequest.send();
};
// * end of begin function query to obtain bch price

// insert info into button on mouseover
function mouseEnter() {
  //console.log('Button text 2 worked');
  var buttonText2 = this.getAttribute('button-text-2') || '';
  buttonText2 = buttonText2.trim();
  if (!buttonText2) {
    var showAmount = this.getAttribute('amount') || '';
    showAmount = Number(showAmount.trim());
    var showType = this.getAttribute('amount-type') || '';
    showType = showType.trim().toUpperCase();
    buttonText2 = showAmount + ' ' + showType;
    if (!showAmount || !showType) {
      buttonText2 = 'Click to send Spice';
    }
  }
  this.innerHTML = '<span>&nbsp</span>';
  var x = this;
  setTimeout(function() {
    x.innerHTML = '<span>' + buttonText2 + '</span>';
  }, 200);
  //this.innerHTML = "<span>"+buttonText2+"</span>";
  if (!('ontouchend' in window))
    this.addEventListener('mouseleave', buttonDefaultText, false);
  if ('ontouchend' in window)
    this.addEventListener('touchend', buttonDefaultText, false);
}

// insert info into button on mouseout
function buttonDefaultText() {
  //console.log('Default button text worked');
  var buttonText = this.getAttribute('button-text') || '';
  buttonText = buttonText.trim();
  if (!buttonText) {
    var showAmount = this.getAttribute('amount') || '';
    showAmount = Number(showAmount.trim());
    var showType = this.getAttribute('amount-type') || '';
    showType = showType.trim().toUpperCase();
    buttonText = 'Send Spice';
    if (!showAmount || !showType) {
      buttonText = 'Send Spice';
    }
  }
  this.innerHTML = '<span>&nbsp</span>';
  var x = this;
  setTimeout(function() {
    x.innerHTML = '<span>' + buttonText + '</span>';
  }, 200);
  //this.innerHTML = "<span>"+buttonText+"</span>";
}

function renderButtons(config) {
  // pull in buttons found
  var payButton = document.getElementsByClassName('spice-button');

  for (var i = 0; i < payButton.length; i++) {
    var payButtons = payButton[i];

    if (config.onDemand === false && payButtons.classList.contains('pbtnjs')) {
      continue;
    }

    //console.log('button created', payButtons);

    let defaultText = buttonDefaultText.bind(payButtons);
    defaultText();

    if (!('ontouchstart' in window))
      payButtons.addEventListener('mouseenter', mouseEnter, false);
    if ('ontouchstart' in window)
      payButtons.addEventListener('touchstart', mouseEnter, false);

    // pull in attribute info from button when clicked
    payButtons.setAttribute('type', 'button');
    payButtons.addEventListener('click', function(pbEvent) {
      window.payButtonParent = pbEvent.target.parentNode;
      var buttonAmount = this.getAttribute('amount') || '';
      buttonAmount = Number(buttonAmount.trim());
      var amountType = this.getAttribute('amount-type') || '';
      amountType = amountType.trim().toUpperCase();
      var toAddress = this.getAttribute('address') || '';
      toAddress = toAddress.trim();
      var successMsg = this.getAttribute('success-msg') || '';
      successMsg = successMsg.trim();
      var paywallField = this.getAttribute('paywall-field') || '';
      paywallField = paywallField.trim();
      var successCallback = this.getAttribute('success-callback') || '';
      successCallback = successCallback.trim();

      var bchAmount;
      var amountMessage;
      var anyAmount;

      var pbAttr = {
        buttonAmount: buttonAmount,
        amountType: amountType,
        toAddress: toAddress,
        successMsg: successMsg,
        paywallField: paywallField,
        successCallback: successCallback,
        anyAmount: false
      };

      // bch address attribute missing
      if (!toAddress) {
        alert(
          'Spice Button Error:\n\nBelow are the minimum button requirements\n\n1. address (Bitcoin Cash SLP address)'
        );
        return;
      }

      // missing one of two amount attributes, alert
      if (buttonAmount || amountType) {
        if (!buttonAmount || !amountType) {
          alert(
            'Spice Button Error:\n\nFor specific Spice Button amounts, BOTH of the following MUST be set:\n\n1. amount (Must be a number)\n2. amount-type (Can be BCH, Satoshi, USD, AUD etc)\n\nTo allow "Any" amount, BOTH must be blank.'
          );
          return;
        }
      } else {
        pbAttr.anyAmount = true;
      }

      if (!buttonAmount && !amountType) {
        pbAttr.anyAmount = true;
        pbAttr.bchAmount = '';
      }

      // check for "any" amount allowed else convert
      if (pbAttr.anyAmount) {
        openModal(pbAttr);
      } else {
        // check if amount type is set to bch or fiat
        if (amountType == 'SPICE' || amountType == 'SATOSHI') {
          var satAmount = buttonAmount;
          if (amountType == 'SATOSHI') {
            satAmount = satAmount / 100000000;
          }
          pbAttr.satAmount = satAmount.toFixed(8);

          // add small amount of random sats for slightly more acurate success dialogue
          pbAttr.randSat = 0;
          bchAmount = Number(pbAttr.satAmount) + Number(pbAttr.randSat);
          pbAttr.bchAmount = bchAmount;

          // display bch amount in modal
          pbAttr.amountMessage = 'Amount = ' + pbAttr.bchAmount + ' SPICE';

          // send bch tx data to modal
          openModal(pbAttr);
        } else {
          // send fiat tx data to fiat/bch conversion
          getBCHPrice(pbAttr);
        }
      }
    });
  }
}

// DOM listen
document.addEventListener('DOMContentLoaded', function() {
  renderButtons({
    onDemand: false
  });
});

var Spicebutton = {
  render: function(id, config) {
    var elem = document.getElementById(id);
    var newBtn = document.createElement('button');
    newBtn.setAttribute('id', id);
    if (config.style) {
      newBtn.setAttribute('style:', config.style);
    }
    if (config.class) {
      newBtn.setAttribute('class', 'spice-button ' + config.style + ' pbtnjs');
    } else {
      newBtn.setAttribute('class', 'spice-button pbtnjs');
    }
    if (config.button_text) {
      newBtn.setAttribute('button-text', config.button_text);
    }
    if (config.button_text_2) {
      newBtn.setAttribute('button-text-2', config.button_text_2);
    }
    if (config.success_msg) {
      newBtn.setAttribute('success-msg', config.success_msg);
    }
    if (config.address) {
      newBtn.setAttribute('address', config.address);
    }
    if (config.amount) {
      newBtn.setAttribute('amount', config.amount);
    }
    if (config.amount_type) {
      newBtn.setAttribute('amount-type', config.amount_type);
    }
    //System already has checks if one or the other, or both (amount/amount type) are set and throws appropriate errors. wont need this in production.
    else if (config.amount) {
      newBtn.setAttribute('amount-type', 'bch');
    }
    if (config.paywall_field) {
      newBtn.setAttribute('paywall-field', config.paywall_field);
    }
    if (config.success_callback) {
      newBtn.setAttribute('success-callback', config.success_callback);
    }
    elem.parentNode.replaceChild(newBtn, elem);
    renderButtons({
      onDemand: true
    });
  }
};
