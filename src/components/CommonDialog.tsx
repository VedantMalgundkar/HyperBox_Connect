import React from "react";
import { StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

type CommonDialogProps = {
    visible: boolean;
    onDismiss?: () => void;

    title: string;
    subtitle?: string;

    bodyText?: string;
    children?: React.ReactNode;

    okText?: string;
    onOk?: () => void;

    cancelText?: string;
    onCancel?: () => void;
};

export const CommonDialog: React.FC<CommonDialogProps> = ({
    visible,
    onDismiss,
    title,
    subtitle,
    bodyText,
    children,
    okText = "OK",
    onOk,
    cancelText = "Cancel"
}) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={{
                elevation: 0,
                shadowColor: "transparent",
            }}>
                {/* Title */}
                <Dialog.Title>{title}</Dialog.Title>

                <Dialog.Content>
                    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                    {bodyText ? <Text style={styles.body}>{bodyText}</Text> : null}
                    {children}
                </Dialog.Content>

                <Dialog.Actions>
                    <Button onPress={onDismiss}>{cancelText}</Button>
                    {onOk && (
                        <Button onPress={onOk}>{okText}</Button>
                    )}
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    subtitle: {
        marginBottom: 8,
        opacity: 0.7,
    },
    body: {
        marginTop: 4,
        marginBottom: 12,
    },
});
