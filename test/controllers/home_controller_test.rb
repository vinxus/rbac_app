require 'test_helper'

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get home_index_url
    assert_response :success
  end

  test "should get admin" do
    get home_admin_url
    assert_response :success
  end

  test "should get user" do
    get home_user_url
    assert_response :success
  end

  test "should get login" do
    get home_login_url
    assert_response :success
  end

end
