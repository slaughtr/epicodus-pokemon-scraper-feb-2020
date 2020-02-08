// nodejs implementation of the browser fetch library
const fetch = require('node-fetch');
// jQuery-based DOM parser
const cheerio = require('cheerio');
// NOTE: aws-sdk comes pre-loaded in Lambda env, so --save-dev it!
const AWS = require('aws-sdk');
// I recommend using the DocumentClient over the default DynamoDB APIs
// This is to avoid messing with DynamoDB types.
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html
const docClient = new AWS.DynamoDB.DocumentClient();

// default Lambda handler type
exports.handler = async event => {
    const response = {
        // I set statusCode to something nonsensical to prevent auto-sending a 200 in weird cases
        statusCode: 123,
        body: null
    }

    // Destructure the sent in value
    const { name = null } = event.queryStringParameters;
    // Boolean to determine if pokemon was in DynamoDB
    const dataExists = false;

    const pokemonData = {
        name: null,
        number: null,
        type: null,
        catch_rate: null
    }

    try {
        try {
            var params = {
                TableName: 'pokemonData',
                Key: { name: name }, // Our table's primary key
                AttributesToGet: ['name', 'number', 'catch_rate', 'type']
            };

            // Use AWS's provided .promise() instead of callbacks
            const data = await docClient.get(params).promise();
            const pokemon = data.Item;

            if (pokemon !== null) dataExists = true;
            response.data = pokemon;
        } catch (err) {
            console.error(err);
            console.log('Not in database');
            // This error will bubble up to the outer catch
            throw new Error(err);
        }

        if (!dataExists) {
            const url = `https://bulbapedia.bulbagarden.net/wiki/${name}_(Pok%C3%A9mon)`;
            const page = await fetch(url);
            // Should probably do a check here to make sure the page loaded
            // fetch APIs return promises so await our actual text
            const pageText = await page.text();
            // The dreaded dollar sign
            const $ = cheerio.load(pageText);

            // Selectors retrieved from the page via Chrome dev tools
            const nameSelector = '#mw-content-text > table:nth-child(2) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > td > table > tbody > tr > td:nth-child(1) > big > big > b';
            const numberSelector = '#mw-content-text > table:nth-child(2) > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(1) > th > big > big > a > span';
            const firstTypeSelector = '#mw-content-text > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td:nth-child(1) > a > span > b';
            const catchRateSelector = '#mw-content-text > table:nth-child(2) > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr > td > small > span';

            // Hey look jQuery has a .text(), too
            pokemonData.name = $(nameSelector).text();
            pokemonData.number = $(numberSelector).text();
            pokemonData.type = $(firstTypeSelector).text();
            pokemonData.catch_rate = $(catchRateSelector).text();
            
            // Make sure we're returning the values we just got to the user.
            response.body = pokemonData

            // NOTE: Didn't get to saving during presentation, so this is untested, but should work just fine
            const putParams = {
                TableName: 'pokemonData',
                Item: pokemonData
            };

            // You can also use .update(), as it creates an item if it doesn't exist (usually called an upsert)
            await docClient.put(putParams).promise();
        }

        // If we don't return this browsers will be real confused
        response.statusCode = 200;

    } catch (err) {
        response.statusCode = 503;
        response.body = 'ERROR';
        console.error(err);
    }

    // You have to return a string for the body
    response.body = JSON.stringify(response.body);

    // Just return like a normal function and you're done.
    return response;
}