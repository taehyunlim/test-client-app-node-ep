const configs = require('./configs.js');
const EasyPost = require('@easypost/api');
const inquirer = require('inquirer');
const opn = require('opn');
const api = new EasyPost(configs.apiKey);

// Hardcoded string vars
const mainManu = ['address', 'shipment', 'tracker', 'parcel'];
const addressInput = [
  {field:'name', default: 'Tae Home'},
  {field: 'street1', default: '5404 Heatrland Drive'},
  {field: 'street2', default: ''},
  {field: 'city', default: 'San Ramon'},
  {field: 'state', default: 'CA'},
  {field: 'zip', default: '94582'},
  {field: 'country', default: 'USA'},
  {field: 'phone', default: '510-432-5656'}
];
const parcelInput = [
  {field: 'length', default: 15},
  {field: 'width', default: 15},
  {field: 'height', default: 15},
  {field: 'weight', default: 15}
];
const carrierAccounts = [
  {name: 'USPS (EP Support)', id: 'ca_c08beb7d8abf458a8bba7ac3742439cb'},
  {name: 'UPS (EP Support)', id: 'ca_e35cc2f45bf743b899a580caf45a6063'},
  {name: 'FedEx (Tae)', id: 'ca_a92788837eb54764b6cf3fe79f86748c'},
  {name: 'UPS (Tae)', id: 'ca_921780b836c14100bdc991261d9fca6e'},
];
const addrArray = [
  {name: 'Tae Home', id: 'adr_43768bb693804629bad3e2f8190e4a47'},
  {name: 'Tae EP', id: 'adr_5cf8cddb7cc545799abf66690ec4beee'},
  {name: 'Canada Address 1', id: 'adr_c2e38e2d67b74adbb8ac3b073e80dce5'}
];
const parcelArray = [
  {name: '30/30/30/30', id: 'prcl_1fc93fe8bd5c4a2885944af6156b18a5'},
  {name: '10/10/10/1', id: 'prcl_c0947ff787ad4ccc837107a975a71675'},
];
const trackerArray = [
  {name: 'Test Tracker', id: 'trk_370effe60fc3434787915b3521988e73'}
];

//  Declare empty vars globally
let currentMenu = '';
let shpInput = {};
let shpId = '';
let rates = [];
let rateId = '';

const inputObject = (inputField, inputDefault, title) => {
  return {
    type: 'input',
    message: `[${title}] Enter ${inputField}:`,
    name: inputField,
    default: inputDefault
  };
}

const inputConfirm = (body, inputArray) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt([{
      type: 'confirm',
      message: 'Is this correct?',
      name: 'confirm'
    }]).then(answers => {
      if (answers.confirm) {
        resolve(body);
      } else {
        reject();
      }
    })
  })
}

const inputPrompt = (inputArray, title) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt(inputArray.map((input) => { return inputObject(input.field, input.default, title) }))
    .then(answers => { return inputConfirm(answers) })
    .then(body => resolve(body))
    .catch(() => {
      inputPrompt(inputArray);
    })
  })
}

const listPrompt = (array, title) => {
  return new Promise((resolve, reject) => {
    inquirer.prompt({
      type: 'list',
      name: title,
      choices: array,
      message: `[${currentMenu}] Select ${title}:`
    }).then(answers => {
      if (title === 'service') {
        let result = rates.find(e => e.handle === answers[title]);
        // console.log(result);
        resolve(result);
      } else {
        let result = array.find(e => e.name === answers[title]);
        resolve(result);
      }
    });
  })
}

function addr() {
  currentMenu = 'address'
  return new Promise((resolve, reject) => {
    inputPrompt(addressInput, 'address')
    .then(body => {
      body['verify'] = ['delivery'];
      let address = new api.Address(body);
      return address.save();
    }).then(addr => {
      let delivery = addr.verifications.delivery;
      if (delivery.success && delivery.errors.length === 0) {
        resolve(addr.id);
      } else {
        console.log(`[address] addr.id: ${addr.id}`);
        console.log(`[ERROR] Address verification failed.`)
        delivery.errors.forEach(error => {
          console.log(`[ERROR] Field: ${error.field} | Message: ${error.message} | Suggestion: ${error.suggestion}`);
        })
        main();
      }
    })
  })
}

function prc() {
  currentMenu = 'parcel'
  return new Promise((resolve, reject) => {
    inputPrompt(parcelInput, 'parcel')
    .then(body => {
      // parseInt parcel dimension & weight inputs
      Object.keys(body).map((key, index) => {
        body[key] = parseInt(body[key]);
      })
      let parcel = new api.Parcel(body);
      return parcel.save();
    }).then(parcel => {
      resolve(parcel.id)
    }).catch(e => { throw e })
  });
}

function shp() {
  return new Promise((resolve, reject) => {
    currentMenu = 'shipment';
    let resultsArray = [];

    listPrompt(addrArray, 'from_address')
    .then(result => {
      resultsArray.push(result);
      return listPrompt(addrArray, 'to_address');
    }).then(result => {
      resultsArray.push(result);
      return listPrompt(parcelArray, 'parcel');
    }).then(result => {
      resultsArray.push(result);
      shpInput['from_address'] = { id: resultsArray[0]['id'] };
      shpInput['to_address'] = { id: resultsArray[1]['id'] };
      shpInput['parcel'] = { id: resultsArray[2]['id'] };
      let shipment = new api.Shipment(shpInput);
      return shipment.save();
    }).then(shp => {
      shpId = shp.id;
      shp.rates.forEach(rate => {
        let acctName = carrierAcctName(rate);
        rates.push({
          'accountName': acctName,
          'carrier': rate.carrier,
          'service': rate.service,
          'rate': rate.rate,
          'id': rate.id,
          'handle': `${acctName}-${rate.carrier}-${rate.service}: ${rate.rate}`
        })
      })
      let services = shp.rates.map(rate => {
        // Create services handles
        let acctName = carrierAcctName(rate);
        return `${acctName}-${rate.carrier}-${rate.service}: ${rate.rate}`
      })
      return listPrompt(services, 'service');
    }).then(result => {
      rateId = result.id;
      return api.Shipment.retrieve(shpId);
    }).then(rshp => {
      return rshp.buy(rateId);
    }).then(res => {
      // console.log(res);
      opn(res.postage_label.label_url);
      opn(res.tracker.public_url);
      resolve(res.tracker.id);
    }).catch(e => { if (e) throw e })

    // Find carrier account name from the global array and return carrier_account_id if not found
    function carrierAcctName(rate) {
      for (let i = 0; i < carrierAccounts.length; i++) {
        if (carrierAccounts[i].id === rate.carrier_account_id) { return carrierAccounts[i].name; }
      }
      return rate.carrier_account_id
    }

  });
}



function main() {
  inquirer.prompt([{
    type: 'list',
    name: 'mainManu',
    choices: mainManu,
    message: "[main] Select from main menu: "
  }]).then(answers => {
    switch (answers.mainManu) {
      case 'address':
        return addr();
        break;
      case 'parcel':
        return prc();
        break;
      case 'shipment':
        return shp();
        break;
    }
  }).then(result => {
    console.log(JSON.stringify(result));
    return inquirer.prompt([{
      type: 'list',
      name: 'exit',
      choices: ["Return to main menu", "Exit"],
      message: "[main] Exit or stay?"
    }]);
  }).then(answers => {
    if (answers.exit === 'Exit') { process.exit() }
    else { main() }
  }).catch(e => { throw e });
}

main();
