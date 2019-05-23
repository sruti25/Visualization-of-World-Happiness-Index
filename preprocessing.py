import csv
import pandas as pd
import numpy as np
import math

#This file not be present in the repository, as the data generated after running the scripts is only uploaded
df = pd.read_csv('data/master.csv',encoding = "ISO-8859-1")
keys = df.keys()
print (keys)


# EXTRACT SERIES NAME AND SERIES CODE
features_code = df['Series_Code'].unique()
df_list = list(df.values)
features = []
for i in range(23):
	features.append(df_list[i][2])
series_list = pd.DataFrame(np.column_stack([features_code, features]), 
                               columns=['Series_Code', 'Series_Name'])
print (series_list)
series_list.to_csv('data/series_list.csv', index=False)

#EXTRACT COUNTRY NAME AND COUNTRY CODE
country_code = df['Country_Code'].unique()
df_list = list(df.values)
countries = []
for i in range(0,len(df_list),23):
	countries.append(df_list[i][1])
countries_list = pd.DataFrame(np.column_stack([country_code, countries]), 
                               columns=['Country_Code', 'Country_Name'])
print (countries_list)
countries_list.to_csv('data/country_list.csv', index = False)

#EXTRA 2018 DATA FOR EACH COUNTRY
features_code = df['Series Code'].unique().tolist()
countries = df['Country Code'].unique().tolist()
features_code.insert(0,'Country_Code')
newdf_data = []
for c in countries:
	temp = [0 for i in range(17)]
	temp.insert(0,c)
	newdf_data.append(temp)
newdf = pd.DataFrame.from_records(newdf_data, columns=features_code, index ='Country_Code')
# print (newdf)
df_list = list(df.values) 
for i in range(len(df_list)):
	d = df_list[i]
	country = d[1]
	series = d[3]
	value = d[-5] #Changed this index for each year
	newdf[series][country] = value
newdf.to_csv('data/master2012.csv')



