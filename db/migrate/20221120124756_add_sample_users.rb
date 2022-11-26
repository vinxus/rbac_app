require 'bcrypt'
class AddSampleUsers < ActiveRecord::Migration[5.2]
  include BCrypt
  def up

    4.times do |i|
      puts 'jane'.concat(i)
      pw = BCrypt::Password.create("password!?")
      #User.create(username: 'jane', password: Password.create("Abc123!?ADV"), first_name: "Jane", last_name: "Doe", role: "admin", status: "Active")
      # User.create(username: 'jane', first_name: "Jane", last_name: "Doe", role: "admin", status: "Active")
      User.create(username: "jane", password: "password!?", first_name: "Jane", last_name: "Doe", role: "admin", status: "Active")
    end
  end

  def def down 
    User.delete_all
  end
end
