import * as React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Appbar } from "react-native-paper";

import ExampleList, { examples } from "./ExampleList";

export type RootStackParamList = {
  ExampleList: undefined;
} & {
  [K in keyof typeof examples]: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Root() {
  return (
    <View style={styles.stackWrapper}>
      <Stack.Navigator
        screenOptions={{
          header: ({ navigation, route, options, back }) => (
            <Appbar.Header elevated>
              {back ? (
                <Appbar.BackAction onPress={navigation.goBack} />
              ) : null}
              <Appbar.Content title={options.title ?? route.name} />
            </Appbar.Header>
          ),
        }}
      >
        <Stack.Screen
          name="ExampleList"
          component={ExampleList}
          options={{
            title: "Examples",
          }}
        />

        {(Object.keys(examples) as Array<keyof typeof examples>).map((id) => (
          <Stack.Screen
            key={id}
            name={id}
            component={examples[id]}
            options={{
              title: examples[id].title,
              headerShown: id !== "themingWithReactNavigation",
            }}
          />
        ))}
      </Stack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  stackWrapper: {
    flex: 1,
    ...Platform.select({
      web: {
        overflow: "scroll",
      },
    }),
  },
});
