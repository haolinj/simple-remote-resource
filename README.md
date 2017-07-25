# simple-remote-resource

Example usage for dispatching an action to GET a remote resource.
~~~~
dispatch(apiActions.get({
    path: 'flights',
    resourceKey: 'allFlights', // this is the key to store flights in the store, accessible as remoteResources.allFlights.
    id: '1',
    options: {
        credentials: 'same-origin'
    },
    responseTransformer: function (response) {
        return response.result;
    }
}));
~~~~
