const configs = require('./configs.js');
const EasyPost = require('@easypost/api');
const inquirer = require('inquirer');
const opn = require('opn');
const api = new EasyPost(configs.apiKey);


const parcelInput = [ // Inches and ounces
	//====================PARCEL INPUT=====================//
	{length: 20.2, width: 10.9, height: 5, weight: 65.9},
	//=====================================================//
	{length: 5, width: 5, height: 5, weight: 65.9},
	{length: 25, width: 25, height: 25, weight: 250},
];
const addressInput = [
  //==============TO_ADDR & FROM_ADDR INPUT==============//
  {
    "name":null,
    "company":"Ruroc Ltd",
    "street1":"29 Brunel Court",
    "street2":"Waterwells, Quedgeley",
    "city":"Gloucester",
    "state":"GB",
    "zip":"GL22AL",
    "country":"GB",
    "phone":"01452729584",
    "federal_tax_id":"TEST_FED_TAX_ID",
    "state_tax_id":"TEST_STATE_TAX_ID"
  },
  {
    "name": "A Ruroc Customer",
    "company": "",
    "street1": "1158 S Thomas street,",
    "street2": null,
    "city": "Arlington",
    "state": "VA",
    "zip": "22204",
    "country": "US",
    "phone": "1231231234",
  },
  //====================================================//
]
const addressBook = [
	{
    'name': 'Broadway Theatre',
    'street1': '1681 Broadway',
    'street2': '',
    'city': 'New York',
    'state': 'NY',
    'zip': '10019',
    'country': 'US',
  },
	{
    'name': 'Park South (NY)',
    'street1': '125 E 27th St',
    'street2': '',
    'city': 'New York',
    'state': 'NY',
    'zip': '10016',
    'country': 'US',
  },
  {
		'name': 'EasyPost',
    'company': null,
    'street1': '417 Montgomery Street',
    'street2': '5th Floor',
    'city': 'San Francisco',
    'state': 'CA',
    'zip': '94104',
    'country': 'US',
    'phone': '4153334444',
	},
  {
    'name': 'Dr. Steve Brule',
    'company': null,
    'street1': '179 N Harbor Dr',
    'street2': null,
    'city': 'Redondo Beach',
    'state': 'CA',
    'zip': '90277',
    'country': 'US',
    'phone': '4153334444',
	},
	{
    'name': 'Aramex ZA (To)',
    'street1': '417 Montgomery Street',
    'street2': '5th Floor',
    'city': 'San Francisco',
    'state': 'CA',
    'zip': '94104',
    'country': 'US',
    'phone': '4153334444',
	},
	{
    'name': 'Park South (NY)',
    'street1': '125 E 27th St',
    'street2': '',
    'city': 'New York',
    'state': 'NY',
    'zip': '10016',
    'country': 'US',
  }
]

const customsInfoInput = [
	//===================CSTINFO INPUT====================//
  {
		'eel_pfc': 'NOEEI 30.37(a)',
  	'contents_type': 'merchandise',
  	'restriction_type': 'none',
  	'customs_certify': true,
		'customs_signer': 'TL',
	}
	//====================================================//
];
const customsItemInput = [
	//===================CSTITEM INPUT====================//
	{
  	'description': 'Generic merchandise',
  	'quantity': 1,
  	'value': 10,
  	'quantity': 1,
  	'weight': 5,
  	'hs_tariff_number': '123456',
		'origin_country': 'us',
	}
	//====================================================//
]
const carrierAccountIds = [
	'ca_c08beb7d8abf458a8bba7ac3742439cb', // USPS (EP Support)
	'ca_e35cc2f45bf743b899a580caf45a6063', // UPS (EP Support)
	'ca_a92788837eb54764b6cf3fe79f86748c', // FedEx (Tae)
	'ca_921780b836c14100bdc991261d9fca6e', // UPS (Tae)
  'ca_78e33f49cb0d4ef38ba20e04c6c25b34', // Aramex (EP Support - TEST)
  'ca_96b69a48bf8b431fa2290dd2f566604d', // Asendia (EP Support)
  'ca_863e692eb7684c1ea64b8dbda8ef796c', // DHL Express (EP Support)
  'ca_cfb4ce16929c4dfbbfef29c438361e2c', // DHL Express (Tae Dev)
  'ca_3cc672152d8c4b02adb5a8001a5035e5', // LaserShip (EP Support)
];

const carrierAccounts = [
  {id:'ca_c08beb7d8abf458a8bba7ac3742439cb', name: 'USPS (EP Support)'},
	{id:'ca_e35cc2f45bf743b899a580caf45a6063', name: 'UPS (EP Support)'},
	{id:'ca_a92788837eb54764b6cf3fe79f86748c', name: 'FedEx (Tae)'},
	{id:'ca_921780b836c14100bdc991261d9fca6e', name: 'UPS (Tae)'},
  {id:'ca_78e33f49cb0d4ef38ba20e04c6c25b34', name: 'Aramex (EP Support - TEST)'},
  {id:'ca_96b69a48bf8b431fa2290dd2f566604d', name: 'Asendia (EP Support)'},
  {id:'ca_863e692eb7684c1ea64b8dbda8ef796c', name: 'DHL Express (EP Support)'},
  {id:'ca_cfb4ce16929c4dfbbfef29c438361e2c', name: 'DHL Express (Tae Dev)'},
  {id:'ca_3cc672152d8c4b02adb5a8001a5035e5', name: 'LaserShip (EP Support)'},
];

// Formulate request parameter objects
const parcel = new api.Parcel(parcelInput[0]);
const toAddress = new api.Address(addressInput[0]);
const fromAddress = new api.Address(addressInput[1]);
const customsItem = new api.CustomsItem(customsItemInput[0]);
const customsInfoInput2 = customsInfoInput[0];
customsInfoInput2['customs_items'] = [customsItem];
const customsInfo = new api.CustomsInfo(customsInfoInput2);

//customsInfo.save().then((console.log));

// Set a shipment input object
const shpInput = {
    mode: 'test',
    parcel,
    to_address: toAddress,
    from_address: fromAddress,
    customs_info: customsInfo,
    options: {

    }
};

// Other globally scoped variables
let shpId = '';
let rates = [];
let rateId = '';

// Run the main function
ship_debug();

// Main function
function ship_debug() {
  let shipment = new api.Shipment(shpInput);
  return new Promise((resolve, reject) => {
    shipment.save().then(shp => {
      shpId = shp.id;
      console.log(shp); // Debug
      console.log(`[shipment] Shipment ID: ${shpId}`);
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
      // console.log(services);
      return listPrompt(services, 'service');
    }).then(result => {
      rateId = result.id;
      return api.Shipment.retrieve(shpId);
    }).then(rshp => {
      return rshp.buy(rateId);
    }).then(res => {
      console.log(res); // Debug
      opn(res.postage_label.label_url);
      opn(res.tracker.public_url);
      resolve();
      process.exit();
    }).catch(e => { if (e) throw e })
  })
}

// Find carrier account name from the global array and return carrier_account_id if not found
function carrierAcctName(rate) {
  for (let i = 0; i < carrierAccounts.length; i++) {
    if (carrierAccounts[i].id === rate.carrier_account_id) { return carrierAccounts[i].name; }
  }
  return rate.carrier_account_id
}


// Sample code from main.js (06112018)

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
      message: `[Shipment] Select ${title}:`
    }).then(answers => {
      if (title === 'service') {
        let result = rates.find(e => e.handle === answers[title]);
        console.log(result);
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

