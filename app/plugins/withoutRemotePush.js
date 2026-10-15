// The app only schedules local reminders on the phone; it never receives push notifications from a server.
// expo-notifications adds Apple's push entitlement by default, so remove it: no push capability to review,
// and no push key to manage.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutRemotePush(config) {
  return withEntitlementsPlist(config, mod => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
};
