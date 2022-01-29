'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

var AWS = require('aws-sdk');
var sinon = require('sinon');

const putObjectStub = AWS.S3.prototype.putObject = sinon.stub();
putObjectStub.withArgs(sinon.match.any).returns({
  promise: () => {}
})

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        const calenderText = result.body
        console.log(calenderText)

        expect(calenderText).satisfy(data => data.startsWith('BEGIN:VCALENDAR') && data.endsWith('END:VCALENDAR'))
    
    }); 
});
