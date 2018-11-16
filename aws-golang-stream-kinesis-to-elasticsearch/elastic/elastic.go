package elastic

import (
	"context"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/olivere/elastic"
)

// Elastic is our default struct for connecting through to elasticsearch
type Elastic struct {
	Client *elastic.Client
}

// NewClient instantiates a connection to elasticsearch for direct push
func NewClient(host, schema string) (*Elastic, error) {
	client, err := elastic.NewClient(
		elastic.SetURL(host),
		elastic.SetScheme(schema),
		elastic.SetSniff(false),
		elastic.SetErrorLog(log.New(os.Stderr, "ELASTIC ", log.LstdFlags)),
		elastic.SetInfoLog(log.New(os.Stdout, "", log.LstdFlags)),
	)
	return &Elastic{client}, err
}

// PushRecords sends a particular batch of docs over to elasticsearch endpoint
func (e *Elastic) PushRecords(data []events.KinesisEventRecord) error {
	for _, x := range data {
		_, err := e.Client.Index().
			Index("sebtest-apm").
			Type("doc").
			BodyJson(x.Kinesis.Data).
			Do(context.Background())
		if err != nil {
			return err
		}
	}
	return nil
}
