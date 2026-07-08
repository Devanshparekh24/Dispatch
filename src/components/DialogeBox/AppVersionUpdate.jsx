import React, { useEffect, useState } from 'react';
import { Linking, BackHandler } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import useAppVersion from '../../hooks/useAppVersion';

const AppVersionUpdate = () => {
    const [visible, setVisible] = useState(false);
    const { data: appVersionData, isLoading, error } = useAppVersion();


    const appUpdate = appVersionData?.[0];
    console.log("🚀 ~ AppVersionUpdate ~ appUpdate:", appUpdate)
    const currentVersion = DeviceInfo.getVersion();
    const serverVersion = appUpdate?.Version;

    useEffect(() => {
        if (Number(serverVersion) > Number(currentVersion)) {
            setVisible(true);
        }

    }, [serverVersion, currentVersion]);

    const handleUpdate = () => {
        if (appUpdate?.apk_url) {
            Linking.openURL(appUpdate.apk_url).catch(err => console.error("Couldn't load page", err));
        }
    };

    const handleExist = () => {
        setVisible(false);
        BackHandler.exitApp();
    };

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={handleExist} dismissable={false}>
                <Dialog.Title>Update Available</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">
                        A new version of Dispatch App.
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={handleExist}>
                        Exit
                    </Button>
                    <Button onPress={handleUpdate} mode="contained" style={{ marginLeft: 8 }}>
                        Update
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default AppVersionUpdate;
