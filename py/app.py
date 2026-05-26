from flask import Flask, request, jsonify
from flask_cors import CORS
import ee
from geopy.geocoders import Nominatim

# initialize earth engine
ee.Initialize()

app = Flask(__name__)
CORS(app)

geolocator = Nominatim(user_agent="floodwatch-ai")

@app.route('/search-location', methods=['POST'])
def search_location():

    data = request.json
    location_name = data['location']

    # geocode location
    location = geolocator.geocode(location_name)

    latitude = location.latitude
    longitude = location.longitude

    point = ee.Geometry.Point([longitude, latitude])

    # Sentinel-1 SAR imagery
    collection = (
        ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(point)
        .filterDate('2025-01-01', '2025-05-30')
        .select('VV')
    )

    image = collection.mean()

    # fake flood analysis for demo
    flood_probability = 78
    ndwi = 0.41
    risk_level = "High"

    # map visualization
    map_id = image.getMapId({
        'min': -25,
        'max': 5
    })

    # tif download url
    download_url = image.getDownloadURL({
        'scale': 10,
        'region': point.buffer(5000).bounds(),
        'format': 'GEO_TIFF'
    })

    return jsonify({
        'latitude': latitude,
        'longitude': longitude,
        'tile_url': map_id['tile_fetcher'].url_format,
        'download_url': download_url,
        'flood_probability': flood_probability,
        'ndwi': ndwi,
        'risk_level': risk_level,
        'recommendation': 'Flood water detected near agricultural parcels.'
    })

if __name__ == '__main__':
    app.run(debug=True)