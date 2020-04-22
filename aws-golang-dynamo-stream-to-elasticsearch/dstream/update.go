package dstream

import (
	"context"
	"fmt"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	es "github.com/olivere/elastic"
)

// Elasticsearch is an ES Client which will perform Elasticsearch Updates for Dynamo Items
type Elasticsearch struct {
	*es.Client
}

// Update takes a reference to adstream.Details object;
// which is used to figure out which Elasticsearch Index to update;
// And an item map[string]events.DynamoDBAttributeValue which will be turned into JSON
// then indexed into Elasticsearch
func (e *Elasticsearch) Update(d *Details, item map[string]events.DynamoDBAttributeValue) (*es.IndexResponse, error) {
	tmp := eventStreamToMap(item)
	var i interface{}
	if err := dynamodbattribute.UnmarshalMap(tmp, &i); err != nil {
		return nil, err

	}
	resp, err := e.Index().
		Id(d.docID(item)).
		Type(d.docType()).
		Index(d.index()).
		BodyJson(i).
		Do(context.Background())

	if err != nil {
		return nil, err
	}

	return resp, nil
}

func (d *Details) docType() string {
	if d.RangeKey != "" {
		return fmt.Sprintf("%s-%s", d.HashKey, d.RangeKey)
	}
	return d.HashKey
}

func (d *Details) docID(item map[string]events.DynamoDBAttributeValue) (id string) {
	if d != nil {
		if d.RangeKey != "" {
			id = fmt.Sprintf("%s-%s", item[d.HashKey].String(), item[d.RangeKey].String())
		} else {
			id = item[d.HashKey].String()
		}
	}
	return id
}

func (d *Details) index() string {
	return strings.ToLower(d.TableName)
}

// ugly hack because the types
// events.DynamoDBAttributeValue != *dynamodb.AttributeValue
func eventStreamToMap(attribute interface{}) map[string]*dynamodb.AttributeValue {
	// Map to be returned
	m := make(map[string]*dynamodb.AttributeValue)

	tmp := make(map[string]events.DynamoDBAttributeValue)

	switch t := attribute.(type) {
	case map[string]events.DynamoDBAttributeValue:
		tmp = t
	case events.DynamoDBAttributeValue:
		tmp = t.Map()
	}

	for k, v := range tmp {
		switch v.DataType() {
		case events.DataTypeString:
			s := v.String()
			m[k] = &dynamodb.AttributeValue{
				S: &s,
			}
		case events.DataTypeBoolean:
			b := v.Boolean()
			m[k] = &dynamodb.AttributeValue{
				BOOL: &b,
			}
		case events.DataTypeMap:
			m[k] = &dynamodb.AttributeValue{
				M: eventStreamToMap(v),
			}
		case events.DataTypeNumber:
			n := v.Number()
			m[k] = &dynamodb.AttributeValue{
				N: &n,
			}
		case events.DataTypeList:
			m[k] = &dynamodb.AttributeValue{
				L: eventStreamToList(v),
			}
		}
	}
	return m
}

// ugly hack because the types
// events.DynamoDBAttributeValue != *dynamodb.AttributeValue
func eventStreamToList(attribute interface{}) []*dynamodb.AttributeValue {
	// List to be returned
	l := make([]*dynamodb.AttributeValue, 0)

	var tmp []events.DynamoDBAttributeValue

	switch t := attribute.(type) {
	case []events.DynamoDBAttributeValue:
		tmp = t
	case events.DynamoDBAttributeValue:
		tmp = t.List()
	}

	for _, v := range tmp {
		switch v.DataType() {
		case events.DataTypeString:
			s := v.String()
			l = append(l, &dynamodb.AttributeValue{
				S: &s,
			})
		case events.DataTypeBoolean:
			b := v.Boolean()
			l = append(l, &dynamodb.AttributeValue{
				BOOL: &b,
			})
		case events.DataTypeMap:
			l = append(l, &dynamodb.AttributeValue{
				M: eventStreamToMap(v),
			})
		case events.DataTypeNumber:
			n := v.Number()
			l = append(l, &dynamodb.AttributeValue{
				N: &n,
			})
		case events.DataTypeList:
			l = append(l, &dynamodb.AttributeValue{
				L: eventStreamToList(v),
			})
		}
	}
	return l
}
