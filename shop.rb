require 'bundler/setup'

Bundler.require

get '/' do
  erb :index
end

get '/taxes' do
  # how many drinks * 100 cents
  "$ " + (Array(params[:drink]).length-1).to_s + ".00"
end

post '/shop' do
  # Both of these instructions are passed onto the server console
  # puts "Receiving order"
  # puts params.inspect

  content_type :json
  
  response = [] 

  params[:drink].each do |drink|
    response << { 
      name: drink
    }
  end

  response.to_json

end

post '/signup' do
  puts "\n" * 3
  puts "Received email: #{params[:email]}"
  puts "\n" * 3

  "Thanks for signing up!"
end