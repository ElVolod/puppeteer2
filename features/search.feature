Feature: Movie Ticket Booking

  Background:
    Given I am on the cinema homepage

  Scenario Outline: Successful ticket booking
    When I select day <dayIndex>, movie "<movie>" and time "<time>"
    And I book any available seat
    Then I should see the confirmation text "Вы выбрали билеты:"

    Examples:

      | dayIndex | movie                                        | time  |
      | 0        | Достать ножи постер                          | 23:59 |
      | 1        | Need for Speed: Жажда скорости (2014) постер | 12:00 |

  Scenario: Seat blocking after purchase
    When I select day 1, movie "Ведьмак постер" and time "17:00"
    And I buy a ticket for an available seat to get a QR code
    And I return to the same movie session
    And I select day 1, movie "Ведьмак постер" and time "17:00"
    Then this seat should be displayed as taken
    And the booking button should be disabled