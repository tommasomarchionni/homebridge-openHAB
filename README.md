# homebridge-openHAB
Homebridge plugin for openHAB

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-openhab) and should be installed "globally" by typing:
```
npm install -g homebridge-openhab
```
# Configuration

Configuration sample:
```
"platforms": [
    {
        "platform": "openHAB",
        "name": "openHAB",
        "host": "192.168.0.100",
        "port": "8080",
        "sitemap": "demo"
    }
]
```
