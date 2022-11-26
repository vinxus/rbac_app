class AuthenticatorController < ApplicationController
        # POST /signed_token.json
        def ajax_sign_token
            puts params
            @response = {'token' => token}
            render json: @response
        end
    
        # GET /signed_token.json
        def ajax_decode_token
            @response = {
                'payload' => payload[0], 
                'algo' => payload[1], 
                'expireAt' => DateTime.new(2022,11,14,15,0,0)
            }
            render json: @response
        end
        private
        def token
            token = JWT.encode params, nil, false
        end    
        def payload
            payload = JWT.decode params[:token], nil, false
        end
end
