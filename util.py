import pandas as pd
import numpy as np
from sklearn import preprocessing
import statsmodels.api as sm

from sklearn.linear_model import Lasso

def standardize_df(df):
	keys = df.keys()
	df_country = df['Country_Code']

	df_dropped = df.drop(['Country_Code'],axis=1)
	names = df_dropped.keys()
	scaler = preprocessing.StandardScaler()
	scaled_values = scaler.fit_transform(df_dropped)
	scaled_df = pd.DataFrame(scaled_values, columns=names)
	df = pd.concat([df_country,scaled_df],axis=1)
	return df, scaler

def regression(data2016,data2015,data2014,data2012):
	happiness_2017 = pd.read_csv('data/happiness_2017.csv',encoding = "ISO-8859-1")
	happiness_2016 = pd.read_csv('data/happiness_2016.csv',encoding = "ISO-8859-1")
	happiness_2015 = pd.read_csv('data/happiness_2015.csv',encoding = "ISO-8859-1")
	happiness_2013 = pd.read_csv('data/happiness_2013.csv',encoding = "ISO-8859-1")

	data2016 = data2016.drop(['Country_Code'],axis=1).values
	data2015 = data2015.drop(['Country_Code'],axis=1).values
	data2014 = data2014.drop(['Country_Code'],axis=1).values
	data2012 = data2012.drop(['Country_Code'],axis=1).values
	# trainY = happiness_2017['Total'].values
	trainY = np.concatenate((happiness_2017['Total'].values, happiness_2016['Total'].values, happiness_2015['Total'].values, happiness_2013['Total'].values))
	trainX = np.concatenate((data2016, data2015, data2014, data2012),axis=0)

	model = sm.OLS(trainY, trainX).fit()
	# print(model.summary())
	lasso = Lasso(alpha=0.5)
	lasso.fit(trainX, trainY)
	return lasso

def predict_rank(lasso,data):
	country_code = data['Country_Code'].unique()
	testX = data.drop(['Country_Code'],axis=1).values
	outputY = lasso.predict(testX)
	output = pd.DataFrame()
	output['Country_Code'] = country_code
	output['Total'] = outputY
	output['Rank'] = output['Total'].rank(ascending=False)
	return output

def predict_additive_Rank(data):
	happiness_df = pd.DataFrame()
	# print (len(countries), len(economic_df))
	happiness_df['Country_Code'] = data['Country_Code'].values
	happiness_df.loc[:,'Total'] = data.sum(axis=1)
	happiness_df['Rank'] = happiness_df['Total'].rank(ascending=False)
	region = pd.read_csv('data/region.csv',encoding = "ISO-8859-1")
	happiness_df['Region'] = region['Region'].values
	return happiness_df




