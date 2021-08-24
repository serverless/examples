# frozen_string_literal: true

require 'aws-sdk-ses'
require 'logger'

class SesAdapter

  def initialize
    @ses_client = Aws::SES::Client.new
  end

  def send_email
    ses_client.send_email(mail_data)
    logger.info('Email was sent')
  rescue Aws::SES::Errors => error
    logger.error(error)
  end

  private

  attr_reader :ses_client

  def mail_data
    sender = ENV['sender']
    recipient = ENV['recipient']
    subject = 'Employee added'
    textbody = "This email was sent with Amazon SES triggers via AWS Step Functions.
    Added new employee."

    encoding = 'UTF-8'
    htmlbody =
      "<h1>Employee added</h1>"\
      "<p>This email was sent with Amazon SES triggers via AWS Step Functions.
      Added new employee.</p>"\

    {
      destination: {
        to_addresses: [
          recipient
        ]
      },
      message: {
        body: {
          html: {
            charset: encoding,
            data: htmlbody
          },
          text: {
            charset: encoding,
            data: textbody
          }
        },
        subject: {
          charset: encoding,
          data: subject
        }
      },
      source: sender
    }
  end

  def logger
    @logger ||= Logger.new($stdout)
  end
end
