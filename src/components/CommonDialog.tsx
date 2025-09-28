import React from "react";
import { StyleSheet, StyleProp, TextStyle, ViewStyle } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

type CommonDialogProps = {
    visible: boolean;
    onDismiss?: () => void;

    title?: string;
    subtitle?: string;

    bodyText?: string;
    children?: React.ReactNode;

    okText?: string;
    onOk?: () => void;

    cancelText?: string;
    onCancel?: () => void;
    showCancel?: boolean;

    loading?: boolean;
    isChildrenFirstContent?: boolean;
    bodyTextStyle?: StyleProp<TextStyle>;
    dialogStyle?: StyleProp<ViewStyle>;
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
    cancelText = "Cancel",
    showCancel = true,
    loading = false,
    isChildrenFirstContent = false,
    bodyTextStyle,
    dialogStyle,
}) => {
    const shouldShowActions = showCancel || onOk
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={[
                    {
                        elevation: 0,
                        shadowColor: "transparent",
                    },
                    dialogStyle,
                ]}>
                {/* Title */}
                {
                    title && (
                        <Dialog.Title>{title}</Dialog.Title>
                    )
                }

                <Dialog.Content>
                {isChildrenFirstContent && children}

                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {bodyText ? <Text style={[styles.body, bodyTextStyle]}>{bodyText}</Text> : null}

                {!isChildrenFirstContent && children}
                </Dialog.Content>

                {
                    shouldShowActions && (
                        <Dialog.Actions>
                            {
                                showCancel && (
                                    <Button onPress={onDismiss}>{cancelText}</Button>
                                )
                            }
                            {onOk && (
                                <Button loading={loading} disabled={loading} onPress={onOk}>{okText}</Button>
                            )}
                        </Dialog.Actions>
                    )
                }

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
        // marginTop: 4,
        // marginBottom: 12,
    },
});
