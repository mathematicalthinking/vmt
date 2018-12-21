
import propertyOf from 'lodash/propertyOf';
import includes from 'lodash/propertyOf';


  export const getUserNotifications = (user, notificationTypes, resourceType ) => {
    let notifications = propertyOf(user)('notifications');
    if (!Array.isArray(notifications)) {
      return [];
    }
    let resourceTypes = ['course', 'room'];

    if (resourceType === 'course' || resourceType === 'room') {
      resourceTypes = [resourceType];
    }

    if (Array.isArray(notificationTypes)) {
      return notifications.filter((notification => {
        return includes(notificationTypes, notification.notificationType) && includes(resourceTypes, notification.resourceType);
      }))
    }

    if (resourceType === 'course' || resourceType === 'room') {
      return notifications.filter((notification) => {
        return notification.resourceType === resourceType;
      });
    }

    return [];
  };
