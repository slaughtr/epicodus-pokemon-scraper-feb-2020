# Pokemon Scraper

> This is from a live coding presentation at Epicodus Seattle, on Feb 05, 2020

# Instructions

You will need an AWS account to run this - everything here qualifies for the free tier. You will also need the AWS CLI installed and configured for your account. [You can find instructions for this here.](https://aws.amazon.com/cli/).

1. Login to the AWS console.
2. In the `Find Services` bar, type in `DynamoDB`
3. Hit the big `Create table` button.
4. Name your table `pokemonData` with a primary key of `name`
    * If you'd like to change the table name or primary key, you will need to update the code to match.
5. For testing, I recommend unticking the `Use default settings` checkbox, turning off autoscaling, and changing both read and write capacity units to 1.
6. Hit `Create` down at the bottom. Done with Dynamo!
7. Click the big `Services` dropdown in the header, type in `Lambda` hit enter.
8. Hit the `Create function` button.
9. Name your function `getPokemonData`, ensure the Node runtime is selected, and choose to `Create a new role with basic Lambda permissions`
    * If you'd like to name your function something else, you will need to change the `--function-name=getPokemonData` value in the `deploy` script in `package.json`
10. Hit `Create function`. On the Lambda's page, scroll down to `Basic settings` and hit `Edit`. Change the timeout to 10 seconds and `Save` 
   * EDIT: right about here is where you'd want to run `npm run deploy` in the `/src` dir of this repo to get the code the Lambda function.
11. Back on the Lambda's page, find the `Execution role` section, and click the link to `View the (role name here) role`.
12. On the role's page, click `Attach policies`. On the next page search for dynamo and select the `AmazonDynamoDBFullAccess` policy, then click `Attach policy`.
    * In an actual production app you would want to craft a more specific role to lock down access, but that is outside the scope of this README.
13. In the `Services` dropdown, search for `API Gateway` and go to it's page. 
14. Select to `Build` a `REST API` - make sure not to select the private one or you won't be able to access it!
15. Select `New API`, name your API whatever you'd like, and select `Regional` for the Endpoint Type. Hit `Create API`
16. On the next page, your API will only have a `/` route - this is fine. Make sure it's selected, and in the `Actions` dropdown select `Create Method`. This will create a dropdown under your `/` route. Select `ANY` in this dropdown and then hit the check that appears next to it.
17. In the Setup pane, select `Lambda Function` and tick the `Use Lambda Proxy Integration` checkbox. Type your Lambda name into the `Lambda Function` field - it should appear. If it doesn't just put _exactly_ your Lambda's name into the box and it'll still work. Now hit `Save` and click `OK` on the popup.
18. Now in the `Actions` dropdown select `Deploy API`. Select `New Stage` for the Deployment stage and give it a name - usually `v0` or `get` are used. You can name it whatever you'd like, just remember it. Now hit `Deploy`.
19. Copy the `Invoke URL` - usually something like `https://jfweiojf8.execute-api.us-west-2.amazonaws.com/v0` - this is your API's URL!
20. Now you can test it by putting that URL into your browser (or API tool of choice) and adding the `name` query string IE `....com/v0?name=Bulbasaur`

If that all worked, you should see something like this in your browser:
```json
{"name":"Bulbasaur","number":"#001","type":"Grass","catch_rate":"11.9%"}
```
