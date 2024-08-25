# deserialise-jsonapi
Javascript library to deserialise JSONAPI responses to plain javascript objects.
Designed to work with the output of [Flask-REST-JSONAPI](https://github.com/miLibris/flask-rest-jsonapi/).

**Main Features**
* Resolves Nested Includes
* Asynchronous - Returns a Promise
* ES6 codebase

## Installation
Using npm:
```shell
$ npm install --save deserialise-jsonapi
```

## Usage
```js
import Deserialiser from 'deserialise-jsonapi'

const des = new Deserialiser()

let response = fetch('http://your-jsonapi.com/url')
    .then(response => response.json())
    .then(data => des.deserialise(data))
    .then(models => {
        // Use your deserialised models
        console.log(models)
    })
```

## Status
This package should be considered early beta. Though it is used on multiple production websites, the api could still change without warning.

version 0.1.2
