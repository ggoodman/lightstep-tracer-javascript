
const aws = require('aws-sdk');
const lambda = new aws.Lambda({
    region: 'us-east-1'
});

export default class TransportLambdaProxy {

    constructor() {
        this._host = '';
        this._port = 0;
        this._path = '';
        this._encryption = '';
    }

    ensureConnection(opts) {
        this._host = opts.collector_host;
        this._port = opts.collector_port;
        this._path = opts.collector_path;
        this._encryption = opts.collector_encryption;
        this._lambda = opts.lambda_proxy;
    }

    invoke(event) {
        return lambda.invoke({
            FunctionName: this._lambda,
            Payload: JSON.stringify(event, null, 2)
        })
        .promise();
    }

    report(detached, auth, report, done) {
        let headers = {
            'LightStep-Access-Token': auth.access_token,
            'Content-Type': 'application/json'
        };
        let body = report;
        let protocol = (this._encryption === 'none') ? 'http' : 'https';
        let url = `${protocol}://${this._host}:${this._port}${this._path}/api/v0/reports`;

        this.invoke({ body, url, headers })
            .then((resp) => done(null, resp))
            .catch((err) => done(err, null));

        return done(null, resp);
    }
}
