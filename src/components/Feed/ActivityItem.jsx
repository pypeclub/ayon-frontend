import React from 'react'
import ActivityComment from './ActivityComment'

const ActivityItem = ({ users, activity, entityType }) => {
  switch (activity.activityType) {
    case 'comment':
      return <ActivityComment activity={activity} users={users} entityType={entityType} />
    case 'status.change':
      return <ActivityComment activity={activity} users={users} entityType={entityType} />
    case 'assignee.add':
      return <ActivityComment activity={activity} users={users} entityType={entityType} />
    case 'assignee.remove':
      return <ActivityComment activity={activity} users={users} entityType={entityType} />

    default:
      return null
  }
}

export default ActivityItem