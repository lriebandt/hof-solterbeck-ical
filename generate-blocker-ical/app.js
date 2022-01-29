const ical = require('ical-generator')
const moment = require('moment')
var AWS = require('aws-sdk');

async function putObjectToS3(bucket, key, data){
    var s3 = new AWS.S3();
        var params = {
            Bucket : bucket,
            Key : key,
            Body : data,
            ACL: 'public-read'
        }
        await s3.putObject(params).promise()
}

const createEarlyBookerBlocker = (calendar) => {
    calendar.createEvent({
        start: moment().add(3, 'month'),
        end: moment().add(13, 'month'),
        summary: 'Frühbucher-Blocker',
        description: 'Blockiert für Frühbucher',
    });
}

const createSummerHolidaysBlockers = (calendar) => {
    const currentYear = moment().year()
    calendar.createEvent({
        start: moment([currentYear, 5, 1]),
        end: moment([currentYear, 7, 31]),
        summary: 'Sommerferien-Blocker',
        description: 'Blockiert Juli und August (Sommerferien)',
    })
    calendar.createEvent({
        start: moment([currentYear + 1, 5, 1]),
        end: moment([currentYear + 1, 7, 31]),
        summary: 'Sommerferien-Blocker nächstes Jahr',
        description: 'Blockiert Juli und August (Sommerferien) im nächsten Jahr',
    })
}

const createChristmasBlockers = (calendar) => {
    const currentYear = moment().year()
    calendar.createEvent({
        start: moment([currentYear, 11, 17]),
        end: moment([currentYear + 1, 0, 7]),
        summary: 'Weihnachts-Blocker',
        description: 'Blockiert Weihnachten',
    })
    calendar.createEvent({
        start: moment([currentYear + 1, 11, 17]),
        end: moment([currentYear + 2, 0, 7]),
        summary: 'Weihnachts-Blocker nächstes Jahr',
        description: 'Blockiert Weihnachten im nächsten Jahr',
    })
}

let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        const calendar = ical({name: 'Hof Solterbeck Blocker'});

        createEarlyBookerBlocker(calendar)
        createSummerHolidaysBlockers(calendar)
        createChristmasBlockers(calendar)

        await putObjectToS3('hof-solterbeck-ical', 'blocker.ical', calendar.toString())    

        return {
            'statusCode': 200,
            'body': calendar.toString()
        }
    } catch (err) {
        console.log(err)
        return {
            'statusCode': 500,
            'body': err
        }
    }

};
