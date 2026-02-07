// Navigation + Google Maps API integration.
// This MVP exposes start/stop hooks with stubs so the UI and speech flows work.

export const startNavigation = async (): Promise<void> => {
  // TODO: Integrate Google Maps Directions API and device location.
  //  - Request foreground location permissions
  //  - Subscribe to position changes
  //  - Query directions and emit spoken turn-by-turn instructions
};

export const stopNavigation = async (): Promise<void> => {
  // TODO: Unsubscribe from location updates and clear any navigation state.
};

