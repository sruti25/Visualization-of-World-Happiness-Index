import json
import csv

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

import util
#First of all you have to import it from the flask module:
app = Flask(__name__)

@app.route("/happinessScheduler", methods = ['POST', 'GET'])
def happinessScheduler():
    return render_template("charts.html", data=None)


@app.route("/", methods = ['POST', 'GET'])
def index():  
    return render_template("index.html", data=None)

@app.route("/world", methods = ['POST', 'GET'])
def map_data():
    with open("world.json", 'r') as f:
        data = json.load(f)
        return jsonify(data)

@app.route("/happiness_index", methods = ['POST', 'GET'])
def happiness_index_data():
    global happiness_2017
    global happiness_2017_am
    global happiness_2017_lm
    global country_list
    global region
    model = request.args.get("model")
    if model == 'wb_score':
        data = happiness_2017
        data['Rank'] = data['Total'].rank(ascending=False)
    elif model =='am_score':
        data = happiness_2017_am
    elif model == 'lm_score':
        data = happiness_2017_lm
    else:
        return None
    data = data.drop(['Total'],axis=1)
    data['Country_Name'] = country_list['Country_Name'].values
    data['Region'] = region['Region'].values
    data = data.set_index('Country_Code')
    data = data.to_dict('index')
    return jsonify(data);

@app.route("/country_list", methods = ['POST', 'GET'])
def country_list():
    global country_list
    data = country_list.to_dict('records')
    return jsonify(data)

@app.route("/country_2016_data", methods = ['POST', 'GET'])
def country_2016_data():
    global standard_2016
    global series
    country = request.args.get("country")
    if country is None:
        return jsonify({'chart_data' : None})
    data = standard_2016.loc[standard_2016['Country_Code'] == country]
    data = data.drop(['Country_Code'],axis=1)
    return jsonify({'chart_data' : data.values[0].tolist(), 'labels': series['Series_Name'].values.tolist() ,'description': series['Description'].values.tolist()})

@app.route("/feature_year_data", methods = ['POST', 'GET'])
def feature_year_data():
    global standard_2016
    global standard_2015
    global standard_2014
    global standard_2012
    global series
    country = request.args.get("country")
    if country is None:
        return jsonify({'chart_data' : None})
    data16 = standard_2016.loc[standard_2016['Country_Code'] == country].values
    data15 = standard_2015.loc[standard_2015['Country_Code'] == country].values
    data14 = standard_2014.loc[standard_2014['Country_Code'] == country].values
    data12 = standard_2012.loc[standard_2012['Country_Code'] == country].values
    data = np.concatenate((data12,data14,data15,data16),axis=0)
    data = np.transpose(data).tolist()
    data = {'chart_data' : data[1:], 'series' : series['Series_Name'].values.tolist()}
    return jsonify(data)

@app.route("/feature_country_data", methods = ['POST', 'GET'])
def feature_country_data():
    global lm
    global features_2016
    global standard_2016
    global series
    country = request.args.get("country")
    if country is None:
        return jsonify({'chart_data' : None})
    rank = util.predict_rank(lm,features_2016)
    rank = rank.sort_values(by=['Rank'])
    rank = rank.drop(['Total'],axis=1)
    country_rank = rank[rank['Country_Code']==country]['Rank'].values[0]
    sampled_data = pd.DataFrame()
    for i in range(0,15):
        if(country_rank >= (i*10) and country_rank < ((i+1)*10) ):
            temp = rank[rank['Country_Code']==country]
        else:
            rankCluster = rank.loc[rank['Rank'] >= (i*10)]
            rankCluster = rankCluster.loc[rankCluster['Rank'] < ((i+1)*10)]
            temp = rankCluster.sample(n=1, random_state=1)
        sampled_data = pd.concat([sampled_data,temp])
    sampled_country_list = sampled_data['Country_Code'].values.tolist()
    sampled_country = country_list.loc[country_list['Country_Code'].isin(sampled_country_list)]
    data2016 = standard_2016.loc[(standard_2016['Country_Code'].isin(sampled_country_list))]
    data2016 = pd.merge(sampled_data,data2016,on='Country_Code')
    data2016 = pd.merge(sampled_country,data2016,on='Country_Code')
    data2016 = data2016.sort_values(by=['Rank'])
    sampled_country_code = data2016['Country_Code'].values
    sampled_country_name = data2016['Country_Name']
    data2016 = data2016.drop(['Rank','Country_Name'],axis=1).values
    data2016 = np.transpose(data2016).tolist()
    data = {'chart_data' : data2016[1:], 'series' : series['Series_Name'].values.tolist(), 'labels': sampled_country_name.values.tolist(), 'labels_code': sampled_country_code.tolist()}
    return jsonify(data)

@app.route("/get_changed_rank", methods = ['POST', 'GET'])
def get_changed_rank():
    global standard_2016
    global sm2016
    country = request.args.get("country")
    value = request.args.get("value")
    country_list = standard_2016['Country_Code']
    data2016 = standard_2016.set_index('Country_Code')
    value = value.split(',')
    value[0] = value[0][2:]
    value[-1] = value[-1][:-2]
    value = np.array(value)
    value = value.astype(np.float)

    data2016.loc[country] = value
    keys = data2016.keys()
    data2016 = sm2016.inverse_transform(data2016.values)
    data2016 = pd.DataFrame(data2016, columns=keys)
    data2016 = pd.concat([country_list,data2016],axis=1)
    rank = util.predict_rank(lm,data2016)
    return jsonify({'rank' : rank.loc[rank['Country_Code'] == country]['Rank'].values.tolist()[0]})

@app.route("/correlation_coefficient", methods = ['POST', 'GET'])
def correlation_coefficient():
    global lm
    global series
    output = pd.DataFrame()
    output['series'] = series['Series_Name'].values
    output['coef'] = lm.coef_
    data = {'series':output['series'].values.tolist(), 'coef':output['coef'].values.tolist()}
    return jsonify(data)

@app.route("/parallel_coord", methods = ['POST', 'GET'])
def parallel_coord():
    global standard_2016
    global series

    data2016 = standard_2016.drop(['Country_Code'],axis=1)
    data = {'series' : series['Series_Name'].values.tolist(), 'values': data2016.values.tolist()}
    return jsonify(data)

if __name__ == "__main__":
    country_list = pd.read_csv("data/country_list.csv")
    region = pd.read_csv('data/region.csv',encoding = "ISO-8859-1")
    features_2016 = pd.read_csv('data/master2016.csv',encoding = "ISO-8859-1")
    features_2015 = pd.read_csv('data/master2015.csv',encoding = "ISO-8859-1")
    features_2014 = pd.read_csv('data/master2014.csv',encoding = "ISO-8859-1")
    features_2012 = pd.read_csv('data/master2012.csv',encoding = "ISO-8859-1")
    standard_2016,sm2016 = util.standardize_df(features_2016)
    standard_2015,sm2015 = util.standardize_df(features_2015)
    standard_2014,sm2014 = util.standardize_df(features_2014)
    standard_2012,sm2012 = util.standardize_df(features_2012)
    happiness_2017 = pd.read_csv('data/happiness_2017.csv',encoding = "ISO-8859-1")
    happiness_2017['Rank'] = happiness_2017['Total'].rank(ascending=False)
    series = pd.read_csv('data/series.csv',encoding = "ISO-8859-1")

    lm = util.regression(features_2016,features_2015,features_2014,features_2012)
    happiness_2017_lm = util.predict_rank(lm,features_2016)
    happiness_2017_am = util.predict_additive_Rank(standard_2016)
    app.run(debug=True, port=3015)
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0