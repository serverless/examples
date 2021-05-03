# frozen_string_literal: true

require 'sinatra'
require 'sinatra/json'
require 'aws-sdk-dynamodb'

client_options = if ENV['IS_OFFLINE']
                   {
                     region: 'localhost',
                     endpoint: 'http://localhost:8000',
                     credentials: Aws::Credentials.new(
                       'DEFAULT_ACCESS_KEY',
                       'DEFAULT_SECRET'
                     )
                   }
                 else
                   {}
                 end
dynamodb_client = Aws::DynamoDB::Client.new(client_options)

get '/users/:user_id' do
  result = dynamodb_client.get_item(
    key: { 'userId': params[:user_id] },
    table_name: ENV['USERS_TABLE']
  )
  item = result.item
  if item
    json user_id: item['userId'], name: item['name'] if item
  else
    json error: "Could not find user with userId: #{params[:user_id]}"
  end
end

post '/users' do
  request_payload = JSON.parse(request.body.read)
  user_id = request_payload['user_id']
  name = request_payload['name']

  return json error: "Please provide both 'user_id' and 'name'" unless user_id && name

  dynamodb_client.put_item(
    item: {
      'userId': user_id,
      'name': name
    },
    table_name: ENV['USERS_TABLE']
  )

  json user_id: user_id, name: name
end
