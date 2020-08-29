package geomap

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
)

/*
	Google Map API package
	Containing model and API call for:
	- Google geocoding
	- Google geolocation detail
	- Google get nearby
	- Google search location

	Each of the api call will need the google map API key
*/

type GooglePlaceDetailResponse struct {
	HTMLAttributions []interface{} `json:"html_attributions"`
	Result           struct {
		AddressComponents        []AddressComponent  `json:"address_components"`
		AdrAddress               string              `json:"adr_address"`
		FormattedAddress         string              `json:"formatted_address"`
		FormattedPhoneNumber     string              `json:"formatted_phone_number"`
		Geometry                 GoogleGeometry      `json:"geometry"`
		Icon                     string              `json:"icon"`
		ID                       string              `json:"id"`
		InternationalPhoneNumber string              `json:"international_phone_number"`
		Name                     string              `json:"name"`
		OpeningHours             OpeningHour         `json:"opening_hours"`
		Photos                   []Photo             `json:"photos"`
		PlaceID                  string              `json:"place_id"`
		PlusCode                 GooglePlusCode      `json:"plus_code"`
		PriceLevel               int                 `json:"price_level"`
		Rating                   float64             `json:"rating"`
		Reference                string              `json:"reference"`
		Reviews                  []GooglePlaceReview `json:"reviews"`
		Scope                    string              `json:"scope"`
		Types                    []string            `json:"types"`
		URL                      string              `json:"url"`
		UserRatingsTotal         int                 `json:"user_ratings_total"`
		UtcOffset                int                 `json:"utc_offset"`
		Vicinity                 string              `json:"vicinity"`
		Website                  string              `json:"website"`
	} `json:"result"`
	Status string `json:"status"`
}

type GoogleGeocodeResponse struct {
	Results []struct {
		AddressComponents []AddressComponent `json:"address_components"`
		FormattedAddress  string             `json:"formatted_address"`
		Geometry          GoogleGeometry     `json:"geometry"`
		PlaceID           string             `json:"place_id"`
		PlusCode          GooglePlusCode     `json:"plus_code"`
		Types             []string           `json:"types"`
	} `json:"results"`
	Status string `json:"status"`
}

type GooglePlaceSearchResponse struct {
	Candidates []Candidate `json:"candidates"`
	Status     string      `json:"status"`
}

type GoogleNearbySearchResponse struct {
	HTMLAttributions []interface{} `json:"html_attributions"`
	Results          []struct {
		Geometry         GoogleGeometry `json:"geometry"`
		Icon             string         `json:"icon"`
		ID               string         `json:"id"`
		Name             string         `json:"name"`
		OpeningHours     OpeningHour    `json:"opening_hours"`
		Photos           []Photo        `json:"photos"`
		PlaceID          string         `json:"place_id"`
		PlusCode         GooglePlusCode `json:"plus_code"`
		PriceLevel       int            `json:"price_level,omitempty"`
		Rating           float64        `json:"rating"`
		Reference        string         `json:"reference"`
		Scope            string         `json:"scope"`
		Types            []string       `json:"types"`
		UserRatingsTotal int            `json:"user_ratings_total"`
		Vicinity         string         `json:"vicinity"`
	} `json:"results"`
	Status string `json:"status"`
}

type OpeningHour struct {
	OpenNow bool `json:"open_now"`
	Periods []struct {
		Open struct {
			Day  int    `json:"day"`
			Time string `json:"time"`
		} `json:"open"`
	} `json:"periods,omitempty"`
	WeekdayText []string `json:"weekday_text,omitempty"`
}

type GooglePlaceReview struct {
	AuthorName              string `json:"author_name"`
	AuthorURL               string `json:"author_url"`
	Language                string `json:"language"`
	ProfilePhotoURL         string `json:"profile_photo_url"`
	Rating                  int    `json:"rating"`
	RelativeTimeDescription string `json:"relative_time_description"`
	Text                    string `json:"text"`
	Time                    int    `json:"time"`
}

type Candidate struct {
	FormattedAddress string  `json:"formatted_address"`
	Name             string  `json:"name"`
	Photos           []Photo `json:"photos"`
	Rating           int     `json:"rating"`
}

type Photo struct {
	Height           int      `json:"height"`
	HTMLAttributions []string `json:"html_attributions"`
	PhotoReference   string   `json:"photo_reference"`
	Width            int      `json:"width"`
}

type GooglePlusCode struct {
	CompoundCode string `json:"compound_code"`
	GlobalCode   string `json:"global_code"`
}

type AddressComponent struct {
	LongName  string   `json:"long_name"`
	ShortName string   `json:"short_name"`
	Types     []string `json:"types"`
}

type GoogleGeometry struct {
	Location     GoogleLocation `json:"location"`
	LocationType string         `json:"location_type,omitempty"`
	Viewport     GoogleViewport `json:"viewport"`
}

type GoogleLocation struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

type GoogleViewport struct {
	Northeast GoogleLocation `json:"northeast"`
	SouthWest GoogleLocation `json:"southwest"`
}

var (
	client *http.Client
)

func init() {

	client = &http.Client{}
}

/*
	GetReverseGeoCode will return GoogleReverseGeocodeResponse on success
	the example of usage is sending params that contains "address" and "key" (both of them are required)
	more references https://developers.google.com/maps/documentation/geocoding/intro#Geocoding
*/
func GetGeocode(ctx context.Context, params map[string]string) (GoogleGeocodeResponse, error) {

	var googleGeocodeResponse GoogleGeocodeResponse

	//Generating url for geocode
	reqURL := "https://maps.googleapis.com/maps/api/geocode/json"

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return googleGeocodeResponse, err
	}

	//Insert the query mapping into the request
	q := req.URL.Query()
	for key, val := range params {
		q.Add(key, val)
	}
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	if err != nil {
		return googleGeocodeResponse, err
	}

	if resp.StatusCode != http.StatusOK {
		return googleGeocodeResponse, errors.New("Status not OK")
	}

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return googleGeocodeResponse, err
	}

	//Unmarshal the contents
	err = json.Unmarshal(contents, &googleGeocodeResponse)
	if err != nil {
		return googleGeocodeResponse, err
	}

	return googleGeocodeResponse, nil
}

/*
	FindPlace will return GooglePlaceSearchResponse on success
	more references https://developers.google.com/places/web-service/search
*/
func FindPlace(ctx context.Context, params map[string]string) (GooglePlaceSearchResponse, error) {

	var googleFindPlaceResponse GooglePlaceSearchResponse

	//Generating url for geocode
	reqURL := "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return googleFindPlaceResponse, err
	}

	//Insert the query mapping into the request
	q := req.URL.Query()
	for key, val := range params {
		q.Add(key, val)
	}
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	if err != nil {
		return googleFindPlaceResponse, err
	}

	if resp.StatusCode != http.StatusOK {
		return googleFindPlaceResponse, errors.New("Status not OK")
	}

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return googleFindPlaceResponse, err
	}

	//Unmarshal the contents
	err = json.Unmarshal(contents, &googleFindPlaceResponse)
	if err != nil {
		return googleFindPlaceResponse, err
	}

	return googleFindPlaceResponse, nil
}

/*
	FindPlace will return GoogleNearbySearchResponse on success
	more references https://developers.google.com/places/web-service/search
*/
func PlaceNearby(ctx context.Context, params map[string]string) (GoogleNearbySearchResponse, error) {

	var googleNearbySearchResponse GoogleNearbySearchResponse

	//Generating url for geocode
	reqURL := "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return googleNearbySearchResponse, err
	}

	//Insert the query mapping into the request
	q := req.URL.Query()
	for key, val := range params {
		q.Add(key, val)
	}
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	if err != nil {
		return googleNearbySearchResponse, err
	}

	if resp.StatusCode != http.StatusOK {
		return googleNearbySearchResponse, errors.New("Status not OK")
	}

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return googleNearbySearchResponse, err
	}

	//Unmarshal the contents
	err = json.Unmarshal(contents, &googleNearbySearchResponse)
	if err != nil {
		return googleNearbySearchResponse, err
	}

	return googleNearbySearchResponse, nil
}

/*
	FindPlace will return GooglePlaceDetailResponse on success
	more references https://developers.google.com/places/web-service/details
*/
func PlaceDetail(ctx context.Context, params map[string]string) (GooglePlaceDetailResponse, error) {

	var googlePlaceDetailResponse GooglePlaceDetailResponse

	//Generating url for geocode
	reqURL := "https://maps.googleapis.com/maps/api/place/details/json"

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return googlePlaceDetailResponse, err
	}

	//Insert the query mapping into the request
	q := req.URL.Query()
	for key, val := range params {
		q.Add(key, val)
	}
	req.URL.RawQuery = q.Encode()

	resp, err := client.Do(req)
	if err != nil {
		return googlePlaceDetailResponse, err
	}

	if resp.StatusCode != http.StatusOK {
		return googlePlaceDetailResponse, errors.New("Status not OK")
	}

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return googlePlaceDetailResponse, err
	}

	//Unmarshal the contents
	err = json.Unmarshal(contents, &googlePlaceDetailResponse)
	if err != nil {
		return googlePlaceDetailResponse, err
	}

	return googlePlaceDetailResponse, nil
}
