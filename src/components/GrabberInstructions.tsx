import React from "react";
import { View } from "react-native";
import { Text as PaperText } from "react-native-paper"; // adjust import if needed
import { extractHostFromUrl } from "../utils/helper"; // adjust path
import { commonStyles } from "../styles/common";
import { useTheme } from "react-native-paper";

interface GrabberInstructionsProps {
  baseUrl: string | null;
  protoPort?: number;
}

export const GrabberInstructions: React.FC<GrabberInstructionsProps> = ({
  baseUrl,
  protoPort,
}) => {
    const theme = useTheme();
  return (
    <>

    <View
    style={{
      backgroundColor: theme.colors.secondaryContainer,
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: "column",
      gap: 15,
    }}
  >
    {baseUrl && (
        <View>
          <PaperText
            style={{
              fontSize: 14,
              marginBottom: 3,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Hyperion Host :
          </PaperText>
          <PaperText style={{ fontSize: 16, paddingLeft: 3 }}>
            {extractHostFromUrl(baseUrl)}
          </PaperText>
        </View>
      )}

      {protoPort && (
        <View>
          <PaperText
            style={{
              fontSize: 14,
              marginBottom: 3,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Hyperion Protobuf Port :
          </PaperText>
          <PaperText style={{ fontSize: 16, paddingLeft: 3 }}>
            {protoPort}
          </PaperText>
        </View>
      )}

</View>
      <View style={[commonStyles.column, { gap: 5 }]}>
        {[
          "• Open the Hyperion Grabber app on your TV.",
          "• Tap the three dots to open Settings.",
          "• Enter the Host and Port shown above.",
          "• Tap Connect to finish setup.",
        ].map((text, index) => (
          <PaperText key={index} style={{ fontSize: 13 }}>
            {text}
          </PaperText>
        ))}
      </View>
      
    </>
  );
};
