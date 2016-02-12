# homebridge-openHAB

[![npm package](https://nodei.co/npm-dl/homebridge-openhab.png?months=2)](https://nodei.co/npm/homebridge-openhab/)

[![Gitter](https://badges.gitter.im/tommasomarchionni/homebridge-openHAB.svg)](https://gitter.im/tommasomarchionni/homebridge-openHAB?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[Homebridge](https://www.npmjs.com/package/homebridge) plugin for [openHAB](http://www.openhab.org).

## Prerequisites
* [openHAB](http://www.openhab.org)
* [node.js](https://nodejs.org)

## Installation
* Install the mdns and avahi library:

  `sudo apt-get install libnss-mdns libavahi-compat-libdnssd-dev`
  
* Install [homebridge](https://www.npmjs.com/package/homebridge):

  `npm install -g homebridge`
  
* This plugin is published through [NPM](https://www.npmjs.com/package/homebridge-openhab) and should be installed "globally" by typing:
 
  `npm install -g homebridge-openhab`
  
* Update your config.json file (usually is in your home/.homebridge/ directory, if you can't find, follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge)). See config.json in this repository for a sample.

## Configuration (config.json)
```
"platforms": [
    {
        "platform": "openHAB",
        "name": "openHAB",
        "host": "192.168.0.100",
        "port": "8080",
        "sitemap": "demo",
        "useLabelForName": true
    }
]
```
Fields:

* "platform" - Must be set to openHAB
* "name" - Name of openHAB server, default openHAB
* "host" - IP address of the openHAB server
* "port" - Port of the openHAB server
* "sitemap" - Sitemap name of your openHAB server
* "useLabelForName" - true if you want use item's label in the name field of HomeKit, useful if you want to use Siri. If you set this attribute to true it's important that you have unique label in your sitemap.

## Advanced configuration (config.json)
If you want set custom attributes to your openHAB's item you should add "customAttrs" attribute to your config.json file.
In this section you can change these attributes:

* "itemLabel" - you can set a different label,
* "itemManufacturer" - you can set item's manufacter,
* "itemModel" - you can set item's model,
* "itemSerialNumber" - you can set item's serial number,
* "itemType" - you can have different type of switch item, number item, contact item, etc. Here you can define the type:
    * use "TemperatureSensorItem" for Temperature Sensor,
    * use "LightSensorItem" for Light Sensor,
    * use "ThermostatItem" for Thermostat (experimental support),
    * use "FanItem" for Fan,
    * use "LightbulbItem" for Lightbulb,
    * use "OutletItem" for Outlet,
    * use "MotionSensorItem" for Motion Sensor.
* "skipItem" - set to true if you want avoid to load the item in Homekit catalog, default is false,
* "itemSubType" - use only with itemType=ThermostatItem, defines the type of openHAB item associated to ThermostatItem:
    * use "CurrentTemperatureCItem" for openHAB item with current temperature value in Celsius,
    * use "CurrentTemperatureFItem" for openHAB item with current temperature value in Fahrenheit,
    * use "TargetTemperatureCItem" for openHAB item with target temperature value in Celsius,
    * use "TargetTemperatureFItem" for openHAB item with target temperature value in Fahrenheit,
    * use "CurrentRelativeHumidityItem" for openHAB item with humidity value.
* "itemUniqueAggregationId" - use only with itemType=ThermostatItem, defines which item are associated with a Thermostat, use the same integer value for the same thermostat.

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
                "skipItem": false
            },
            {
                "itemName":"living_room_ambient_temperature_c",
                "itemLabel":"Termostat 1",
                "itemType": "ThermostatItem",
                "itemSubType":"CurrentTemperatureCItem",
                "itemUniqueAggregationId":1
            },
            {
                "itemName":"living_room_target_temperature_c",
                "itemLabel":"Termostat 1",
                "itemType": "ThermostatItem",
                "itemSubType":"TargetTemperatureCItem",
                "itemUniqueAggregationId":1
            },
            {
                "itemName":"living_room_humidity",
                "itemLabel":"Termostat 1",
                "itemType": "ThermostatItem",
                "itemSubType":"CurrentRelativeHumidityItem",
                "itemUniqueAggregationId":1
            }
        ]
    }
]
```
