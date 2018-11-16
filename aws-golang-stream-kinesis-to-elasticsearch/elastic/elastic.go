package elastic

import (
	"context"
	"log"
	"os"
	"time"

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
	p, err := e.Client.BulkProcessor().
		Name("kinesisWorkers").
		Workers(2).
		BulkSize(2 << 20). // set the max bulk size to 2MB
		FlushInterval(10 * time.Second).
		Do(context.Background())
	if err != nil {
		return err
	}
	defer p.Close()

	for _, x := range data {
		rec := elastic.NewBulkIndexRequest().Index("kinesis-apm").Type("doc").Doc(x.Kinesis.Data)
		p.Add(rec)
	}

	return p.Flush()
}
