import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { BackButton } from '@components/common/BackButton';
import { PrimaryButton } from '@components/common/PrimaryButton';
import { RootStackParamList } from '@navigation/AppNavigator';
import { useAppTheme } from '@contexts/ThemeContext';
import { useSpeech } from '@contexts/SpeechContext';
import { scanTextFromImage } from '@services/ocr';
import { saveScan } from '@services/firebase';

type Props = NativeStackScreenProps<RootStackParamList, 'OCR'>;

export const OCRScreen: React.FC<Props> = () => {
  const { theme } = useAppTheme();
  const { speak } = useSpeech();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      requestPermission();
    } else if (!permission.granted) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      speak('Camera permission is required to read text.');
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      speak('Text reader. Point to the text and tap read.', { interrupt: true });
    }
  }, [permission, requestPermission, speak]);

  const showCamera = permission?.granted;

  const handleScan = async () => {
    if (!cameraReady) return;
    // Placeholder: in a real implementation, capture a frame or use takePictureAsync
    const text = await scanTextFromImage(null);
    setRecognizedText(text);
    await speak(text || 'No text detected', { interrupt: true });
    if (text) {
      await saveScan({
        type: 'text',
        content: text,
        createdAt: Date.now()
      });
    }
  };

  return (
    <ScreenContainer style={{ padding: 0 }}>
      <View style={styles.container}>
        <View style={styles.backButtonWrapper}>
          <BackButton />
        </View>
        {showCamera ? (
          <CameraView
            style={styles.camera}
            facing="back"
            onCameraReady={() => setCameraReady(true)}
          />
        ) : (
          <View style={[styles.camera, styles.cameraFallback]}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>
              Waiting for camera permission...
            </Text>
          </View>
        )}

        <View style={styles.bottomPanel}>
          <PrimaryButton label="Read Text" onPress={handleScan} accessibilityLabel="Read text" />
        </View>

        {recognizedText ? (
          <View style={styles.textOverlay} accessible accessibilityLabel={recognizedText}>
            <ScrollView>
              <Text style={{ color: theme.colors.text, fontSize: 16 }}>{recognizedText}</Text>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden'
  },
  camera: {
    flex: 1
  },
  cameraFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24
  },
  textOverlay: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    maxHeight: 200,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 12
  },
  backButtonWrapper: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 10
  }
});

