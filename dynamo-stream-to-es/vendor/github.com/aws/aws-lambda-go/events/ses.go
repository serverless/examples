package events

import "time"

// SimpleEmailEvent is the outer structure of an event sent via SES.
type SimpleEmailEvent struct {
	Records []SimpleEmailRecord `json:"Records"`
}

type SimpleEmailRecord struct {
	EventVersion string             `json:"eventVersion"`
	EventSource  string             `json:"eventSource"`
	SES          SimpleEmailService `json:"ses"`
}

type SimpleEmailService struct {
	Mail    SimpleEmailMessage `json:"mail"`
	Receipt SimpleEmailReceipt `json:"receipt"`
}

type SimpleEmailMessage struct {
	CommonHeaders    SimpleEmailCommonHeaders `json:"commonHeaders"`
	Source           string                   `json:"source"`
	Timestamp        time.Time                `json:"timestamp"`
	Destination      []string                 `json:"destination"`
	Headers          []SimpleEmailHeader      `json:"headers"`
	HeadersTruncated bool                     `json:"headersTruncated"`
	MessageID        string                   `json:"messageId"`
}

type SimpleEmailReceipt struct {
	Recipients           []string                 `json:"recipients"`
	Timestamp            time.Time                `json:"timestamp"`
	SpamVerdict          SimpleEmailVerdict       `json:"spamVerdict"`
	DKIMVerdict          SimpleEmailVerdict       `json:"dkimVerdict"`
	DMARCVerdict         SimpleEmailVerdict       `json:"dmarcVerdict"`
	SPFVerdict           SimpleEmailVerdict       `json:"spfVerdict"`
	VirusVerdict         SimpleEmailVerdict       `json:"virusVerdict"`
	Action               SimpleEmailReceiptAction `json:"action"`
	ProcessingTimeMillis int64                    `json:"processingTimeMillis"`
}

type SimpleEmailHeader struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type SimpleEmailCommonHeaders struct {
	From       []string `json:"from"`
	To         []string `json:"to"`
	ReturnPath string   `json:"returnPath"`
	MessageID  string   `json:"messageId"`
	Date       string   `json:"date"`
	Subject    string   `json:"subject"`
}

type SimpleEmailReceiptAction struct {
	Type           string `json:"type"`
	InvocationType string `json:"invocationType"`
	FunctionArn    string `json:"functionArn"`
}

type SimpleEmailVerdict struct {
	Status string `json:"status"`
}
