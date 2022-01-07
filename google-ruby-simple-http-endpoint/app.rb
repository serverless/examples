# app.rb
require "functions_framework"

FunctionsFramework.http("hello") do |request|
  "Hello, world!\n"
end
