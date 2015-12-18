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
                "itemName":"Demo_Lightbulb",
                "itemLabel":"Demo Lightbulb Label",
                "itemManufacturer": "Demo Manufacter Lightbulb",
                "itemModel": "Demo Model Lightbulb",
                "itemSerialNumber":"12345678",
                "itemType":"LightbulbItem"
            },
            {
                "itemName":"Demo_Fan",
                "itemLabel":"Demo Fan Label",
                "itemManufacturer": "Demo Manufacter Fan",
                "itemModel": "Demo Model Fan",
                "itemSerialNumber":"12345678",
                "itemType":"FanItem"
            },
            {
                "itemName":"Demo_Outlet",
                "itemLabel":"Demo Outlet Label",
                "itemManufacturer": "Demo Manufacter Outlet",
                "itemModel": "Demo Model Outlet",
                "itemSerialNumber":"123456378",
                "itemType":"OutletItem"
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
                "itemType": "TemperatureSensorItem",
                "skipItem": false,
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
* "customAttrs" - You should add this section only if you want custom attributes for your openhab's items in defined sitemap
* (Under customAttrs) "itemName" - item's name
* (Under customAttrs) "itemLabel" - item's label
* (Under customAttrs) "itemManufacturer" - item's manufacter
* (Under customAttrs) "itemModel" - item's model
* (Under customAttrs) "itemSerialNumber" - item's serial number
* (Under customAttrs) "itemType": 
    * use "TemperatureSensorItem" for Temperature Sensor, 
    * use "LightSensorItem" for Light Sensor, 
    * use "FanItem" for Fan, 
    * use "LightbulbItem" for Lightbulb, 
    * use "OutletItem" for Outlet, 
    * use "MotionSensorItem" for Motion Sensor.
* (Under customAttrs) "skipItem": set to true if you want avoid to load the item in Homekit catalog, default is false.