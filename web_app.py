import base64
import datetime
import os

from bson.objectid import ObjectId
from flask import Flask, flash, url_for, render_template, request, redirect, make_response, Response, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests


MONGO_URL = os.environ.get('MONGO_URL')

CLIENT = MongoClient(MONGO_URL)
DB = CLIENT['ibinnedit']
BINS = DB['litter_bins']
IMAGES = DB['images']

MAPS_API = os.environ.get('MAPS_API')
PLACES_API_KEY = os.environ.get('PLACES_API')


IP_STACK_URL = "http://api.ipstack.com/%s?access_key=%s"
IP_STACK_KEY = "760b8fc8e1d3bd73f4653f9e96d91e45"

APP = Flask(__name__)

CORS(APP)

@APP.route('/')
def index():
    longitude = -2.2434590734806084
    latitude = 53.48076741173544
    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if ip and ip != "127.0.0.1":
        r = requests.get(IP_STACK_URL % (ip, IP_STACK_KEY))
        if r.status_code == 200:
            data = r.json()
            latitude = data.get('latitude')
            longitude = data.get('longitude')        
    return render_template('index.html', MAPS_API=MAPS_API, latitude=latitude, longitude=longitude)

@APP.route('/admin')
def admin():
    litter_bins = list(BINS.find({'approved': False}))
    for litter_bin in litter_bins:
        litter_bin['_id'] = str(litter_bin['_id'])
    return render_template('admin.html', litter_bins=litter_bins)

@APP.route('/litter-bins', methods=["GET"])    
def litter_bins():
    litter_bins = list(BINS.find({'type':'bin','approved': True}, {'approved':0, '_id':0}))
    return jsonify(litterBins=litter_bins)


@APP.route('/litter', methods=["GET"])
def litter():
    litter = list(
        BINS.find({'type': 'litter', 'approved': True}, {'approved': 0, '_id': 0}))
    return jsonify(litter=litter)


@APP.route('/image', methods=["GET","POST"])
def post_image():
    if request.method  == "GET":
        image = IMAGES.find_one(
            {'_id': ObjectId(request.args.get('id'))}, {'_id': 0})
        return jsonify(image=image.get('image'))
    if request.method == "POST":
        image = IMAGES.insert_one({'image':request.form.get('image')})
        return jsonify(image_id=str(image.inserted_id))

@APP.route('/approve/<id>')
def approve(id):
    BINS.update_one({'_id': ObjectId(id)}, {'$set':{'approved': True}})
    return jsonify(approved=True)

@APP.route('/message', methods=["POST"])
def message():
    BINS.insert_one({**{"approved": False, "timestamp":datetime.datetime.now()},**request.get_json()})
    return jsonify(received=True)

@APP.route('/search', methods=["GET"])
def search():
    r = requests.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%s&inputtype=textquery&fields=geometry&locationbias=circle:2000@%s&key=%s" % (request.args.get('query'), request.args.get('locationbias'), PLACES_API_KEY))
    if (r.status_code == 200):
        return jsonify(result=r.json())

if __name__ == '__main__':
    APP.run(host="0.0.0.0",debug=True)
