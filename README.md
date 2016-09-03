# voilab-send
Transactional mailer

## Basic usage

### Sendgrid V4
```js
var mailer = new (require('voilab-send'))({
    adapter: 'sendgrid-v4',
    adapterConfig: {
        apikey: 'your-api-key',
        globalDataSurround: '-'
    }
});

mailer.getAdapter()
    .setFrom('from@email.com')
    .addTo('to@email.co')
    .setSubject('A subject')
    .setHtml('<p>Hello -name-</p>')
    .addGlobalData('name', 'John');

mailer.send()
    .then(function () {
        console.log('mail is sent');
    })
    .catch(function (err) {
        console.log(err);
    });
```

Note that you'll need to add this dependency into your own `package.json`:

- `sendgrid` version `4.*`
