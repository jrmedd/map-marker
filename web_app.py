import datetime
import os

from bson.objectid import ObjectId
from flask import Flask, flash, url_for, render_template, request, redirect, make_response, Response, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import requests


MONGO_URL = os.environ.get('MONGO_URL')

CLIENT = MongoClient(MONGO_URL)
DB = CLIENT['jpegmaps']
MARKERS = DB['markers']

MAPS_API = os.environ.get('MAPS_API')
PLACES_API_KEY = os.environ.get('PLACES_API')

APP = Flask(__name__)

CORS(APP)

@APP.route('/')
def index():
    return render_template('index.html', MAPS_API=MAPS_API)

@APP.route('/admin')
def admin():
    markers = list(MARKERS.find({'approved': False}))
    for marker in markers:
        marker['_id'] = str(marker['_id'])
    return render_template('admin.html', markers=markers)

@APP.route('/markers', methods=["GET"])    
def markers():
    markers = list(MARKERS.find({'approved': True}, {'_id':0}))
    return jsonify(markers=markers)

@APP.route('/approve/<id>')
def approve(id):
    MARKERS.update_one({'_id': ObjectId(id)}, {'$set':{'approved': True}})
    return jsonify(approved=True)

@APP.route('/message', methods=["POST"])
def message():
    MARKERS.insert_one({**{"approved": False},**request.get_json()})
    return jsonify(received=True)

@APP.route('/search', methods=["GET"])
def search():
    r = requests.get("https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%s&inputtype=textquery&fields=geometry&locationbias=circle:2000@%s&key=%s" % (request.args.get('query'), request.args.get('locationbias'), PLACES_API_KEY))
    if (r.status_code == 200):
        return jsonify(result=r.json())

if __name__ == '__main__':
    APP.run(debug=True)
