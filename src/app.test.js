const app = require('./app')

test('Generate week rewards', () => {
    expect(app.genWeekRewards({ date: new Date('2021-02-02T00:00:00.000Z') })).toEqual({
        "2021-01-31T00:00:00.000Z": {
            "availableAt": "2021-01-31T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-01T00:00:00.000Z"
        },
        "2021-02-01T00:00:00.000Z": {
            "availableAt": "2021-02-01T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-02T00:00:00.000Z"
        },
        "2021-02-02T00:00:00.000Z": {
            "availableAt": "2021-02-02T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-03T00:00:00.000Z"
        },
        "2021-02-03T00:00:00.000Z": {
            "availableAt": "2021-02-03T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-04T00:00:00.000Z"
        },
        "2021-02-04T00:00:00.000Z": {
            "availableAt": "2021-02-04T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-05T00:00:00.000Z"
        },
        "2021-02-05T00:00:00.000Z": {
            "availableAt": "2021-02-05T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-06T00:00:00.000Z"
        },
        "2021-02-06T00:00:00.000Z": {
            "availableAt": "2021-02-06T00:00:00.000Z",
            "redeemedAt": null,
            "expiresAt": "2021-02-07T00:00:00.000Z"
        }
    })
})