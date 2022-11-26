require 'bcrypt'


class HomeController < ApplicationController
  include BCrypt
  def index
  end

  def admin
  end

  def user
    # This could be obtained from the database
    @user = {'name' => 'Firstname lastName'}
    @userData = [
      { 'info' => 'User content one', }, 
      {'info' => 'User content two'}
  ]
  end

  # GET
  def login
    @data = {'loginjs' => 'loginForm'}
  end

  # POST /auth_user.json
  def authenticate
      render json: { 'user' => auth_user, 'token' => token }
  end

  private
  def auth_user
    # data = User.find_by(username: params[:username], password: BCrypt::Password.create(params[:password]))
    user_data = User.find_by(username: params[:username])

    if (BCrypt::Password.new(user_data.password) == params[:password])
          @auth_user =  {'username' => user_data.username, 'role' => user_data.role, 'status' => user_data.status}
  
    else
         @auth_user = {'message' => 'User not found', 'error' => true}
    end
  end
  def token
      token = JWT.encode auth_user, hmac_secret, 'HS256'
  end  
  def hmac_secret
    ENV["API_SECRET_KEY"]
  end
end
