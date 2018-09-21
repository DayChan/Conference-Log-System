import request from '@/utils/request'

export function getUsers(skip, limit, sort) {
  const query = {
    skip,
    limit,
    sort
  }
  return request({
    url: '/users',
    method: 'get',
    query
  })
}

export function createUser(data) {
  return request({
    url: '/users/create',
    method: 'post',
    data
  })
}

export function updateUser(data) {
  return request({
    url: '/users/update',
    method: 'post',
    data
  })
}

export function getConfsByName(name) {
  const data = {
    username: name
  }
  return request({
    url: '/users/confs',
    method: 'post',
    data
  })
}

