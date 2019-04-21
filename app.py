import json

from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np
import numpy.matlib
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import normalize
from scipy.spatial.distance import cdist
from sklearn.manifold import MDS
#First of all you have to import it from the flask module:
app = Flask(__name__)


@app.route("/world", methods = ['POST', 'GET'])
def map_data():
    with open("world.json", 'r') as f:
        data = json.load(f)
        print (data)
        return jsonify(data)


@app.route("/", methods = ['POST', 'GET'])
def index():  
    return render_template("index.html", data=None)


if __name__ == "__main__":
    app.run(debug=True)
    app.config['TEMPLATES_AUTO_RELOAD'] = True