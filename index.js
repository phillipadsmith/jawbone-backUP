var fs = require('fs');

var access_token = process.env.ACCESS_TOKEN || '';
var client_secret = process.env.CLIENT_SECRET || '';

var up = require('jawbone-up')({
    access_token: access_token,
    client_secret: client_secret
});

// Fires for each up[type].get() request
function callback(err, body, type) {
    if(err) {
        console.log('Error: ' + err);
    }
    else {
        var data = JSON.parse(body).data;
        // Save the data
        save(data, type);
    }
}

// Save the date, passing the type for file naming
function save(data, type) {
    var items = data.items;
    items.forEach(function(item) {
        // Get a sensible date for the file name
        var moveDate = new Date(0);
        moveDate.setUTCSeconds(item.time_completed);
        var filename = type + '-' + moveDate.toISOString().replace(/T.*$/, '.json');
        var content  = JSON.stringify(item);
        // Output the item to a type & date-specific file
        fs.writeFile('data/' + filename, content, function (err) {
            if (err) throw err;
            console.log('Saved: ' + filename);
        });
    });
    // If there's more data, let's get it
    if ( data.links ) {
        var next = data.links.next;
        var token = next.replace(/.*page_token=(\d+).*/, '$1');
        get_another_page(token, type);
    }
}

function get_another_page(token, type) {
    up[type].get({
        "page_token": token
    }, function(err, body) {
        callback(err, body, type);
    });
}

// Types of data to backup
var data_types = ['moves', 'sleeps'];

// For each type, backup the data
data_types.forEach(function(type) { 
    up[type].get({}, function(err, body) {
        callback(err, body, type);
    });
});
