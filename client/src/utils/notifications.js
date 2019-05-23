import propertyOf from 'lodash/propertyOf';
import includes from 'lodash/includes';

export default (user, notificationTypes, resourceType) => {
  const notifications = propertyOf(user)('notifications');
  if (!Array.isArray(notifications)) {
    return [];
  }
  let resourceTypes = ['course', 'room'];

  if (resourceType === 'course' || resourceType === 'room') {
    resourceTypes = [resourceType];
  }

  if (Array.isArray(notificationTypes)) {
    return notifications.filter(notification => {
      return (
        includes(notificationTypes, notification.notificationType) &&
        includes(resourceTypes, notification.resourceType)
      );
    });
  }

  // @TODO RIGHT NOW ONLY THE myVMT PAGE IS USING HTIS METHOD...WHEN WE USE IT IN ROOM AND COURSE WE'LL NEED TO IMPLEMENT THE PAGE_CHECK
  // SO THAT IF WE'RE ON myVMT AND A ROOM NOTIFICATION HAS A PARENT RESOURCE, WE SHOULD DISPLAY IT ON THE COURSE
  if (resourceType === 'course' || resourceType === 'room') {
    return notifications.filter(notification => {
      if (notification.parentResource) {
        return resourceType === 'course';
      }
      return notification.resourceType === resourceType;
    });
  }

  return [];
};
