# Welcome to the rbac_app wiki!
## Creating a simple RBAC/ACL Web App using RubyOnRails and JavaScript 

## Introduction
We are going to create a simple RBAC (Role Based Access Control) MVC app that uses RubyOnRails backend for the authentication and authorisation to a protected frontend area of the web app. The app will use jquery ajax to post and get information from the backend and jquery-ui dialog to present a login dialog to users of the app in the frontend. Once the user is authenticated, we will redirect them to a landing page. This landing page will either be their last viewed page or the their default/user page. We will also keep track of their navigations on the site and use json web token to store a session variable in the frontend (windows.localStorage).

The intension is to demonstrate how the disparate technologies can be used together to manage the user experience of the site and not necessarily the only way this can be done. Bearing in mind that some of the programming languages in use here are quite opinionate (Rails – we are talking about you), this example just aims to show how we can seamlessly use the stack – RubyOnRails Framework/JavaScript libraries (e.g Jquery).

The demo code is hosted on [here (https://github.com/vinxus/rbac_app) on GitHub.](https://github.com/vinxus/rbac_app)

## Application logic layout

Figure 1.1 shows the flowchart layout of the application logic we will build.
















![image](https://user-images.githubusercontent.com/5231114/204150349-4ba53bd2-5a3e-4639-aab6-ea14b331adfa.png)










Figure 1.1 RBAC Application Flowchart



The Basic UML representation of the application is shown in figure 1.2. These figures gives us a mental overview of what we are trying to do. Which allows us to manage the development process and also gives us an anchor for implementing changes whenever we need to.























![image](https://user-images.githubusercontent.com/5231114/204142566-d2a0939b-0e60-4751-8281-52a3e10815de.png)










Figure 1.2 UML Diagram of the App


What we are going to build:
1. Default Landing page
2. Login Form
3. User sections of the app - User RBAC/ACL controlled areas
4. Database – Tables (User table)
5. JWT signing and decoding

## Getting Started
Assumptions
- Linux OS (Ubuntu 18.04)
- Ruby already installed – If not, you can get a copy from – [ruby-lang.org](https://www.ruby-lang.org/en/documentation/installation/). (RVM is recommended). 
-  SQLite3 – instructions for installation at [SQLite3 website](https://www.sqlite.org/)

### Installing Rails
$ ruby -v
ruby 2.6.3p62 (2019-04-16 revision 67580) [x86_64-linux]

If you are running a different version of ruby than above you might need to do: 
$ bash --login
$ rvm use 2.5.1
using ruby-2.5.1

Note: RVM will help manage the Ruby versions i.e. installing different versions, switching between versions etc.

$ sqlite3 –version
3.31.1 2020-01-27 19:55:54 3bfa9cc97da10598521b342961df8f5f68c7388fa117345eeb516eaa837balt1
version build datetime and build number

To install Rails – use RubyGems
$ gem install rails

Check version
$ rails –version
Rails 5.2.8.1
(Your version will be different)

Creating the App
$ rails new rbac_app

This will setup a Rails application in a directory called ‘rbac_app’ which will contain a gem file with all the dependencies of the Rails application. It will also include a ‘package.json’ file for the JavaScript libraries/frameworks


$ cd rbac_app

You will need to run bundle install to install missing gems.


![image](https://user-images.githubusercontent.com/5231114/204143251-28d0e84b-c610-485c-9d03-cf2de49d0b52.png)











Figure 1.3 App folder layout

Gemfile
Add the following to the Gemfile to enable jwt – json web token, jquery and jquery-ui.


gem 'jwt'
gem 'jquery-rails'
gem 'jquery-ui-rails'
gem ‘dotenv-rails’

$ bundle install

### Possible Issues
You might encounter some errors here due to module dependencies incompatibilities issues. The easiest way to fix these issues is to pay attention to the gems and their versions as reported in the error message. Then try to install the correct versions using gem install command. You can find RubyGems here – the gem repository: https://rubygems.org/gems/<gem name>/<version number>.

Install using the bundler or the gem command, for example bundle install – from the application root folder or gem install jwt.

I have also had to sometimes download the gems directly from the gems repository, put the downloaded gem files in the local cache and then run gem install. This is due to corrupted gem files in the local cache.

Once every thing is fine after running - bundle install you will see a message like:
...
Using sqlite3 1.3.13
Using turbolinks-source 5.2.0
Using turbolinks 5.2.1
Using uglifier 4.2.0
Using web-console 3.7.0
Bundle complete! 18 Gemfile dependencies, 79 gems now installed.
Use `bundle info [gemname]` to see where a bundled gem is installed.

Test your setup with
$ rails server

You can go to the site on http://localhost:3000/ (:3000 – default port)

You can specify a different port by running:
$ rails server -p NEW_PORT_NUMBER (of course <= 65535, avoid 0 – 1023 these are well known ports). We are going to use PORT 3003 for this app. So whenever you see PORT assume 3003. You can use any port number you like as long as it does not clash with an ‘in use’ port. If you visit the url you will see:














![image](https://user-images.githubusercontent.com/5231114/204143527-483a783f-80f5-4a35-b81e-71194e4f9e18.png)






					Figure 1.4 Rails Default Page

If you encounter an error Like ActiveRecord::ConnectionNotEstablished be sure to run:
 
$ rails db:create

This will create the sqlite db files for the app: ‘db/development.sqlite3’ and ‘db/test.sqlite3’ or other db files specified in the database.yml file. Be sure to restart your server – Key combination ‘Control+C’ to stop and command ‘rails server -p <PORT>’ to start.

Default Landing, Admin, Users and Login Controller/Actions
As This is a(n) MVC app, we will use one Controller and several actions.
Create the Home controller with the actions for pages (index, admin, user and login).
 
$ bin/rails generate controller Home index admin user login

The route file will look like this:

Rails.application.routes.draw do
  get 'home/index'
  get 'home/admin'
  get 'home/user'
  get 'home/login'
end


Add the following line befor the end statement to change the Ruby welcome page to the Apps home page.

root 'home#index'


### Login form
We start from this form view:

![image](https://user-images.githubusercontent.com/5231114/204144018-9e61f566-7903-4fc3-89fc-9d8637b08ffb.png)




Figure 1.5 Flat Login form

To this:

![image](https://user-images.githubusercontent.com/5231114/204144104-363364dd-19fc-44bf-a43a-0f0b8aa851ed.png)












Figure 1.6 Popup Login dialog

The last command creates the following:
Controller Action:
1. login - We will render a form template named ‘_loginForm’ which is located in home/views folder


2. index - The default landing page - home/index
Home page frontend logic 	
Before loading content check if there we need to login:
	i. Check for active session
   		a. Check if it is valid
   		b. if it is direct to the last page (if that exists)
   		c. do nothing if a previous page does not exist
	ii. If no active session or an invalid session (delete the invalid session)
   		a. doLogin - redirect to login page

3. admin – this will be the landing page for the admin
Accessible after the user has logged in and verified as an admin

4. user – the user landing page

To sign and decode our login credentials/session token, we need a controller/action which we will call ‘authenticator’ for now. This will contain 2 actions ajax_sign_token and ajax_decode_token.

Create it using:
$ bin/rails g controller authenticator ajax_sign_token and ajax_decode_token -–no-assets

The ‘-–no-assets’ option prevents the creation of styling (css) and javascripts files.

We will need to add the authenticator route to the config/route.rb file. Annotating with right verb (get/put) 

Add these 2 lines to the routes file:
  post 'authenticator/ajax_sign_token'
  get 'authenticator/ajax_decode_token'

This creates a controller action that will be used to authenticate the user and send back the user and token json object.

### Controllers
HomeController
Renders the index, admin, user and login template pages.
Index action:
We render/load the default index template

**Admin action:**
Loads the admin page

**User action:**
Loads the logged in user’s home page

**Login action:**
We render the login form as a partial within the login template. We could have simply rendered this from within the action but because we might want to change implementation strategy in future i.e. no popup dialog, it best to load the form as a partial.

The form content is initially hidden because we are going to use jQuery selector to show it once the javascripts libraries have finished loading.


**AuthenticatorController**
Used for encoding/signing and decoding the data packet sent from the frontend by ajax calls.


### Assets Pipeline
For our system to work we have to remove the ‘require tree .’ from the applications.js file as we want to selectively load the our js files and not all at the same time.

The actions javascripts/coffescripts files are created auttomatically using the names of the actions by default. If we add any javascript file to our app our strategy will be to return the name of our file in a @data variable from within the action see code below (this is because we are not using the default strategy of precompiling all assets in the asset/javascript location as indicated in the previous paragraph). So we define that in the action method as below:

`  def login`
    `@data = {'loginjs' => 'loginForm'}`
  `end`

Next add  <%= javascript_include_tag @data['loginjs'] %> to the login template just above the render line.

Note: we could easily have specified the name ('loginForm') of the form in view template javascript_include_tag. Doing it with a variable gives us a bit more programmatic control.

Finally To precomile our ‘loginForm.js’ file we add the following line to config/initializers/assets.rb file 

Rails.application.config.assets.precompile += %w( loginForm.js )
Rails.application.config.assets.precompile += %w( home.js )`

– and restarted the server.

This will make our javascript load and we get the dialog popup base on the application logic.


For the authentication to work we add the authenticate action to our home controller.

def authenticate
end

This is the action that will respond to the post from the login form. We are not going to add any action to the form as we are using an ajax call function that is loaded by our dialog box configuration option – in javascripts functions are first class citizens – so they can be passed around like arguments.

### Assets
    Templates  
	_loginForm.html.erb
JavaScripts
    jquery – Ajax calls
    jquery-ui – Dialog widget
Async & Await calls
    An asynchronuos call was used to do the login and store the returned authentication token (activeLogin and doLogin).

In addition to this, we used the redirectPage() method to send the user to the page stored in the lastPage variable.



For jquery to work in our app we will add the following lines to our assets/javascripts/application.js file:

`//= require jquery`
`//= require jquery-ui`

and the following lines to assets/stylesheets/application.css:
` *= require jquery-ui`
 `*= require jquery-ui/dialog`

We now create a javascript file called LoginForm.js in the assets/javascripts folder. We will be adding the frontend application authetication and authorisation logic here.
   
Make sure there is no space between the double backslashes ‘//’ and equal sign ‘=’. These character sequence is needed by Sprockets when interpreting the application file in order to include the specified libraries.
	
JWT signing and decoding
What is JWT?
JWT – Json web tokens is a way to encrypt data packets using different encryption algorithms. In this app we did not use any when signing our data packet and hence we also did not specify any when decoding the token generated. 

The jwt gem is based on RFC7519 open standard.

Below is a shortlist of possible encryption algorithms:
NONE, HMAC, RSASSA and ECDSA 

Refer to the [JWT Github](https://github.com/jwt/ruby-jwt) page for more information.


Note that when you must decrypt/decode your packet with the same algorithm used to sign the original packet.

These are the lines used to sign/encode/encrypt and decode/decrypt our data in the authenticator controller:

`token = JWT.encode params, nil, false`

`payload = JWT.decode params[:token], nil, false`

DotEnv
To allow us manage environment variables like the API_SECRET and DB_PASSWORDS etc., we added a .env file. This functionality is supported by the dotenv gem we installed earlier. You can create different .env files to support your applications development (.env.dev), testing (.env.test) and deployment/production (.env.prod). The main consideration here is not to add sensitive information to any enviroment file (.env) that will be pushed to a repository. Always add these .env files to your .gitignore (or .hgignore) file.

Store default enviromental variables that need to be shared in .env files you are pushing to a repository, do not put sensitive data like passwords or encryption keys in them.



## Frontend Logic

### Methods:
**createDialog **
This function creates a generic dialog and runs code passed in with the buttons parameter – an object containing the buttons to display. If no buttons are passed in the only button that will be displayed is ‘Close’ button. This button will simply destroy the dialog upon being clicked.

**activeLogin**
This checks for an active login by looking for an active session variable in the browser local storage. The active session variable is a jwt token. If the token exists, the activeLogin function will do an ajax call to decode the jwt token and extract the expireAt time variable. This variable will be used to check for the life time/time-to-live (TTL) or expiration of the session i.e. the validity of the session. If the session is still active/valid we return true, this allows the system to redirect to the last page the user was on or the landing page if not. If the session is variable is removed then false is returned. Returning false means we need to do a login.
		    
`let activeLogin = async () => {`
	  `if ($('#userName').val() == '') {`
	        `$('#userName').focus();`
	       `return false     `
                  `}`
	`if ($('#password').val() == '') {`
                        `$('#password').focus();`
	      `return false     `
	`} `
        `let activeSession = window.localStorage.getItem('activeSession');`
        
        `if (activeSession) {`
            `let response = await ajaxCaller(`
                `{token: activeSession}, `
                `'GET', '/authenticator/ajax_decode_token'`
            `)`
            
            
            `if (response.expireAt !== undefined) {`
                
                `const dateNow = new Date()`
                `const expireAt = new Date(response.expireAt)`
                
                `if (expireAt > dateNow) {`
                    `return true`
                `} else {`
              
                    `window.localStorage.removeItem('activeSession')    `
                `}`
            `}`
            
            
        `} else {`
            
            `return false;`
        `}`
    `}`


`### doLogin`
`The doLogin function will post the login credentials (username and password) to the backend. If the login is successful we store the returned authentication credentials as activeSession variable in the browser localstorage. The most important bit of information in the token is the expireAt time variable – this determines how long we want the session to live.`

`let doLogin = async () => {`
 
        `let result = await ajaxCaller(`
			`{username: $('#userName').val(), password: $(‘#password’)}, `
			`'POST', `
			`'/login/authenticate'`
	    `)`
            `.then((r) => {`

                `window.localStorage.setItem('activeSession', r.token)`
                
            `}).catch(() => {`
                `return false`
            `})`

        `return result;`
    `}`

### Browser localStorage
This is a read-only property of the window interface and it allows access to the Storage object of the Document’s origin. We used the variables stored there to keep track of whether the user has logged in and also their last location in the app.

To save a variable:

`window.localStorage.setItem('activeSession', r.token)`

To remove a variable:

`window.localStorage.removeItem('activeSession') ` 

NB: no need to specify the window object. It was just used to indicate the complete object location.
       
### Database
The app needs only one table called the user table for now. This will store the login and user details for the app. The structure is as follows: 
Basic Table structure
User
	id: Integer(11)
	username: String(16)
	password: String(64)
	role: String(10)
	status: String(10)

     
### Models
The User model is the only model we will be creating for the app.
We will generate this model with the following command:
$ bin/rails generate model User username:string password:string role:string status:string

Migration
$ bin/rails db:migrate

Let us add more user information like the user’s first and last names to the user table.

$ bin/rails generate migration AddFirstLastNameToUsers first_name:string last_name:string

This will create a date time stamped migration file in the db/migrate folder of the app, e.g. db/migrate/YYYYMMDDHHMMSS_add_first_nam_last_name_to_users.rb.

The file should look like so:

`class AddFirstLastNameToUsers < ActiveRecord::Migration[5.2]`
  `def change`
    `add_column :users, :first_name, :string`
    `add_column :users, :last_name, :string`
  `end`
`end`
     
Now we run:
$ bin/rails db:migrate

This will update our database user table. We can view our db structure by using DB Browser for SQLite see figure 1.7 below:


![image](https://user-images.githubusercontent.com/5231114/204144337-a1747289-4e15-46aa-a05b-0937b8f774bc.png)













Figure 1.7 DB Table Structure

Note that the id, created_at and updated_at fields were created for us by Active Records migration.

### Seeding
Since we are actually not creating a registration form, let us seed the db with some user data. This will aid development and testing convienient as we can always destroy the database and recreate it with the seed data. We want to add 4 users to the database for testing, feel free to add more. So let us do so by adding the following lines to the db/seeds.rb file.


`require 'bcrypt'`
`include BCrypt`
`pw = BCrypt::Password.create("password123!?")`
`users = [{'first_name' => 'Normal', 'last_name' => 'User',  'role' => 'user'},`
   `{'first_name' => 'Adman', 'last_name' => 'Usera',  'role' => 'admin'}, `
   `{'first_name' => 'Regular', 'last_name'=>  'User', 'role' => 'user'},`
   `{'first_name' => 'Joe', 'last_name' => 'Bloggs', 'role' => 'super'}`
`]`

`users.each do |user|`
    `User.create(username: user['first_name']`
    `.downcase().concat('_').concat(user['last_name'].downcase()), `
    `password: pw, first_name: user['first_name'], `
    `last_name: user['last_name'], role: user['role'], status: "Active")`
`end`


Note: We could have used a migration to seed the database too, so the code above will equally work in a migration file. The advantage of using migration over seeding is that a migration can be rolled back. Whilst seeding will repopulate the same data again (unless changed).

Now run:
$ bin/rails db:seed


### Landing Page
Access Controlled Areas
Index page is the default page where we first try to prompt the user to login. If they decide not to login we just show them default content. If they do login successfully we redirect them to their last viewed page (lastPage), if they do not have a lastPage, they are shown their main/console page.

Note you have to change the lastPage session variable to the current view page whenever the page is new page (current) is loaded. This can be done in the document ready function of the page. For example:

localStorage.setItem(‘lastPage’, <currentPage>)

Where  <currentPage> = windows.location.href.

## Summary

In this article we described how to integrate and use different programming language frameworks and libraries to create a simple RBAC system to control the landing page for a user. 

The app’s backend was created using Ruby on Rails MVC system 
We also created a user database table to store, authenticate and perform the role of the user access control.

The front end was created with Jquery (ajax calls) and Jquery-UI (dialogs) libraries. We used the browser windows local storage to keep the app session aware by storing a token.

We used Json Web Tokens to sign and decode the session variables.

The aim was to demonstrate how all these disparate technologies can work together and by no means the only way, that is to say there are many other approaches.

Remember this is just a demonstration of an approach to creating a simple RBAC system and the techniques used here will work for other application domains. 

Lastly, I want to thank me for making sure I write this and you for reading it.

Github:
https://github.com/vinxus/rbac_app

## References:

* https://guides.rubyonrails.org/
* https://jquery.com/
* https://jqueryui.com/dialog/
* https://github.com/jwt/ruby-jwt
* https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
