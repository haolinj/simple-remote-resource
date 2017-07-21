# simple-remote-resource

apiActions.get({
      path: 'current-vendor',
      resourceKey: 'menu',
      id: 'current-menu',
      options: {
        credentials: 'same-origin'
      },
      responseTransformer: function (response) {
        return response.result;
      }
    })
