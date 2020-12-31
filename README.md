# Map marker

- [Map marker](#map-marker)
  * [Overview](#overview)
  * [Setup](#setup)
    + [macOS](#macos)
    + [Dokku](#dokku)
  * [Customisation](#customisation)
    + [Map Style](#map-style)
    + [Marker styles](#marker-styles)
    + [Interface styles](#interface-styles)


## Overview 

A boilerplate web application – built with [Flask](https://flask.palletsprojects.com/) – for finding and marking points on a map with messages. The [Google Maps Embed API](https://developers.google.com/maps/documentation/embed) is used for the map display, the [Google Places API](https://developers.google.com/places) is used for searching, and [MongoDB](https://www.mongodb.com/) for storing the messages.

This repo includes a `requirements.txt` and `Procfile` for deployment using [Heroku](https://heroku.com/) or [Dokku](http://dokku.viewdocs.io/dokku/).

[View demo](https://maptag.xyz/)

## Setup

### macOS

* Make sure you've got [Python 3.5 (or later) installed](https://docs.python-guide.org/starting/install3/osx/)
* Make sure you've got [MongoDB installed](https://docs.mongodb.com/manual/installation/)
* Install the required Python packages using `pip`. You can do this by going navigating to the repo directory in Terminal and running the command `python3 -m pip install -r requirements.txt`.
* Make sure you've got API keys for Google Maps and Google Places via the [Google Cloud Platform console](https://console.cloud.google.com/).
* Make sure you've got [environment variables set](https://www.talkofweb.com/how-to-set-environment-variable-in-macos-catalina/) for MongoDB, Google Maps API, and Places API, named `MONGO_URL`, `MAPS_API`, and `PLACES_API_KEY` respectively. Alternatively you can hard-code these into the `web_app.py` file, if you're certain this code won't be publicly visible.
* Run `python web_app.py` and visit http://127.0.0.1:5000 to use, and http://127.0.0.1.5000/admin to approve messages.

### Dokku

* [Install Dokku](http://dokku.viewdocs.io/dokku/getting-started/installation/)
* [Create an application](http://dokku.viewdocs.io/dokku/deployment/application-deployment/#create-the-app)
* [Install Dokku Mongo](https://github.com/dokku/dokku-mongo)
* [Create a mongo service](https://github.com/dokku/dokku-mongo#create-a-mongo-service)
* [Link the Mongo service to your application](https://github.com/dokku/dokku-mongo#link-the-mongo-service-to-the-app)
* [Set the environment variables as described above](http://dokku.viewdocs.io/dokku/configuration/environment-variables/) (`MONGO_URL` should be automatic).
* [Add Dokku as a remote to this repo](http://dokku.viewdocs.io/dokku/deployment/application-deployment/#deploy-the-app)
* [Push to the Dokku remote to deploy](http://dokku.viewdocs.io/dokku/deployment/application-deployment/#deploy-the-app)

## Customisation

### Map style

The `mapStyle` variable in the `static/mapStyle.js` file can be customised to alter the appearance of the map. Styles can be downloaded or designed at [Snazzy maps](https://snazzymaps.com).

### Marker styles

The Marker icons can be customised in the `static/mapStyle.js` folder, including colours for various states.

### Interface styles

The `static/style.css` file contains a handful of variables in the `:root` selector that you can use to customise colours in the interface. There is one inline style one line 11 of the `static/markerMaker.js` (the dashed outline that appears when adding new markers).