# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
require 'bcrypt'
include BCrypt
pw = BCrypt::Password.create("password123!?")
users = [{'first_name' => 'Normal', 'last_name' => 'User',  'role' => 'user'},
   {'first_name' => 'Adman', 'last_name' => 'Usera',  'role' => 'admin'}, 
   {'first_name' => 'Regular', 'last_name'=>  'User', 'role' => 'user'},
   {'first_name' => 'Joe', 'last_name' => 'Bloggs', 'role' => 'super'}
]

users.each do |user|
   puts user['first_name'].downcase() 
    User.create(username: user['first_name']
    .downcase().concat('_').concat(user['last_name'].downcase()), 
    password: pw, first_name: user['first_name'], 
    last_name: user['last_name'], role: user['role'], status: "Active")
 end