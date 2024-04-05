# Add Proxy in Angular 

## way -1
* make file `proxy.conf.json`  where `packages.json` available 
``` //proxy.conf.json

{
    "/api": {
      "target": "http://localhost:3000",
      "secure": false      
    }
  }
```
* Add In start script of `package.json`
```
    "start": "ng serve --proxy-config proxy.conf.json",
```

## way - 2
 * make file `proxy.conf.json`  where `packages.json` available 
``` //proxy.conf.json

{
    "/api": {
      "target": "http://localhost:3000",
      "secure": false      
    }
  }
```
* Add In `angular.json`
``` //angular.json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```