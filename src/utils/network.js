const checkConnectivity = async () => {
    try {
        const netInfoModule = require('@react-native-community/netinfo');
        const NetInfo = netInfoModule?.default || netInfoModule;
        if (!NetInfo || typeof NetInfo.fetch !== 'function') {
            throw new Error('NetInfo.fetch is not a function or module is undefined');
        }
        const state = await NetInfo.fetch();
        return !!(state.isConnected && state.isInternetReachable);
    } catch (error) {
        console.warn('[Network] NetInfo native module is not available yet. Defaulting to connected (true) for development/testing.', error.message);
        // Default to true in development to avoid blocking database queries when netinfo is not yet compiled
        return true;
    }
};
export default checkConnectivity;