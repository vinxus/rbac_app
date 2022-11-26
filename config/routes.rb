Rails.application.routes.draw do
  get 'home/index'
  get 'home/admin'
  get 'home/user'
  get 'home/login'
  post 'authenticate' => 'home#authenticate'

  post 'authenticator/ajax_sign_token'
  get 'authenticator/ajax_decode_token'

  root 'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
