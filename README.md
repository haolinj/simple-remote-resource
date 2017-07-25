# simple-remote-resource

Example usage for dispatching an action to GET a remote resource.
~~~~
dispatch(apiActions.get({
    path: 'flights',
    resourceKey: 'menu',
    id: '1',
    options: {
        credentials: 'same-origin'
    },
    responseTransformer: function (response) {
        return response.result;
    }
}));
~~~~
