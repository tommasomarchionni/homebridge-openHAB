# homebridge-openHAB
Homebridge plugin for openHAB

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-openhab) and should be installed "globally" by typing:
```
npm install -g homebridge-openhab
```
Update your config.json file. See config.json in this repository for a sample.

# Configuration

Configuration sample:
```
"platforms": [
    {
        "platform": "openHAB",
        "name": "openHAB",
        "host": "192.168.0.100",
        "port": "8080",
        "sitemap": "demo",
        "useLabelForName": true,
        "customAttrs": [
            {
                "itemName":"Demo_Switch",
                "itemLabel":"Demo Switch Label",
                "itemManufacturer": "Demo Manufacter Switch",
                "itemModel": "Demo Model Switch",
                "itemSerialNumber":"12345678"
            },
            {
                "itemName":"Demo_Dimmer",
                "itemLabel":"Demo Dimmer Label",
                "itemManufacturer": "Demo Manufacter Dimmer",
                "itemModel": "Demo Model Dimmer",
                "itemSerialNumber":"23456789"
            },
            {
                "itemName":"Demo_Temperature",
                "itemLabel":"Demo Temperature",
                "itemManufacturer": "Demo Manufacter Temperature",
                "itemModel": "Demo Model Temperature",
                "itemSerialNumber":"23456781",
                "itemType": "TemperatureSensorItem"
            }
        ]    
    }
]
```
Fields: 
* "platform" - Must be set to openHAB
* "name" - Name of openHAB server, default openHAB
* "host" - IP address of the openHAB server
* "port" - Port of the openHAB server
* "sitemap" - Sitemap name, see demo.sitemap in this repository for a sample
* "useLabelForName" - true if you want use item's label in the name field of HomeKit, useful if you want to use Siri
* "customAttrs" - Array of objects specifying for defining field in HomeKit catalog
* (Under customAttrs) "itemName" - item's name
* (Under customAttrs) "itemLabel" - item's label
* (Under customAttrs) "itemManufacturer" - item's manufacter
* (Under customAttrs) "itemModel" - item's model
* (Under customAttrs) "itemSerialNumber" - item's serial number
* (Under customAttrs) "itemType" - you must set this value to "TemperatureSensorItem" if the item is a Temperature Sensor
