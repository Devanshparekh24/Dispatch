import React, { useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const BottomSheet = forwardRef(({ children, snapPoints = ['25%', '50%'], onChange }, ref) => {
    const bottomSheetModalRef = useRef(null);

    const handlePresent = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleDismiss = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const handleSheetChanges = useCallback((index) => {
        console.log('BottomSheet index:', index);
        if (onChange) {
            onChange(index);
        }
    }, [onChange]);

    // Block dismissal triggered outside our control (Android back button, etc.)
    const handleDismissAttempt = useCallback(() => {
        requestAnimationFrame(() => {
            bottomSheetModalRef.current?.present();
        });
    }, []);

    // expose methods to parent
    useImperativeHandle(ref, () => ({
        present: handlePresent,
        dismiss: handleDismiss,
    }));

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            onChange={handleSheetChanges}
            onDismiss={handleDismissAttempt}
            snapPoints={snapPoints}
            index={0}
            enablePanDownToClose={false}
        >
            <View style={styles.contentContainer}>
                {children}
            </View>
        </BottomSheetModal>
    );
});

export default BottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
    },
});