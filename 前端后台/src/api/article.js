import request from '@/utils/request'

export function fetchList(skip, limit, sort) {
  const query = {
    skip,
    limit,
    sort
  }
  return request({
    url: '/conferences/list',
    method: 'get',
    query
  })
}

export function fetchArticle(id) {
  const data = {
    id
  }
  return request({
    url: '/conferences/detail',
    method: 'post',
    data
  })
}

export function createArticle(data) {
  return request({
    url: '/conferences/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/conferences/update',
    method: 'post',
    data
  })
}

export function getParticipants(id) {
  return request({
    url: 'conferences/getParticipants/:${id}',
    method: 'get'
  })
}
