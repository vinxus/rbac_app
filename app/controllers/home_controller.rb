class HomeController < ApplicationController
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

  def login
    render '_loginForm'
  end
end
