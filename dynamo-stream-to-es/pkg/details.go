package dstream

import (
	"errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
)

// DynamoDetails is
type DynamoDetails struct {
	dynamodbiface.DynamoDBAPI
}

// Details is the data needed to index the most recent dataoff to elasticsearch
type Details struct {
	HashKey, RangeKey, TableName string
}

// Get Extracts out the attribute Value of Hash Key and Range key from the describe table output
func (d *DynamoDetails) Get(tableName string) (details *Details, err error) {
	var (
		out *dynamodb.DescribeTableOutput
	)

	req, out := d.DescribeTableRequest(&dynamodb.DescribeTableInput{
		TableName: aws.String(tableName),
	})

	if err = req.Send(); err != nil {
		return nil, err
	}

	// We need a hash key to uniquely identify records
	h := findAttributeByKeyType(out.Table.KeySchema, "HASH")
	if h == nil {
		return nil, errors.New("Could not dereference hash key")
	}
	hashKey := *h

	// range keys are nice, but we don't necessarily need one to uniquely identify a Dynamo Record
	var rangeKey string
	r := findAttributeByKeyType(out.Table.KeySchema, "RANGE")
	if r != nil {
		rangeKey = *r
	} else {
		rangeKey = ""
	}

	return &Details{
		TableName: tableName,
		HashKey:   hashKey,
		RangeKey:  rangeKey,
	}, nil
}

func findAttributeByKeyType(schema []*dynamodb.KeySchemaElement, keyType string) *string {
	var t *string
	for _, element := range schema {
		t = element.KeyType
		if *t == keyType {
			return element.AttributeName
		}
	}
	return nil
}
