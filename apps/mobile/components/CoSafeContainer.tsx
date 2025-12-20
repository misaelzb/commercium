import {
  NativeSafeAreaViewProps,
  SafeAreaView,
} from "react-native-safe-area-context";

export const CoSafeContainer: React.FC<NativeSafeAreaViewProps> = ({
  children,
  ...props
}) => {
  return (
    <SafeAreaView
      style={{
        paddingLeft: 12,
        paddingRight: 12,
        flex: 1,
      }}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
};
