import { createActions, handleActions } from 'redux-actions';
import fetchIt from 'fetch-it';
import { call, put, takeLatest } from 'redux-saga/effects';
import Immutable from 'immutable';

const baseUrl = '/qfx-api/v1';

let responseMiddleware = {
  response (res) {
    if (res.status >= 200 || res.status <= 299) {
      return res.json().catch((e) => {
        return e;
      });
    } else if (res.status === 401) {
      Dispatcher.publish('client:unauthenticated');
    } else {
      return new Error('Failed to GET, response status [' + res.status + '].');
    }
  }
};

fetchIt.addMiddlewares([responseMiddleware]);

// Actions Types

const GET = 'GET';
const LIST = 'LIST';
const CREATE = 'CREATE';
const UPDATE = 'UPDATE';
const DELETE = 'DELETE';
const PROCESSED_RESOURCE = 'PROCESSED_RESOURCE';

// APIs

function remoteGet (resource) {
  console.log('GET', resource);
  return fetchIt.get(`${baseUrl}/${resource.path}/${resource.id}`, {
    headers: resource.headers,
    ...resource.options
  });
}

function remoteList (resource) {
  console.log('LIST', resource);
  return fetchIt.fetch(`${baseUrl}/${resource.path}`, {
    method: 'GET',
    headers: resource.headers,
  }).then((res) => {
    if (res.status >= 200 || res.status <= 299) {
      return res.json().catch((e) => {
        return e;
      });
    }

    return new Error('Failed to LIST, response status [' + res.status + '].');
  });
}

function remoteCreate (resource) {
  console.log('CREATE', resource);
  return fetchIt.fetch(`${baseUrl}/${resource.path}`, {
    method: 'POST',
    headers: resource.headers,
    body: JSON.stringify(resource.body)
  }).then((res) => {
    if (res.status >= 200 || res.status <= 299) {
      return res.json().catch((e) => {
        return e;
      });
    }

    return new Error('Failed to CREATE, response status [' + res.status + '].');
  });
}

function remoteUpdate (resource) {
  console.log('UPDATE', resource);
  return fetchIt.fetch(`${baseUrl}/${resource.path}/${resource.id}`, {
    method: 'PUT',
    headers: resource.headers,
    body: JSON.stringify(resource.body),
    ...resource.options
  });
}

function remoteDelete (resource) {
  console.log('DELETE', resource);
  return fetchIt.fetch(`${baseUrl}/${resource.path}/${resource.id}`, {
    method: 'DELETE',
    headers: resource.headers,
  }).then((res) => {
    if (res.status >= 200 || res.status <= 299) {
      return res.json().catch((e) => {
        return e;
      });
    }

    return new Error('Failed to DELETE, response status [' + res.status + '].');
  });
}

// Actions

export const apiActions = createActions(
  GET,
  LIST,
  CREATE,
  UPDATE,
  DELETE,
  PROCESSED_RESOURCE
);

// Sagas

function* resource (action) {
  let response;
  switch (action.type) {
    case GET:
      response = yield call(remoteGet, action.payload);
      break;
    case LIST:
      response = yield call(remoteList, action.payload);
      break;
    case CREATE:
      response = yield call(remoteCreate, action.payload);
      break;
    case UPDATE:
      response = yield call(remoteUpdate, action.payload);
      break;
    case DELETE:
      response = yield call(remoteDelete, action.payload);
      break;
    default:
      response = new Error(`Unknown action type [${action.type}]`);
  }

  let transformedResponse = action.payload.responseTransformer(response);
  let resource = {
    key: action.payload.resourceKey,
    path: action.payload.path,
    content: transformedResponse,
    actionType: action.type,
    identifier: action.payload.id
  };

  if (action.payload.onCompleteActions) {
    var actionIndex = 0;
    while (actionIndex < action.payload.onCompleteActions.length) {
      yield put(action.payload.onCompleteActions[actionIndex]);
      actionIndex ++;
    }
  }

  yield put(apiActions.processedResource(resource));
}

export function* remoteResourceSaga () {
  yield [
    takeLatest(GET, resource),
    takeLatest(LIST, resource),
    takeLatest(CREATE, resource),
    takeLatest(UPDATE, resource),
    takeLatest(DELETE, resource)
  ];
}

// Reducers

export const remoteResources = handleActions({
  PROCESSED_RESOURCE: (state, action) => {
    if (action.error) {
      return Object.assign({}, state, { error: action.payload });
    } else {
      let resource = {};
      let { content, key, actionType, identifier } = action.payload;

      if (actionType === DELETE) {
        delete resource[key];
      } else {
        resource[key] = content;
      }

      return Object.assign({}, state, resource);
    }
  }
}, {});
