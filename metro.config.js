const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        resolveRequest: (context, moduleName, platform) => {
            if (moduleName === '@tanstack/react-query') {
                return context.resolveRequest(
                    context,
                    '@tanstack/react-query/build/legacy/index.js',
                    platform
                );
            }
            if (moduleName === '@tanstack/query-core') {
                return context.resolveRequest(
                    context,
                    '@tanstack/query-core/build/legacy/index.js',
                    platform
                );
            }
            return context.resolveRequest(context, moduleName, platform);
        },
    },
};

const mergedConfig = mergeConfig(defaultConfig, config);

module.exports = withNativeWind(mergedConfig, { input: './global.css' });
